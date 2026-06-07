# Bolão 2026 - Sistema Web Completo

Este é um sistema completo para gerenciamento de bolão da Copa do Mundo 2026, com funcionalidades para usuários e administradores.

## 🚀 Tecnologias Utilizadas

### Frontend
- React 18+ (Vite)
- Tailwind CSS
- TypeScript
- React Router Dom
- React Hook Form + Zod
- Axios
- Lucide React (Ícones)

### Backend
- Node.js 20+
- Express
- Prisma ORM (PostgreSQL)
- JWT (Autenticação)
- bcryptjs (Criptografia)
- node-cron (Jobs agendados)
- Zod (Validação)

## 📦 Estrutura de Pastas
- `/client`: Frontend em React
- `/server`: Backend em Node.js
- `/server/prisma`: Schema e Migrations do banco de dados
- `/server/src/jobs`: Tarefas agendadas (sincronização de jogos)

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js instalado
- PostgreSQL rodando

### Passo 1: Configurar o Banco de Dados
No diretório `/server`, renomeie o arquivo `.env.example` para `.env` e preencha as variáveis de ambiente, especialmente a `DATABASE_URL`.

### Passo 2: Instalar dependências e rodar Migrations
```bash
# No diretório /server
npm install
npx prisma migrate dev
npx prisma db seed # Cria o admin padrão (admin@bolao2026.com / admin123)

# No diretório /client
npm install
```

### Passo 3: Executar o projeto
```bash
# Na raiz do projeto
npm install
npm run dev
```

Também estão disponíveis:
```bash
npm run build
npm run test
```

## 🔐 Credenciais Padrão (Admin)
- **Email**: admin@bolao2026.com
- **Senha**: admin123

## 📝 Regras de Negócio
1. **Matrícula**: Gerada automaticamente (BP2026-XXXXX).
2. **Bloqueio de Palpite**: 1 hora antes do início de cada jogo.
3. **Pontuação**: 
   - Acerto exato do placar: 3 pontos.
   - Acerto apenas do vencedor/empate: 1 ponto.
   - Erro total: 0 pontos.
4. **Ativação**: O usuário é ativado pelo admin após validação do pagamento.
5. **Palpites Padrão**: Ao ser ativado, o usuário recebe palpites 0x0 para todos os jogos futuros.
6. **Prêmios**: Valores em dinheiro são calculados dinamicamente com base no total arrecadado (número de participantes ativos).

## 🛡️ Segurança
- Rate limiting implementado nas rotas de autenticação.
- Validação rigorosa de inputs com Zod.
- Tokens JWT com tempo de expiração configurado (8h access / 30d refresh).
- Proteção contra ataques comuns via Helmet.js e CORS.
