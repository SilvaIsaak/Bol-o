import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  try {
    console.log("🔗 Conectando ao banco de dados...");

    // Test connection
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log("✅ Conexão bem-sucedida:", result);

    // Test create user
    const user = await prisma.user.create({
      data: {
        nome: "Teste",
        email: `teste-${Date.now()}@example.com`,
        whatsapp: "11999999999",
        cpf: `${Math.random().toString().slice(2, 12)}`,
        senha_hash: await bcrypt.hash("senha123", 12),
        matricula: `BP2026-${Math.random().toString().slice(2, 7)}`,
      },
    });
    console.log("✅ Usuário criado:", user.id);

    // Test read user
    const readUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    console.log("✅ Usuário lido:", readUser?.email);

    // Clean up
    await prisma.user.delete({ where: { id: user.id } });
    console.log("✅ Usuário deletado");

    console.log("\n🎉 Smoke test concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
