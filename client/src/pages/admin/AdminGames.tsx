import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { isAxiosError } from 'axios';
import { translateTeam, translateStage, getFlagUrl } from '../../utils/translations';

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

const AdminGames: React.FC = () => {
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchGames = async () => {
    try {
      const res = await api.get('/jogos');
      const games: Jogo[] = res.data.data || [];
      
      // Remover duplicatas e ordenar por data
      const uniqueGames = games
        .filter((game, index, self) => index === self.findIndex((g) => g.id === game.id))
        .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime());
        
      setJogos(uniqueGames);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchGames();
    };
    init();
  }, []);

  const handleLocalChange = (id: string, field: string, value: string | number) => {
    setJogos(prev => prev.map(j => j.id === id ? { ...j, [field]: value } : j));
  };

  const handleUpdateScore = async (jogo: Jogo) => {
    setUpdating(jogo.id);
    try {
      await api.put(`/admin/jogos/${jogo.id}/placar`, { 
        placar_casa: Number(jogo.placar_casa), 
        placar_fora: Number(jogo.placar_fora), 
        status: jogo.status 
      });
      alert('Placar atualizado e pontos recalculados!');
      fetchGames();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        alert(err.response?.data?.message || 'Erro ao atualizar');
      } else {
        alert('Erro ao atualizar');
      }
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="text-white p-8 text-center">Carregando jogos...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <i className="fas fa-calculator text-yellow-500 text-4xl" />
          <div>
            <h1 className="font-display text-4xl font-bold text-white uppercase tracking-tighter">
              Gestão de <span className="text-yellow-500">Placares</span>
            </h1>
            <p className="text-gray-500 text-[10px] uppercase font-black tracking-[0.3em]">Atualização e Recálculo de Pontos</p>
          </div>
        </div>
        <button 
          onClick={fetchGames}
          className="legacy-btn !py-3 !px-6 text-xs tracking-widest bg-white/5 border border-white/10 text-white hover:bg-white/10"
        >
          <i className={`fas fa-sync-alt mr-2 ${loading ? 'animate-spin' : ''}`} /> Atualizar Lista
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {jogos.map((jogo) => (
          <div key={jogo.id} className={`legacy-card p-8 flex flex-col group ${jogo.is_brazil_game ? 'border-yellow-500/50' : ''}`}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">{translateStage(jogo.fase)}</span>
                {jogo.is_brazil_game && <i className="fas fa-star text-yellow-500" />}
              </div>
              <span className="text-[10px] text-gray-500 font-mono">{new Date(jogo.data_hora).toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="flex-1 flex flex-col items-end gap-2">
                <img src={getFlagUrl(jogo.time_casa)} alt={jogo.time_casa} className="w-10 h-7 object-cover rounded shadow-sm border border-white/10" />
                <div className="text-white font-display font-bold text-sm text-right">{translateTeam(jogo.time_casa)}</div>
              </div>
              <div className="flex items-center gap-2 bg-black/40 p-3 rounded-xl border border-white/5">
                <input 
                  type="number" 
                  value={jogo.placar_casa ?? 0}
                  onChange={(e) => handleLocalChange(jogo.id, 'placar_casa', e.target.value)}
                  className="w-10 h-10 bg-transparent text-center text-yellow-500 font-black font-display text-2xl outline-none"
                />
                <span className="text-gray-700 font-display italic">vs</span>
                <input 
                  type="number" 
                  value={jogo.placar_fora ?? 0}
                  onChange={(e) => handleLocalChange(jogo.id, 'placar_fora', e.target.value)}
                  className="w-10 h-10 bg-transparent text-center text-yellow-500 font-black font-display text-2xl outline-none"
                />
              </div>
              <div className="flex-1 flex flex-col items-start gap-2">
                <img src={getFlagUrl(jogo.time_fora)} alt={jogo.time_fora} className="w-10 h-7 object-cover rounded shadow-sm border border-white/10" />
                <div className="text-white font-display font-bold text-sm text-left">{translateTeam(jogo.time_fora)}</div>
              </div>
            </div>

            <div className="space-y-4 mt-auto">
              <div className="relative">
                <select 
                  value={jogo.status}
                  onChange={(e) => handleLocalChange(jogo.id, 'status', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-[10px] font-black uppercase tracking-widest appearance-none outline-none focus:border-yellow-500/50"
                >
                  <option value="SCHEDULED">AGENDADO</option>
                  <option value="LIVE">AO VIVO</option>
                  <option value="FINISHED">FINALIZADO</option>
                </select>
              </div>

              <button 
                onClick={() => handleUpdateScore(jogo)}
                disabled={updating === jogo.id}
                className="legacy-btn w-full !py-4 text-xs tracking-tighter disabled:opacity-50"
              >
                <i className="fas fa-save mr-2" /> {updating === jogo.id ? 'Salvando...' : 'Atualizar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminGames;
