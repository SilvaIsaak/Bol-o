import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { z } from 'zod';

const palpiteSchema = z.object({
  jogo_id: z.string(),
  palpite_casa: z.number().int().min(0),
  palpite_fora: z.number().int().min(0),
});

export const savePalpite = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  
  try {
    const { jogo_id, palpite_casa, palpite_fora } = palpiteSchema.parse(req.body);

    const jogo = await prisma.jogo.findUnique({ where: { id: jogo_id } });

    if (!jogo) {
      return res.status(404).json({ success: false, message: 'Jogo não encontrado' });
    }

    // Regra: Palpite bloqueado 1 hora antes do jogo
    const now = new Date();
    const limitDate = new Date(jogo.data_hora.getTime() - 60 * 60 * 1000);
    const startDate = new Date(jogo.data_hora.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (now > limitDate) {
      return res.status(403).json({ success: false, message: 'Palpites bloqueados para este jogo (limite de 1h antes)' });
    }

    if (now < startDate) {
      return res.status(403).json({ success: false, message: 'Este palpite ainda não está disponível (abre 1 semana antes)' });
    }

    const palpite = await prisma.palpite.upsert({
      where: {
        user_id_jogo_id: {
          user_id: userId,
          jogo_id,
        },
      },
      update: {
        palpite_casa,
        palpite_fora,
        updated_at: new Date(),
      },
      create: {
        user_id: userId,
        jogo_id,
        palpite_casa,
        palpite_fora,
      },
    });

    return res.json({ success: true, data: palpite });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getUserPalpites = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId as string;

  try {
    const palpites = await prisma.palpite.findMany({
      where: { user_id: userId },
      include: { jogo: true },
      orderBy: { jogo: { data_hora: 'asc' } },
    });

    return res.json({ success: true, data: palpites });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getRanking = async (_req: Request, res: Response) => {
  try {
    const ranking = await prisma.user.findMany({
      where: { 
        status: 'ATIVO',
        role: 'USER' // Apenas usuários pagantes participam do ranking
      },
      select: {
        id: true,
        nome: true,
        matricula: true,
        palpites: {
          select: { pontos: true },
        },
      },
    });

    const formattedRanking = ranking.map((user: any) => ({
      id: user.id,
      nome: user.nome,
      matricula: user.matricula,
      totalPontos: user.palpites.reduce((sum: number, p: any) => sum + p.pontos, 0),
    })).sort((a: any, b: any) => b.totalPontos - a.totalPontos);

    return res.json({ success: true, data: formattedRanking });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
