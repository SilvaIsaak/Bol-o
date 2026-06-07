# Setup Prisma PostgreSQL - Checklist

## ✅ Completado

1. **package.json**
   - ✅ Mudado para ESM (`"type": "module"`)
   - ✅ Adicionados: `@prisma/adapter-pg`, `postgres`, `tsx`
   - ✅ Removidos: `ts-node-dev`, `ts-node`
   - ✅ Scripts atualizados para usar `tsx`

2. **tsconfig.json**
   - ✅ Module: ESNext
   - ✅ moduleResolution: bundler
   - ✅ target: ES2023
   - ✅ Adicionados: esModuleInterop, ignoreDeprecations: "6.0"
   - ✅ Strict mode habilitado

3. **prisma.config.ts**
   - ✅ Atualizado para ESM (import/export)
   - ✅ Remove processo.env["DATABASE_URL"] para process.env.DATABASE_URL

4. **server.ts**
   - ✅ Convertido para ESM
   - ✅ Importações com extensão .js

5. **app.ts**
   - ✅ Convertido para ESM
   - ✅ Import dotenv/config no topo
   - ✅ Importações com extensão .js

6. **prisma/seed.ts**
   - ✅ Convertido para ESM
   - ✅ Adicionado PrismaPg adapter com connectionString

7. **src/prisma-client.ts**
   - ✅ Criado com PrismaPg singleton
   - ✅ Dev logging habilitado
   - ✅ Production mode sem logging

8. **prisma/smoke-test.ts**
   - ✅ Criado para testar conexão
   - ✅ Testa: create, read, delete

## 📋 Próximos Passos (FAÇA AGORA)

1. **Instalar dependências:**
   ```bash
   cd server
   npm install
   ```

2. **Configurar DATABASE_URL em .env:**
   ```
   DATABASE_URL="<paste your Prisma Postgres connection string from the Connect tab>"
   ```

3. **Rodar migrations iniciais:**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Gerar cliente Prisma:**
   ```bash
   npm run prisma:generate
   ```

5. **Rodar seed (opcional):**
   ```bash
   npm run prisma:seed
   ```

6. **Testar smoke test (opcional):**
   ```bash
   npx tsx prisma/smoke-test.ts
   ```

7. **Iniciar servidor:**
   ```bash
   npm run dev
   ```

## ⚠️ Arquivos que Ainda Precisam Conversão ESM

Todos os arquivos abaixo precisam de imports ESM (com extensão .js):
- src/routes/auth.routes.ts
- src/routes/jogo.routes.ts
- src/routes/palpite.routes.ts
- src/routes/admin.routes.ts
- src/routes/user.routes.ts
- src/services/*
- src/controllers/*
- src/middlewares/*
- src/jobs/syncGames.ts
- src/utils/*

**Padrão ESM para aplicar em todos:**
```typescript
// ❌ Errado (CommonJS)
import authService from './services/auth.service';

// ✅ Correto (ESM)
import authService from './services/auth.service.js';
```

## 🔒 Segurança

- ✅ .env será usado apenas para DATABASE_URL
- ✅ Não commitar .env (já deve estar em .gitignore)
- ⚠️ Usar DATABASE_URL real do Prisma Postgres Connect tab
- ✅ PrismaPg adapter com connectionString seguro

## 📦 Stack Confirmada

- Node.js 20+ (ESM)
- TypeScript 6.0.3
- Prisma 7.8.0 com @prisma/adapter-pg
- Postgres driver via @prisma/adapter-pg + postgres lib
- tsx para desenvolvimento
