import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import { env } from "./utils/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from "./routes/auth.routes.js";
import jogoRoutes from "./routes/jogo.routes.js";
import palpiteRoutes from "./routes/palpite.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

// Trust proxy for IP capture behind Nginx/Cloudflare
app.set('trust proxy', 1);

// Serve static files for uploads
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // 10,000 requests per window (mais amplo)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Muitas requisições, tente novamente mais tarde.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 tentativas de auth por 15 minutos (seguro contra brute force)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Muitas tentativas de login, tente novamente em 15 minutos.",
  },
});

app.use("/api/", generalLimiter);
app.use("/api/auth/", authLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jogos", jogoRoutes);
app.use("/api/palpites", palpiteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Erro detectado:', err);
  
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';
  
  res.status(statusCode).json({
    success: false,
    message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

export default app;

