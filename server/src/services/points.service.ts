/**
 * Lógica de cálculo de pontos do bolão
 * 
 * 10 pontos – Placar Exato (Ex: 2x1 -> 2x1)
 * 7 pontos – Empate (Acertou que empataria, mas errou o placar - Ex: 1x1 -> 2x2)
 * 5 pontos – Vencedor + Saldo de Gols (Acertou quem venceu e a diferença de gols - Ex: 2x0 -> 3x1)
 * 3 pontos – Vencedor (Acertou apenas quem venceu - Ex: 1x0 -> 3x0)
 */
export const calculatePoints = (
  betA: number,
  betB: number,
  resA: number,
  resB: number
): number => {
  // Placar Exato
  if (betA === resA && betB === resB) {
    return 10;
  }

  const betDiff = betA - betB;
  const resDiff = resA - resB;
  const betWin = betA > betB ? 'H' : (betA < betB ? 'A' : 'D'); // Home, Away, Draw
  const resWin = resA > resB ? 'H' : (resA < resB ? 'A' : 'D');

  // Empate (não exato)
  if (betWin === 'D' && resWin === 'D') {
    return 7;
  }

  // Vencedor + Saldo
  if (betWin === resWin && betWin !== 'D' && betDiff === resDiff) {
    return 5;
  }

  // Apenas Vencedor
  if (betWin === resWin && betWin !== 'D') {
    return 3;
  }

  return 0;
};
