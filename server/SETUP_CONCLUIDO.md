# Prisma PostgreSQL Setup - Configuração Completa

## 📋 Resumo do que foi feito

### 1. Migração de CommonJS para ESM
- ✅ package.json: `"type": "module"` + scripts ESM
- ✅ tsconfig.json: module=ESNext, moduleResolution=bundler, target=ES2023
- ✅ Todos os .ts files: conversão para import/export ESM
- ✅ Extensões .js adicionadas em imports locais

### 2. Prisma Postgres com Adapter
```bash
# Instalado:
- @prisma/client@7.8.0
- @prisma/adapter-pg@7.8.0  # ← Novo adapter para Prisma Postgres
- postgres@3.4.4              # ← Driver nativo
```

**Por que PrismaPg?** O @prisma/adapter-pg permite usar postgres lib (driver nativo JavaScript puro) em vez de sqlite ou o driver padrão, otimizado para edge/serverless.

### 3. Arquivos Criados/Modificados

#### Criados:
- `src/prisma-client.ts` - PrismaPg singleton com HMR
- `prisma/smoke-test.ts` - Teste de conexão e CRUD
- `.gitignore` - Segurança do .env
- `PRISMA_SETUP.md` - Instruções passo-a-passo

#### Modificados:
- `package.json` - ESM + deps corretas
- `tsconfig.json` - Config moderna
- `prisma.config.ts` - ESM + DATABASE_URL
- `src/server.ts` - ESM + dotenv/config
- `src/app.ts` - ESM + imports com .js
- `prisma/seed.ts` - ESM + PrismaPg
- `src/routes/*.ts` - Todas 5 routes: ESM

### 4. Configuração PostgreSQL

**DATABASE_URL deveria ser:**
```
postgresql://user:password@host:5432/database?schema=public

OU com pool (recomendado):
postgresql://user:password@host:5432/database?schema=public&pgbouncer=true
```

## 🚀 Próximas Ações (Você precisa fazer)

### Step 1: Instalar dependências
```bash
cd server
npm install
```

### Step 2: Configurar DATABASE_URL
Edite `.env`:
```
PORT=3001
DATABASE_URL="<seu PostgreSQL URL aqui>"
JWT_SECRET="sua_chave_secreta"
JWT_REFRESH_SECRET="outra_chave"
FOOTBALL_DATA_API_KEY="sua_chave"
EMAIL_HOST="smtp...."
EMAIL_PORT=587
EMAIL_USER="usuario"
EMAIL_PASS="senha"
FRONTEND_URL="http://localhost:5173"
```

### Step 3: Rodar migrações
```bash
npx prisma migrate dev --name init
```

### Step 4: Seed (opcional)
```bash
npm run prisma:seed
```

### Step 5: Testar conexão
```bash
npx tsx prisma/smoke-test.ts
```

Esperado:
```
🔗 Conectando ao banco de dados...
✅ Conexão bem-sucedida
✅ Usuário criado
✅ Usuário lido
✅ Usuário deletado
🎉 Smoke test concluído com sucesso!
```

### Step 6: Iniciar servidor
```bash
npm run dev
```

Esperado na porta 3001:
```
Server is running on port 3001
```

## ⚠️ Arquivos que AINDA faltam implementar (Controllers, Services, etc)

Você ainda precisa criar os controllers/services. Estrutura esperada:

```
src/
├── controllers/
│   ├── auth.controller.ts
│   ├── jogo.controller.ts
│   ├── palpite.controller.ts
│   ├── admin.controller.ts
│   └── ...
├── services/
│   ├── auth.service.ts
│   ├── jogo.service.ts
│   ├── palpite.service.ts
│   └── ...
├── middlewares/
│   ├── auth.middleware.ts
│   └── ...
├── utils/
│   └── ...
└── jobs/
    └── syncGames.ts
```

## 🔍 Checklist de Segurança

- ✅ .env não será commitado (.gitignore)
- ✅ DATABASE_URL em .env (não hardcoded)
- ✅ PrismaPg adapter (seguro para edge)
- ✅ Bcrypt com salt 12 no seed
- ⚠️ JWT_SECRET: mude do padrão
- ⚠️ FOOTBALL_DATA_API_KEY: configure quando tiver

## 📖 Referências Rápidas

**PrismaPg singleton** (src/prisma-client.ts):
```typescript
import prisma from "./prisma-client.js";

// Use em qualquer arquivo:
const user = await prisma.user.findUnique(...);
```

**ESM imports**:
```typescript
// ❌ Errado
import prisma from './prisma-client';

// ✅ Correto
import prisma from './prisma-client.js';
```

**Rodar migrações após schema change**:
```bash
npx prisma migrate dev --name sua_descricao
```

**Gerar cliente após alterar schema**:
```bash
npm run prisma:generate
```

## 🎯 Próximos Passos Após Setup

1. Implementar controllers (auth, jogo, palpite, admin)
2. Implementar services (lógica de negócio)
3. Implementar middlewares (auth.middleware com JWT)
4. Implementar jobs (syncGames com node-cron)
5. Testar rotas com Postman/insomnia
6. Implementar frontend React
