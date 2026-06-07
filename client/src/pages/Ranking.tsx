import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface RankingItem {
  id: string;
  nome: string;
  matricula: string;
  totalPontos: number;
}

const Ranking: React.FC = () => {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/palpites/ranking')
      .then(res => setRanking(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-white text-center mt-20">Carregando ranking...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-16">
        <div className="inline-block relative mb-6">
          <i className="fas fa-award text-gold text-6xl"></i>
          <div className="absolute -inset-4 bg-gold/20 blur-2xl rounded-full -z-10"></div>
        </div>
        <h1 className="font-display text-5xl md:text-6xl font-black text-white mb-4 uppercase tracking-tighter">
          Galeria de <span className="text-gold">Honra</span>
        </h1>
        <p className="text-gray-500 font-medium tracking-[0.3em] uppercase text-xs">
          A elite dos apostadores da Copa 2026
        </p>
      </div>

      <div className="legacy-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Pos</th>
                <th>Membro do Bolão</th>
                <th style={{ textAlign: 'center', width: '120px' }}>Matrícula</th>
                <th style={{ textAlign: 'center', width: '150px' }}>Pontuação</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((item, index) => (
                <tr key={item.id}>
                  <td>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-black text-lg border ${
                        index === 0 ? 'border-gold bg-gold/10 text-gold' : 
                        index === 1 ? 'border-gray-300 bg-gray-300/10 text-gray-300' :
                        index === 2 ? 'border-orange-400 bg-orange-400/10 text-orange-400' :
                        'border-white/10 bg-black/40 text-gray-500'
                      }`}>
                        {index + 1}º
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className={`font-display text-xl font-bold ${index < 3 ? 'text-white' : 'text-gray-400'}`}>
                        {item.nome}
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }} className="text-gray-500 font-mono text-xs tracking-widest">
                    {item.matricula}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="badge-pts inline-block">
                      {item.totalPontos} <span className="text-[10px] uppercase tracking-tighter opacity-70">pts</span>
                    </div>
                  </td>
                </tr>
              ))}
              {ranking.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-20 text-gray-600 font-display italic">
                    Nenhum participante pontuou ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Ranking;
