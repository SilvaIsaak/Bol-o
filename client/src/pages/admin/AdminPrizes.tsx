import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { isAxiosError } from 'axios';

interface Premio {
  id?: string;
  descricao: string;
  tipo: 'DINHEIRO' | 'OBJETO';
  percentual: number | null;
  valor_calculado: number;
}

const AdminPrizes: React.FC = () => {
  const [premios, setPremios] = useState<Premio[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPrizes = async () => {
    try {
      const res = await api.get('/admin/premios');
      setPremios(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchPrizes();
    };
    init();
  }, []);

  const handleSave = async (premio: Premio) => {
    setSaving(true);
    try {
      await api.post('/admin/premios', premio);
      alert('Prêmio salvo com sucesso!');
      fetchPrizes();
    } catch (err) {
      if (isAxiosError(err)) {
        alert(err.response?.data?.message || 'Erro ao salvar');
      }
    } finally {
      setSaving(false);
    }
  };

  const addEmptyPrize = () => {
    setPremios([...premios, { descricao: '', tipo: 'DINHEIRO', percentual: 0, valor_calculado: 0 }]);
  };

  if (loading) return <div className="text-white p-8 text-center">Carregando prêmios...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <i className="fas fa-gift text-purple-500 text-4xl" />
          <div>
            <h1 className="font-display text-4xl font-bold text-white uppercase tracking-tighter">
              Gestão de <span className="text-purple-500">Prêmios</span>
            </h1>
            <p className="text-gray-500 text-[10px] uppercase font-black tracking-[0.3em]">Definição de Recompensas e Percentuais</p>
          </div>
        </div>
        <button 
          onClick={addEmptyPrize}
          className="legacy-btn !py-3 !px-6 text-xs tracking-widest"
        >
          <i className="fas fa-plus mr-2" /> Novo Prêmio
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {premios.map((p, index) => (
          <div key={p.id || index} className="legacy-card p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Descrição</label>
                <input 
                  type="text" 
                  value={p.descricao}
                  onChange={(e) => {
                    const newPremios = [...premios];
                    newPremios[index].descricao = e.target.value;
                    setPremios(newPremios);
                  }}
                  placeholder="Ex: 1º Lugar"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Tipo</label>
                <select 
                  value={p.tipo}
                  onChange={(e) => {
                    const newPremios = [...premios];
                    newPremios[index].tipo = e.target.value as 'DINHEIRO' | 'OBJETO';
                    if (e.target.value === 'OBJETO') newPremios[index].percentual = null;
                    setPremios(newPremios);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-xs font-black uppercase tracking-widest outline-none"
                >
                  <option value="DINHEIRO">EM DINHEIRO (%)</option>
                  <option value="OBJETO">BEM MATERIAL (VALOR FIXO)</option>
                </select>
              </div>
              <div className="flex gap-4">
                {p.tipo === 'DINHEIRO' ? (
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Percentual (%)</label>
                    <input 
                      type="number" 
                      value={p.percentual || 0}
                      onChange={(e) => {
                        const newPremios = [...premios];
                        newPremios[index].percentual = parseFloat(e.target.value);
                        setPremios(newPremios);
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm outline-none"
                    />
                  </div>
                ) : (
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Valor Estimado</label>
                    <input 
                      type="number" 
                      value={p.valor_calculado}
                      onChange={(e) => {
                        const newPremios = [...premios];
                        newPremios[index].valor_calculado = parseFloat(e.target.value);
                        setPremios(newPremios);
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm outline-none"
                    />
                  </div>
                )}
                <button 
                  onClick={() => handleSave(p)}
                  disabled={saving}
                  className="p-4 bg-purple-500/10 text-purple-500 rounded-xl hover:bg-purple-500 hover:text-white transition-all border border-purple-500/20"
                >
                  <i className="fas fa-save" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {premios.length === 0 && (
          <div className="text-center py-20 text-gray-600 font-display italic">
            Nenhum prêmio cadastrado. Use o botão "Novo Prêmio" para começar.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPrizes;
