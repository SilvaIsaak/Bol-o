import cron from 'node-cron';
import type { Prisma } from '@prisma/client';
import prisma from '../utils/prisma.js';
import { fetchFinishedGames } from '../services/footballApi.service.js';
import { translateTeamToInternal } from '../services/teamMapping.service.js';
import { calculatePoints } from '../services/points.service.js';

export const syncGames = () => {
  // Roda a cada hora
  cron.schedule('0 * * * *', async () => {
    console.log('🔄 Iniciando sincronização de placares...');
    
    try {
      const externalGames = await fetchFinishedGames();
      
      for (const extGame of externalGames) {
        const homeScore = extGame.score.fullTime.home;
        const awayScore = extGame.score.fullTime.away;

        if (homeScore !== null && awayScore !== null) {
          const homeTeamInternal = translateTeamToInternal(extGame.homeTeam.name);
          const awayTeamInternal = translateTeamToInternal(extGame.awayTeam.name);

          const internalGame = await prisma.jogo.findFirst({
            where: {
              time_casa: homeTeamInternal,
              time_fora: awayTeamInternal,
              status: { not: 'FINISHED' }
            }
          });

          if (internalGame) {
            console.log(`✅ Atualizando placar: ${internalGame.time_casa} ${homeScore} x ${awayScore} ${internalGame.time_fora}`);
            
            await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
              // 1. Atualiza o jogo
              await tx.jogo.update({
                where: { id: internalGame.id },
                data: {
                  placar_casa: homeScore,
                  placar_fora: awayScore,
                  status: 'FINISHED'
                }
              });

              // 2. Recalcula pontos de todos os palpites para este jogo
              const palpites = await tx.palpite.findMany({
                where: { jogo_id: internalGame.id }
              });

              for (const palpite of palpites) {
                const pontos = calculatePoints(
                  palpite.palpite_casa,
                  palpite.palpite_fora,
                  homeScore,
                  awayScore
                );

                await tx.palpite.update({
                  where: { id: palpite.id },
                  data: { pontos }
                });
              }
            });
          }
        }
      }
      
      console.log('🏁 Sincronização concluída.');
    } catch (error) {
      console.error('❌ Erro na sincronização de jogos:', error);
    }
  });
};
