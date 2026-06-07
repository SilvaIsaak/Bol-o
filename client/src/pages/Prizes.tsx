import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface Premio {
  id: string;
  descricao: string;
  tipo: 'DINHEIRO' | 'OBJETO';
  percentual: number | null;
  valor_calculado: number;
}

const Prizes: React.FC = () => {
  const [premios, setPremios] = useState<Premio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/premios')
      .then(res => setPremios(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-white text-center mt-20">Carregando prêmios...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <section className="mb-20">
        <div className="legacy-card p-10 mb-16">
          <h2 className="font-display text-3xl font-bold text-gold mb-8 flex items-center gap-4">
            <i className="fas fa-scroll"></i> Constituição do Bolão
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '40px' }}>
            <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '20px', borderRadius: '15px', textAlign: 'center', border: '1px solid var(--gold)' }}>
                <span style={{ display: 'block', fontSize: '0.8em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Valor por Pessoa</span>
                <strong style={{ fontSize: '1.8em', color: 'var(--gold)' }}>R$ 70</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="rule-item">
              <strong>🎯 Placar Exato</strong>
              <span className="text-gray-400 text-sm">10 pontos: Acertou o resultado completo (Ex: 2x1 &rarr; 2x1).</span>
            </div>
            <div className="rule-item">
              <strong>🤝 Empate</strong>
              <span className="text-gray-400 text-sm">7 pontos: Acertou que empataria, mas errou o placar (Ex: 1x1 &rarr; 2x2).</span>
            </div>
            <div className="rule-item">
              <strong>⚽ Vencedor + Saldo</strong>
              <span className="text-gray-400 text-sm">5 pontos: Acertou quem venceu e a diferença de gols (Ex: 2x0 &rarr; 3x1).</span>
            </div>
            <div className="rule-item">
              <strong>🎖️ Vencedor</strong>
              <span className="text-gray-400 text-sm">3 pontos: Acertou apenas quem venceu (Ex: 1x0 &rarr; 3x0).</span>
            </div>
          </div>

          <div className="bg-gold/5 border border-gold/20 p-6 rounded-2xl flex items-center gap-4">
            <i className="fas fa-info-circle text-gold text-2xl"></i>
            <p className="text-gray-400 text-xs uppercase font-black tracking-widest leading-relaxed">
              Nota de Integridade: As pontuações são atribuídas com base no critério de maior valor atingido por jogo. Não há acumulação de pontos dentro de uma única partida.
            </p>
          </div>
        </div>
      </section>

      <div className="text-center mb-16">
        <div className="inline-block relative mb-6">
          <i className="fas fa-gem text-gold text-6xl"></i>
          <div className="absolute -inset-4 bg-gold/20 blur-2xl rounded-full -z-10"></div>
        </div>
        <h1 className="font-display text-5xl md:text-6xl font-black text-white mb-4 uppercase tracking-tighter">
          Premiação <span className="text-gold">Exclusiva</span>
        </h1>
        <p className="text-gray-500 font-medium tracking-[0.3em] uppercase text-xs">
          O brilho da vitória recompensado em ouro
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {premios.map((premio) => (
          <div key={premio.id} className="legacy-card p-8 text-center group hover:border-gold transition-all duration-500">
            <div className="bg-gold/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              {premio.tipo === 'DINHEIRO' ? (
                <i className="fas fa-dollar-sign text-gold text-4xl"></i>
              ) : (
                <i className="fas fa-gift text-gold text-4xl"></i>
              )}
            </div>
            <h3 className="font-display text-2xl font-bold text-white mb-2">{premio.descricao}</h3>
            <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-6 h-10">
              {premio.tipo === 'DINHEIRO' && premio.percentual 
                ? `${premio.percentual}% do montante líquido`
                : 'Prêmio em Bens Materiais'}
            </p>
            <div className="text-3xl font-display font-black text-gold drop-shadow-lg">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(premio.valor_calculado)}
            </div>
          </div>
        ))}
      </div>

      <div className="legacy-card p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <i className="fas fa-hand-holding-usd text-gold text-[120px]"></i>
        </div>
        <div className="relative z-10">
          <h4 className="font-display text-2xl font-bold text-white mb-4 uppercase tracking-wider">Como funciona a arrecadação?</h4>
          <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
            O valor dos prêmios é dinâmico e cresce conforme a entrada de novos participantes. 
            A arrecadação líquida é calculada subtraindo os custos operacionais do total arrecadado. 
            <span className="text-gold font-bold block mt-2">Quanto mais gente participar, maior será o seu prêmio final!</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Prizes;
