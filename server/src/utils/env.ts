import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  PORT: z.preprocess((v) => Number(v), z.number()).default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET deve ter pelo menos 32 caracteres para produção"),
  REFRESH_SECRET: z.string().min(32, "REFRESH_SECRET deve ter pelo menos 32 caracteres para produção"),
  FRONTEND_URL: z.string().url(),
  FOOTBALL_DATA_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.preprocess((v) => Number(v), z.number()).default(587),
  SMTP_SECURE: z.preprocess((v) => v === 'true', z.boolean()).default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  API_COMPETITION_ID: z.string().default('WC'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Variáveis de ambiente inválidas:', _env.error.format());
  throw new Error('Variáveis de ambiente inválidas.');
}

export const env = _env.data;
