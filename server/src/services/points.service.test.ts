import { describe, it, expect } from 'vitest';
import { calculatePoints } from './points.service.js';

describe('calculatePoints', () => {
  it('deve retornar 10 pontos para placar exato', () => {
    expect(calculatePoints(2, 1, 2, 1)).toBe(10);
    expect(calculatePoints(0, 0, 0, 0)).toBe(10);
  });

  it('deve retornar 7 pontos para empate não exato', () => {
    expect(calculatePoints(1, 1, 2, 2)).toBe(7);
    expect(calculatePoints(0, 0, 3, 3)).toBe(7);
  });

  it('deve retornar 5 pontos para vencedor + saldo correto', () => {
    expect(calculatePoints(2, 0, 3, 1)).toBe(5); // Saldo 2
    expect(calculatePoints(1, 0, 2, 1)).toBe(5); // Saldo 1
  });

  it('deve retornar 3 pontos para apenas vencedor correto', () => {
    expect(calculatePoints(1, 0, 3, 0)).toBe(3); // Saldo diferente
    expect(calculatePoints(0, 1, 0, 2)).toBe(3); // Saldo diferente
  });

  it('deve retornar 0 pontos para erro total', () => {
    expect(calculatePoints(1, 0, 0, 1)).toBe(0);
    expect(calculatePoints(1, 1, 2, 1)).toBe(0);
  });
});
