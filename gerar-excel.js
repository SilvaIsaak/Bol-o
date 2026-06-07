const XLSX = require('xlsx');
const path = require('path');

// Lista de jogos do bolão (como no sistema)
const jogos = [
    { time_casa: 'Brasil', time_fora: 'Marrocos', data_hora: '2026-06-13 15:00' },
    { time_casa: 'Equador', time_fora: 'Alemanha', data_hora: '2026-06-14 18:00' },
    { time_casa: 'Holanda', time_fora: 'Japão', data_hora: '2026-06-15 15:00' },
    { time_casa: 'Holanda', time_fora: 'Suécia', data_hora: '2026-06-15 18:00' },
    { time_casa: 'Japão', time_fora: 'Suécia', data_hora: '2026-06-16 15:00' },
    { time_casa: 'Espanha', time_fora: 'Uruguai', data_hora: '2026-06-16 18:00' },
    { time_casa: 'Senegal', time_fora: 'Noruega', data_hora: '2026-06-17 15:00' },
    { time_casa: 'Senegal', time_fora: 'França', data_hora: '2026-06-17 18:00' },
    { time_casa: 'Colômbia', time_fora: 'Portugal', data_hora: '2026-06-18 18:00' },
    { time_casa: 'Inglaterra', time_fora: 'Croácia', data_hora: '2026-06-19 15:00' }
];

// Regras do bolão (como no sistema)
const regras = [
    { Regra: 'Placar Exato', Pontos: '10', Descricao: 'Acertar o resultado completo (Ex: palpite 2x1 & real 2x1)' },
    { Regra: 'Empate', Pontos: '7', Descricao: 'Acertar que empataria, mas errar o placar (Ex: palpite 1x1 & real 2x2)' },
    { Regra: 'Vencedor + Saldo', Pontos: '5', Descricao: 'Acertar quem venceu e a diferença de gols (Ex: palpite 2x0 & real 3x1)' },
    { Regra: 'Vencedor Apenas', Pontos: '3', Descricao: 'Acertar apenas quem vai ganhar (Ex: palpite 1x0 & real 3x0)' },
    { Regra: 'Nota Importante', Pontos: '-', Descricao: 'Pontuações NÃO se acumulam no mesmo jogo (apenas a maior vale!)' }
];

// Cria o Workbook
const wb = XLSX.utils.book_new();

// 1. Aba 1: Regras do Bolão
const wsRegras = XLSX.utils.json_to_sheet(regras);
wsRegras['!cols'] = [
    { wch: 25 },
    { wch: 10 },
    { wch: 70 }
];
XLSX.utils.book_append_sheet(wb, wsRegras, '📜 Regras');

// 2. Aba 2: Palpites (modelo para preenchimento)
const palpitesModelo = jogos.map(jogo => ({
    'Data e Hora': jogo.data_hora,
    'Time Casa': jogo.time_casa,
    'Palpite Casa (Gols)': '',
    'X': 'X',
    'Palpite Fora (Gols)': '',
    'Time Fora': jogo.time_fora,
    'Resultado Real (Casa)': '',
    'Resultado Real (Fora)': '',
    'Pontos Obtidos': ''
}));
const wsPalpites = XLSX.utils.json_to_sheet(palpitesModelo);
wsPalpites['!cols'] = [
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 5 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 18 }
];
XLSX.utils.book_append_sheet(wb, wsPalpites, '🎯 Palpites');

// 3. Aba 3: Usuários (modelo para cadastro)
const usuariosModelo = [
    { 'Nome Completo': 'Exemplo da Silva', 'E-mail': 'exemplo@email.com', 'CPF': '000.000.000-00', 'Whatsapp': '(00) 00000-0000', 'Status': 'ATIVO', 'Matrícula': 'BP2026-00001' }
];
const wsUsuarios = XLSX.utils.json_to_sheet(usuariosModelo);
wsUsuarios['!cols'] = [
    { wch: 30 },
    { wch: 35 },
    { wch: 20 },
    { wch: 22 },
    { wch: 15 },
    { wch: 20 }
];
XLSX.utils.book_append_sheet(wb, wsUsuarios, '👥 Usuários');

// 4. Aba 4: Ranking (modelo para pontuação)
const rankingModelo = [
    { 'Posição': '1º', 'Nome': 'Exemplo da Silva', 'Matrícula': 'BP2026-00001', 'Total de Pontos': '0' }
];
const wsRanking = XLSX.utils.json_to_sheet(rankingModelo);
wsRanking['!cols'] = [
    { wch: 15 },
    { wch: 30 },
    { wch: 20 },
    { wch: 25 }
];
XLSX.utils.book_append_sheet(wb, wsRanking, '🏆 Ranking');

// 5. Aba 5: Pagamentos (modelo para controle)
const pagamentosModelo = [
    { 'Nome Completo': 'Exemplo da Silva', 'Matrícula': 'BP2026-00001', 'Valor Pago (R$)': '70,00', 'Data Pagamento': '', 'Status': 'PAGO', 'Comprovante Enviado?': 'SIM' }
];
const wsPagamentos = XLSX.utils.json_to_sheet(pagamentosModelo);
wsPagamentos['!cols'] = [
    { wch: 30 },
    { wch: 20 },
    { wch: 22 },
    { wch: 20 },
    { wch: 15 },
    { wch: 25 }
];
XLSX.utils.book_append_sheet(wb, wsPagamentos, '💸 Pagamentos');

// Salva o arquivo
const caminhoArquivo = path.join(__dirname, 'Bolao_2026_Preenchimento_Manual.xlsx');
XLSX.writeFile(wb, caminhoArquivo);

console.log('✅ Arquivo Excel gerado com sucesso!');
console.log(`📄 Caminho: ${caminhoArquivo}`);
console.log(`\n📋 Abas incluídas:
- 📜 Regras do Bolão
- 🎯 Palpites dos Jogos
- 👥 Cadastro de Usuários
- 🏆 Ranking de Pontuação
- 💸 Controle de Pagamentos`);