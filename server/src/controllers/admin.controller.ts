import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { sendStatusUpdateEmail } from '../services/email.service.js';

const logAudit = async (userId: string | null, acao: string, entidade: string, entidadeId: string, payload?: any, ip?: string) => {
  await prisma.auditLog.create({
    data: {
      user_id: userId,
      acao,
      entidade,
      entidade_id: entidadeId,
      payload: payload ? JSON.parse(JSON.stringify(payload)) : undefined,
      ip_address: ip || null,
    },
  });
};

const recalculatePrizes = async () => {
  const config = await prisma.globalConfig.findFirst();
  const activeUsersCount = await prisma.user.count({ 
    where: { 
      status: 'ATIVO',
      role: 'USER' // Apenas participantes pagantes entram na base de cálculo
    } 
  });
  
  const contribution = config?.valor_inscricao || 70.0;
  const operationalCost = config?.custo_operacional || 0.0;
  
  // Arrecadação líquida = (Inscrição - Custo) * Usuários
  const netRevenue = activeUsersCount * (contribution - operationalCost);

  const prizes = await prisma.premio.findMany({ where: { tipo: 'DINHEIRO' } });

  for (const prize of prizes) {
    if (prize.percentual) {
      const calculatedValue = (netRevenue * prize.percentual) / 100;
      await prisma.premio.update({
        where: { id: prize.id },
        data: { valor_calculado: calculatedValue },
      });
    }
  }
};

