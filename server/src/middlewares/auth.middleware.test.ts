import { describe, it, expect, vi } from 'vitest';
import { authenticate } from './auth.middleware.js';
import jwt from 'jsonwebtoken';
import { env } from '../utils/env.js';

vi.mock('jsonwebtoken');
vi.mock('../utils/env.js', () => ({
  env: {
    JWT_SECRET: 'test_secret_with_more_than_32_characters_for_validation'
  }
}));

describe('authMiddleware', () => {
  it('deve retornar 401 se o token não for fornecido', () => {
    const req = { headers: {} } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    } as any;
    const next = vi.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Token não fornecido' }));
    expect(next).not.toHaveBeenCalled();
  });

  it('deve chamar next() se o token for válido', () => {
    const mockUser = { userId: '123', role: 'USER' };
    vi.mocked(jwt.verify).mockReturnValue(mockUser as any);

    const req = { 
      headers: { authorization: 'Bearer valid_token' } 
    } as any;
    const res = {} as any;
    const next = vi.fn();

    authenticate(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid_token', env.JWT_SECRET);
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });

  it('deve retornar 401 se o token for inválido', () => {
    vi.mocked(jwt.verify).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const req = { 
      headers: { authorization: 'Bearer invalid_token' } 
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    } as any;
    const next = vi.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Token inválido ou expirado' }));
    expect(next).not.toHaveBeenCalled();
  });
});
