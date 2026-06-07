import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { isAxiosError } from 'axios';
import { translateTeam, translateStage, getFlagUrl } from '../utils/translations';

interface Jogo {
  id: string;
  time_casa: string;
  time_fora: string;
  data_hora: string;
  fase: string;
  placar_casa: number | null;
  placar_fora: number | null;
  status: string;
  is_brazil_game: boolean;
}

interface Palpite {
  jogo_id: string;
  palpite_casa: number;
  palpite_fora: number;
}

interface GameCardProps {
  jogo: Jogo;
  palpite: Palpite;
  onPalpiteChange: (jogoId: string, team: 'casa' | 'fora', value: string) => void;
  onSavePalpite: (jogoId: string) => void;
}

const GameCard: React.FC<GameCardProps> = ({ jogo, palpite, onPalpiteChange, onSavePalpite }) => {
  const gameTime = new Date(jogo.data_hora).getTime();
  const now = new Date().getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const oneHour = 60 * 60 * 1000;

  const isTooEarly = now < gameTime - oneWeek;
  const isTooLate = now > gameTime - oneHour;
  const isLocked = isTooEarly || isTooLate;

  return (
    <div className={`game-row ${jogo.is_brazil_game ? 'border-gold/50 shadow-gold' : ''} ${isTooEarly ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      <div className="match-meta">
        {translateStage(jogo.fase)} {jogo.is_brazil_game && <i className="fas fa-star ml-2"></i>}
      </div>
      
      <div className="game-main">
        <div className="game-team">
          <img src={getFlagUrl(jogo.time_casa)} alt={jogo.time_casa} className="flag-img" />
          <span className={jogo.time_casa === 'Brazil' || jogo.time_casa === 'Brasil' ? 'text-gold' : 'text-white'}>
            {translateTeam(jogo.time_casa)}
          </span>
        </div>
        
        <div className="game-score-capsule">
          <input
            type="number"
            min="0"
            disabled={isLocked}
            value={palpite.palpite_casa}
            onChange={(e) => onPalpiteChange(jogo.id, 'casa', e.target.value)}
            className="input-score disabled:opacity-50"
          />
          <span style={{ fontSize: '2em', color: 'var(--gold)', fontWeight: 900 }}>:</span>
          <input
            type="number"
            min="0"
            disabled={isLocked}
            value={palpite.palpite_fora}
            onChange={(e) => onPalpiteChange(jogo.id, 'fora', e.target.value)}
            className="input-score disabled:opacity-50"
          />
        </div>

        <div className="game-team">
          <img src={getFlagUrl(jogo.time_fora)} alt={jogo.time_fora} className="flag-img" />
          <span className={jogo.time_fora === 'Brazil' || jogo.time_fora === 'Brasil' ? 'text-gold' : 'text-white'}>
            {translateTeam(jogo.time_fora)}
          </span>
        </div>
      </div>

      <div className="w-full mt-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
          <i className="far fa-clock"></i> {new Date(jogo.data_hora).toLocaleString()} 
          {jogo.status === 'FINISHED' && (
            <span className="text-gold ml-2">&bull; Final: {jogo.placar_casa}x{jogo.placar_fora}</span>
          )}
          {isTooEarly && (
            <span className="text-blue-400 ml-2">&bull; Abre em: {new Date(gameTime - oneWeek).toLocaleDateString()}</span>
          )}
        </div>
        <button
          onClick={() => onSavePalpite(jogo.id)}
          disabled={isLocked}
          className="legacy-btn scale-90 md:scale-100 disabled:opacity-30 disabled:grayscale"
        >
          <i className={`fas ${isTooEarly ? 'fa-calendar-alt' : isTooLate ? 'fa-lock' : 'fa-save'} mr-2`}></i> 
          {isTooEarly ? 'Aguardando' : isTooLate ? 'Palpite Bloqueado' : 'Selar Palpite'}
        </button>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [palpites, setPalpites] = useState<Record<string, Palpite>>({});
  const [loading, setLoading] = useState(true);
  const [elitePredictions, setElitePredictions] = useState({ champion: '', scorer: '' });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [jogosRes, palpitesRes] = await Promise.all([
          api.get('/jogos'),
          api.get('/palpites/me')
        ]);
        
        const games: Jogo[] = jogosRes.data?.data || [];
        
        // Remover duplicatas
        const uniqueGames = games.filter((game, index, self) => 
          index === self.findIndex((g) => g.id === game.id)
        );

        // Ordenar jogos por data
        const sortedGames = uniqueGames.sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime());

        setJogos(sortedGames);
        
        const palpitesMap: Record<string, Palpite> = {};
        const palpitesData = palpitesRes.data?.data;
        
        if (palpitesData && Array.isArray(palpitesData)) {
          palpitesData.forEach((p: any) => {
            if (p && p.jogo_id) {
              palpitesMap[p.jogo_id] = {
                jogo_id: p.jogo_id,
                palpite_casa: p.palpite_casa ?? 0,
                palpite_fora: p.palpite_fora ?? 0,
              };
            }
          });
        }
        setPalpites(palpitesMap);
        
        if (user) {
          setElitePredictions({
            champion: user.campeao_aposta || '',
            scorer: user.artilheiro_aposta || ''
          });
        }

      } catch (err) {
        console.error('Erro ao buscar dados:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleEliteChange = (field: 'champion' | 'scorer', value: string) => {
    setElitePredictions(prev => ({ ...prev, [field]: value }));
  };

  const saveElitePredictions = async () => {
    try {
      await api.put('/user/previsoes-elite', elitePredictions);
      alert('Previsões de elite salvas!');
    } catch {
      alert('Erro ao salvar previsões de elite');
    }
  };

  const handlePalpiteChange = useCallback((jogoId: string, team: 'casa' | 'fora', value: string) => {
    const numValue = parseInt(value) || 0;
    setPalpites(prev => ({
      ...prev,
      [jogoId]: {
        ...(prev[jogoId] || { jogo_id: jogoId, palpite_casa: 0, palpite_fora: 0 }),
        [team === 'casa' ? 'palpite_casa' : 'palpite_fora']: numValue,
      }
    }));
  }, []);

  const savePalpite = useCallback(async (jogoId: string) => {
    const palpite = palpites[jogoId];
    if (!palpite) return;

    try {
      await api.post('/palpites', palpite);
      alert('Palpite salvo com sucesso!');
    } catch (error) {
      if (isAxiosError(error)) {
        alert(error.response?.data?.message || 'Erro ao salvar palpite');
      } else {
        alert('Erro ao salvar palpite');
      }
    }
  }, [palpites]);

  if (loading) return <div className="text-white text-center mt-20">Carregando...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-2">
            Olá, <span className="text-gold">{user?.nome?.split(' ')[0]}</span>
          </h1>
          <p className="text-gray-500 font-medium tracking-widest uppercase text-xs">
            Matrícula: <span className="text-gray-300">{user?.matricula}</span> &bull; 
            Status: <span className={`font-bold ${user?.status === 'ATIVO' ? 'text-green-500' : 'text-gold'}`}>{user?.status}</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Seu Saldo</p>
            <p className="text-2xl font-display font-black text-white">0 <span className="text-gold text-sm">pts</span></p>
          </div>
        </div>
      </header>

      {user?.status !== 'ATIVO' && (
        <div className="legacy-card p-8 mb-16 flex items-start gap-6 border-gold/30">
          <div className="bg-gold/10 p-4 rounded-full">
            <i className="fas fa-exclamation-circle text-gold text-3xl" />
          </div>
          <div>
            <h3 className="text-gold font-display text-xl font-bold mb-2 uppercase tracking-wider">Conta não ativada</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Para validar sua participação e começar a acumular pontos no ranking, realize o pagamento da inscrição e envie o comprovante para análise.
            </p>
          </div>
        </div>
      )}

      <div className="legacy-card p-8 mb-12 flex items-center gap-6">
        <i className="fas fa-clock text-gold text-2xl" />
        <p className="text-gray-400 text-sm leading-relaxed">
          Os palpites ficam disponíveis <b>uma semana antes</b> do jogo e fecham <b>1 hora antes</b> do início da partida. Não é necessário preencher tudo de uma vez!
        </p>
      </div>

      <section className="mb-20">
        <div className="grid grid-cols-1 gap-6">
          {jogos.length > 0 ? (
            jogos.map(j => (
              <GameCard 
                key={j.id} 
                jogo={j} 
                palpite={palpites[j.id] || { jogo_id: j.id, palpite_casa: 0, palpite_fora: 0 }}
                onPalpiteChange={handlePalpiteChange}
                onSavePalpite={savePalpite}
              />
            ))
          ) : (
            <div className="text-center py-20 text-gray-600 font-display italic">Nenhum jogo agendado.</div>
          )}
        </div>
      </section>

      <section className="mt-20 pt-20 border-t border-white/5">
        <h2 className="font-display text-3xl font-bold text-white mb-12 uppercase tracking-widest flex items-center gap-4">
          <i className="fas fa-crown text-gold" /> Previsões de Elite
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div className="flex flex-col gap-4">
            <label className="text-gray-500 text-[10px] uppercase font-black tracking-widest ml-4">Campeão da Copa</label>
            <input 
              type="text" 
              value={elitePredictions.champion}
              onChange={(e) => handleEliteChange('champion', e.target.value)}
              className="input-text" 
              placeholder="Sua aposta para o campeão"
            />
          </div>
          <div className="flex flex-col gap-4">
            <label className="text-gray-500 text-[10px] uppercase font-black tracking-widest ml-4">Artilheiro da Copa</label>
            <input 
              type="text" 
              value={elitePredictions.scorer}
              onChange={(e) => handleEliteChange('scorer', e.target.value)}
              className="input-text" 
              placeholder="Sua aposta para o artilheiro"
            />
          </div>
        </div>
        <div className="text-center">
          <button 
            onClick={saveElitePredictions}
            className="legacy-btn !px-12"
          >
            <i className="fas fa-save mr-2" /> Selar Previsões de Elite
          </button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
