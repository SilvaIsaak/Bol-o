import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { calculatePoints } from '../services/points.service.js';

export const getJogos = async (req: Request, res: Response) => {
  const { data, onlyBrazil } = req.query;

  try {
    const where: any = {};
    if (data && typeof data === 'string') {
      const startOfDay = new Date(data);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(data);
      endOfDay.setUTCHours(23, 59, 59, 999);
      where.data_hora = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (onlyBrazil === 'true') {
      where.is_brazil_game = true;
    }

    const jogos = await prisma.jogo.findMany({
      where,
      orderBy: { data_hora: 'asc' },
    });

    res.json({ success: true, data: jogos });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePlacar = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { placar_casa, placar_fora, status } = req.body;
  const adminId = (req as any).user.userId as string;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ success: false, message: 'ID do jogo inválido' });
    return;
  }

  try {
    const oldJogo = await prisma.jogo.findUnique({ where: { id } });
    const jogo = await prisma.jogo.update({
      where: { id },
      data: {
        placar_casa,
        placar_fora,
        status,
      },
    });

    // Log auditoria
    await prisma.auditLog.create({
      data: {
        user_id: adminId,
        acao: 'Atualização de Placar',
        entidade: 'Jogo',
        entidade_id: id,
        payload: { de: { c: oldJogo?.placar_casa, f: oldJogo?.placar_fora }, para: { c: placar_casa, f: placar_fora } },
        ip_address: req.ip || null
      }
    });

    if (status === 'FINISHED') {
      const palpites = await prisma.palpite.findMany({ where: { jogo_id: id } });

      for (const palpite of palpites) {
        const pontos = calculatePoints(
          palpite.palpite_casa,
          palpite.palpite_fora,
          placar_casa,
          placar_fora
        );

        await prisma.palpite.update({
          where: { id: palpite.id },
          data: { pontos },
        });
      }
    }

    res.json({ success: true, data: jogo, message: 'Placar atualizado com sucesso' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
