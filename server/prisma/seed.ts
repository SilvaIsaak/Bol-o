import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { env } from '../src/utils/env.js';

const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const senha_hash = await bcrypt.hash('admin123', 12);

  // 1. Criar Configuração Global
  await prisma.globalConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      valor_inscricao: 70.0,
      custo_operacional: 5.0, // R$ 5,00 por usuário para custos
      api_competition_id: env.API_COMPETITION_ID,
    },
  });

  // 2. Criar Admin padrão
  await prisma.user.upsert({
    where: { email: 'admin@bolao2026.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@bolao2026.com',
      whatsapp: '5500000000000',
      cpf: '00000000000',
      senha_hash,
      matricula: 'BP2026-00000',
      role: 'ADMIN',
      status: 'ATIVO',
    },
  });

  // 3. Prêmios (Iniciam vazios conforme solicitação)
  // O administrador deve inserir os prêmios manualmente via painel de gestão.
  await prisma.premio.deleteMany({}); // Garante que a tabela inicie limpa em novos seeds


  // 4. Criar os jogos desejados
  const games: Prisma.JogoCreateManyInput[] = [
    { time_casa: 'Brasil', time_fora: 'Marrocos', data_hora: new Date('2026-06-13T15:00:00Z'), fase: 'Fase de Grupos', status: 'SCHEDULED', is_brazil_game: true },
    { time_casa: 'Equador', time_fora: 'Alemanha', data_hora: new Date('2026-06-14T18:00:00Z'), fase: 'Fase de Grupos', status: 'SCHEDULED', is_brazil_game: false },
    { time_casa: 'Holanda', time_fora: 'Japão', data_hora: new Date('2026-06-15T15:00:00Z'), fase: 'Fase de Grupos', status: 'SCHEDULED', is_brazil_game: false },
    { time_casa: 'Holanda', time_fora: 'Suécia', data_hora: new Date('2026-06-15T18:00:00Z'), fase: 'Fase de Grupos', status: 'SCHEDULED', is_brazil_game: false },
    { time_casa: 'Japão', time_fora: 'Suécia', data_hora: new Date('2026-06-16T15:00:00Z'), fase: 'Fase de Grupos', status: 'SCHEDULED', is_brazil_game: false },
    { time_casa: 'Espanha', time_fora: 'Uruguai', data_hora: new Date('2026-06-16T18:00:00Z'), fase: 'Fase de Grupos', status: 'SCHEDULED', is_brazil_game: false },
    { time_casa: 'Senegal', time_fora: 'Noruega', data_hora: new Date('2026-06-17T15:00:00Z'), fase: 'Fase de Grupos', status: 'SCHEDULED', is_brazil_game: false },
    { time_casa: 'Senegal', time_fora: 'França', data_hora: new Date('2026-06-17T18:00:00Z'), fase: 'Fase de Grupos', status: 'SCHEDULED', is_brazil_game: false },
    { time_casa: 'Colômbia', time_fora: 'Portugal', data_hora: new Date('2026-06-18T18:00:00Z'), fase: 'Fase de Grupos', status: 'SCHEDULED', is_brazil_game: false },
    { time_casa: 'Inglaterra', time_fora: 'Croácia', data_hora: new Date('2026-06-19T15:00:00Z'), fase: 'Fase de Grupos', status: 'SCHEDULED', is_brazil_game: false },
  ];

  await prisma.palpite.deleteMany({}); // Limpa palpites antes de deletar jogos
  await prisma.jogo.deleteMany({}); // Limpa jogos antigos para evitar duplicatas e inconsistências
  await prisma.jogo.createMany({
    data: games,
    skipDuplicates: true,
  });

  console.log('Seed atualizado com sucesso.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
