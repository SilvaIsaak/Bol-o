import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../utils/env.js';

interface TokenPayload {
  userId: string;
  role: string;
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const cookieToken = (req as any).cookies?.access_token;
  const token = cookieToken || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

  if (!token) {
    res.status(401).json({ success: false, message: 'Token não fornecido' });
    return;
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Token não fornecido' });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    (req as any).user = {
      userId: decoded.userId,
      role: decoded.role
    } as TokenPayload;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token inválido ou expirado' });
    return;
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user as TokenPayload;

    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ success: false, message: 'Acesso negado' });
      return;
    }

    next();
  };
};
