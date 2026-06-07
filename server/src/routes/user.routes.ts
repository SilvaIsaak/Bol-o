import { Router, type Request, type Response } from 'express';
import prisma from '../utils/prisma.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const router = Router();

const profileSchema = z.object({
  nome: z.string().trim().min(2).max(80),
  whatsapp: z.string().trim().min(10).max(20),
  pix: z.string().trim().max(100).optional().or(z.literal('')),
});

const predictionsSchema = z.object({
  champion: z.string().trim().max(60).optional().nullable(),
  scorer: z.string().trim().max(60).optional().nullable(),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6).max(128),
});

router.get('/me', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        whatsapp: true,
        pix: true,
        matricula: true,
        status: true,
        role: true,
        created_at: true,
        ...({
          campeao_aposta: true,
          artilheiro_aposta: true,
        } as any),
      },
    });
    return res.json({ success: true, data: user });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/previsoes-elite', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const parsed = predictionsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Dados de previsão inválidos' });
  }
  const { champion, scorer } = parsed.data;
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
        campeao_aposta: champion,
        artilheiro_aposta: scorer 
      } as any,
    });
    return res.json({ success: true, data: user });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/me', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Dados de perfil inválidos' });
  }
  const { nome, whatsapp, pix } = parsed.data;
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { nome, whatsapp, pix: pix || null },
    });
    return res.json({ success: true, data: user });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/change-password', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const parsed = passwordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Dados de senha inválidos' });
  }
  const { oldPassword, newPassword } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.senha_hash);
    if (!passwordMatch) {
      return res.status(400).json({ success: false, message: 'Senha antiga incorreta' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Nova senha deve ter pelo menos 6 caracteres' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { senha_hash: newPasswordHash }
    });

    return res.json({ success: true, message: 'Senha alterada com sucesso' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/pagamento', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  try {
    const pagamento = await prisma.pagamento.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
    return res.json({ success: true, data: pagamento });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/pagamento', authenticate, upload.single('comprovante'), async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
  }

  try {
    // Buscar o pagamento pendente criado no registro
    const pagamentoExistente = await prisma.pagamento.findFirst({
      where: { 
        user_id: userId,
        status: 'PENDENTE'
      },
      orderBy: { created_at: 'desc' }
    });

    let pagamento;
    if (pagamentoExistente) {
      pagamento = await prisma.pagamento.update({
        where: { id: pagamentoExistente.id },
        data: {
          comprovante_url: `/uploads/comprovantes/${req.file.filename}`,
          status: 'EM_ANALISE',
        },
      });
    } else {
      const config = await prisma.globalConfig.findFirst();
      const valor = config?.valor_inscricao || 70.0;
      pagamento = await prisma.pagamento.create({
        data: {
          user_id: userId,
          comprovante_url: `/uploads/comprovantes/${req.file.filename}`,
          status: 'EM_ANALISE',
          valor,
        },
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status: 'AGUARDANDO_APROVACAO' },
    });

    // Log auditoria
    await prisma.auditLog.create({
      data: {
        user_id: userId as string,
        acao: 'Envio de Comprovante',
        entidade: 'Pagamento',
        entidade_id: pagamento.id,
        payload: { arquivo: req.file.filename },
        ip_address: req.ip || null,
      },
    });

    return res.json({ success: true, data: pagamento });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
