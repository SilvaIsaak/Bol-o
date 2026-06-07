import "./utils/env.js";
import app from "./app.js";
import { env } from "./utils/env.js";
import { syncGames } from "./jobs/syncGames.js";
import prisma from "./utils/prisma.js";

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em modo ${env.NODE_ENV} na porta ${PORT}`);

  // Inicializa o sync de jogos se a chave da API estiver presente
  if (env.FOOTBALL_DATA_API_KEY) {
    console.log('⏰ Sincronização automática de jogos ativada');
    syncGames();
  }
});

// Graceful Shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} signal received: closing HTTP server`);
  server.close(async () => {
    console.log('HTTP server closed');
    try {
      await prisma.$disconnect();
      console.log('Prisma disconnected');
    } catch (err) {
      console.error('Error during Prisma disconnect:', err);
    }
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

