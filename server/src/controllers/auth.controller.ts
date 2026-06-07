import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../utils/prisma.js';
import { sendWelcomeEmail } from '../services/email.service.js';
import { env } from '../utils/env.js';

const registerSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  whatsapp: z.string().min(10),
  cpf: z.string().min(11),
  senha: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string(),
});

export const register = async (req: Request, res: Response) => {
  try {
    const { nome, email, whatsapp, cpf, senha } = registerSchema.parse(req.body);

    const userExists = await prisma.user.findFirst({
      where: { OR: [{ email }, { cpf }] },
    });

    if (userExists) {
      res.status(400).json({ success: false, message: 'Usuário já cadastrado com este email ou CPF' });
      return;
    }

    const config = await prisma.globalConfig.findFirst();
    const valor = config?.valor_inscricao || 70.0;

    const senha_hash = await bcrypt.hash(senha, 12);

    const count = await prisma.user.count();
    const matricula = `BP2026-${(count + 1).toString().padStart(5, '0')}`;

    // Criar usuário e pagamento em uma transação
    const result = await (prisma as any).$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          nome,
          email,
          whatsapp,
          cpf,
          senha_hash,
          matricula,
          status: 'PENDENTE_PAGAMENTO',
          role: 'USER',
        },
      });

      // Simular geração de PIX (QR Code e Código Copia e Cola)
      const pixCode = `00020126360014BR.GOV.BCB.PIX0114${cpf}5204000053039865405${valor.toFixed(2)}5802BR5913BolaoCopa20266008BRASILIA62070503***6304ABCD`;
      const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCode)}`;

      const pagamento = await tx.pagamento.create({
        data: {
          user_id: user.id,
          valor,
          metodo: 'PIX',
          status: 'PENDENTE',
          pixCode,
          qrCode,
        },
      });

      return { user, pagamento };
    });

    // Auditoria
    await prisma.auditLog.create({
      data: {
        user_id: result.user.id as string,
        acao: 'Registro de Usuário com Cobrança PIX',
        entidade: 'User',
        entidade_id: result.user.id as string,
        ip_address: req.ip || null
      }
    });

    // Enviar email de boas-vindas (não trava o fluxo)
    sendWelcomeEmail(result.user.email, result.user.nome, result.user.matricula).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso. Efetue o pagamento para liberar o acesso.',
      data: {
        user: {
          id: result.user.id,
          nome: result.user.nome,
          email: result.user.email,
          matricula: result.user.matricula,
          status: result.user.status,
          role: result.user.role,
        },
        pagamento: {
          valor: result.pagamento.valor,
          pixCode: result.pagamento.pixCode,
          qrCode: result.pagamento.qrCode,
        }
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, senha } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(401).json({ success: false, message: 'Usuário ou senha incorretos' });
      return;
    }

    if (user.blocked_until && user.blocked_until > new Date()) {
      res.status(403).json({
        success: false,
        message: `Conta temporariamente bloqueada por excesso de tentativas. Tente novamente após ${user.blocked_until.toLocaleTimeString()}`,
      });
      return;
    }

    const senhaValida = await bcrypt.compare(senha, user.senha_hash);

    if (!senhaValida) {
      const attempts = user.login_attempts + 1;
      let blocked_until = null;

      if (attempts >= 5) {
        blocked_until = new Date(Date.now() + 15 * 60 * 1000); // 15 min
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { login_attempts: attempts, blocked_until },
      });

      res.status(401).json({ success: false, message: 'Usuário ou senha incorretos' });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { login_attempts: 0, blocked_until: null },
    });

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      env.REFRESH_SECRET,
      { expiresIn: '30d' }
    );

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Auditoria
    await prisma.auditLog.create({
      data: {
        user_id: user.id,
        acao: 'Login efetuado',
        entidade: 'User',
        entidade_id: user.id,
        ip_address: req.ip || null
      }
    });

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          whatsapp: user.whatsapp,
          role: user.role,
          status: user.status,
          matricula: user.matricula,
        },
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = (req.cookies?.refresh_token || req.body?.refreshToken) as string | undefined;

  if (!refreshToken || typeof refreshToken !== 'string') {
    res.status(401).json({ success: false, message: 'Refresh token não fornecido' });
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, env.REFRESH_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      res.status(401).json({ success: false, message: 'Usuário não encontrado' });
      return;
    }

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000,
    });

    res.json({ success: true, message: 'Token renovado com sucesso' });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Refresh token inválido' });
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.json({ success: true, message: 'Logout realizado com sucesso' });
};