export const getUsuarios = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [usuarios, total] = await Promise.all([
      prisma.user.findMany({
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count()
    ]);

    res.json({ 
      success: true, 
      data: usuarios,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUsuarioStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const adminId = (req as any).user.userId;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ success: false, message: 'ID do usuário inválido' });
    return;
  }

  try {
    const oldUser = await prisma.user.findUnique({ where: { id } });
    const user = await prisma.user.update({
      where: { id },
      data: { status },
    });

    await logAudit(adminId, `Atualização de status para ${status.replace(/_/g, ' ')}`, 'Usuário', id, { de: oldUser?.status, para: status }, req.ip);

    if (status === 'ATIVO') {
      const jogosFuturos = await prisma.jogo.findMany({
        where: { data_hora: { gte: new Date() } },
      });

      for (const jogo of jogosFuturos) {
        await prisma.palpite.upsert({
          where: { user_id_jogo_id: { user_id: id, jogo_id: jogo.id } },
          update: {},
          create: {
            user_id: id,
            jogo_id: jogo.id,
            palpite_casa: 0,
            palpite_fora: 0,
          },
        });
      }

      await recalculatePrizes();
    }

    // Enviar email de notificação
    sendStatusUpdateEmail(user.email, user.nome, status).catch(console.error);

    res.json({ success: true, data: user, message: 'Status do usuário atualizado com sucesso' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUsuario = async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminId = (req as any).user.userId;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ success: false, message: 'ID do usuário inválido' });
    return;
  }

  try {
    const usuario = await prisma.user.findUnique({ where: { id } });

    if (!usuario) {
      res.status(404).json({ success: false, message: 'Usuário não encontrado' });
      return;
    }

    if (usuario.id === adminId) {
      res.status(400).json({ success: false, message: 'Você não pode excluir sua própria conta.' });
      return;
    }

    if (usuario.role === 'ADMIN') {
      res.status(403).json({ success: false, message: 'Não é permitido excluir contas administrativas.' });
      return;
    }

    await prisma.$transaction([
      prisma.palpite.deleteMany({ where: { user_id: id } }),
      prisma.pagamento.deleteMany({ where: { user_id: id } }),
      prisma.auditLog.deleteMany({ where: { user_id: id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    await logAudit(adminId, 'Exclusão de usuário', 'Usuário', id, { email: usuario.email, nome: usuario.nome }, req.ip);

    res.json({ success: true, message: 'Usuário removido com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDashboardMetrics = async (_req: Request, res: Response) => {
  try {
    const config = await prisma.globalConfig.findFirst();
    // Apenas conta usuários (participantes), ignora administradores
    const totalUsers = await prisma.user.count({ where: { role: 'USER' } });
    const activeUsers = await prisma.user.count({ 
      where: { 
        status: 'ATIVO',
        role: 'USER'
      } 
    });
    const pendingPayments = await prisma.pagamento.count({ 
      where: { 
        status: 'EM_ANALISE',
        user: { role: 'USER' }
      } 
    });
    
    const contribution = config?.valor_inscricao || 70.0;
    const operationalCostPerUser = config?.custo_operacional || 0.0;
    
    const totalRevenue = activeUsers * contribution;
    const totalOperationalCost = activeUsers * operationalCostPerUser;
    const netRevenue = totalRevenue - totalOperationalCost;

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        pendingPayments,
        totalRevenue,
        totalOperationalCost,
        netRevenue,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPagamentos = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [pagamentos, total] = await Promise.all([
      prisma.pagamento.findMany({
        include: { user: { select: { nome: true, matricula: true, id: true, email: true } } },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.pagamento.count()
    ]);

    res.json({ 
      success: true, 
      data: pagamentos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approvePagamento = async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminId = (req as any).user.userId;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ success: false, message: 'ID do pagamento inválido' });
    return;
  }

  try {
    const pagamento = await prisma.pagamento.update({
      where: { id },
      data: { 
        status: 'APROVADO', 
        approvedBy: adminId,
        approvedAt: new Date()
      },
    });

    const user = await prisma.user.update({
      where: { id: pagamento.user_id },
      data: { status: 'ATIVO' },
    });

    const jogosFuturos = await prisma.jogo.findMany({
      where: { data_hora: { gte: new Date() } },
    });

    for (const jogo of jogosFuturos) {
      await prisma.palpite.upsert({
        where: { user_id_jogo_id: { user_id: pagamento.user_id, jogo_id: jogo.id } },
        update: {},
        create: {
          user_id: pagamento.user_id,
          jogo_id: jogo.id,
          palpite_casa: 0,
          palpite_fora: 0,
        },
      });
    }

    await recalculatePrizes();
    await logAudit(adminId, 'Aprovação de pagamento', 'Pagamento', id, null, req.ip);

    // Enviar email de notificação
    sendStatusUpdateEmail(user.email, user.nome, 'ATIVO').catch(console.error);

    res.json({ success: true, message: 'Pagamento aprovado e participante ativado com sucesso' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPremios = async (_req: Request, res: Response) => {
  try {
    const premios = await prisma.premio.findMany();
    res.json({ success: true, data: premios });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const savePremio = async (req: Request, res: Response) => {
  const { id, descricao, tipo, percentual, valor_calculado } = req.body;
  const adminId = (req as any).user.userId;

  try {
    let premio;
    if (id) {
      const oldPremio = await prisma.premio.findUnique({ where: { id } });
      premio = await prisma.premio.update({
        where: { id },
        data: { descricao, tipo, percentual, valor_calculado },
      });
      await logAudit(adminId, 'Atualização de prêmio', 'Prêmio', id, { de: oldPremio, para: premio }, req.ip);
    } else {
      premio = await prisma.premio.create({
        data: { descricao, tipo, percentual, valor_calculado },
      });
      await logAudit(adminId, 'Criação de prêmio', 'Prêmio', premio.id, premio, req.ip);
    }

    if (tipo === 'DINHEIRO') {
      await recalculatePrizes();
    }

    res.json({ success: true, data: premio, message: 'Prêmio salvo com sucesso' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getConfig = async (_req: Request, res: Response) => {
  try {
    let config = await prisma.globalConfig.findFirst();
    if (!config) {
      config = await prisma.globalConfig.create({
        data: { valor_inscricao: 70.0, custo_operacional: 0.0 }
      });
    }
    res.json({ success: true, data: config });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateConfig = async (req: Request, res: Response) => {
  const { valor_inscricao, custo_operacional } = req.body;
  const adminId = (req as any).user.userId;

  try {
    let config = await prisma.globalConfig.findFirst();
    if (config) {
      config = await prisma.globalConfig.update({
        where: { id: config.id },
        data: { valor_inscricao, custo_operacional },
      });
    } else {
      config = await prisma.globalConfig.create({
        data: { valor_inscricao, custo_operacional },
      });
    }

    await logAudit(adminId, 'Atualização de configuração global', 'ConfiguraçãoGlobal', '1', config, req.ip);
    await recalculatePrizes();

    res.json({ success: true, data: config, message: 'Configurações globais atualizadas com sucesso' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        include: { user: { select: { nome: true } } },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count()
    ]);

    res.json({ 
      success: true, 
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
