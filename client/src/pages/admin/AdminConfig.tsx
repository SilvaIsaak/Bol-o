import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { isAxiosError } from 'axios';

interface GlobalConfig {
  valor_inscricao: number;
  custo_operacional: number;
}

const AdminConfig: React.FC = () => {
  const [config, setConfig] = useState<GlobalConfig>({ valor_inscricao: 70, custo_operacional: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/admin/config');
      setConfig(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchConfig();
    };
    init();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/config', config);
      alert('Configurações salvas e prêmios recalculados!');
    } catch (err) {
      if (isAxiosError(err)) {
        alert(err.response?.data?.message || 'Erro ao salvar');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-white p-8 text-center">Carregando configurações...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-12">
        <i className="fas fa-cogs text-gray-400 text-4xl" />
        <div>
          <h1 className="font-display text-4xl font-bold text-white uppercase tracking-tighter">
            Configurações <span className="text-gray-400">Globais</span>
          </h1>
          <p className="text-gray-500 text-[10px] uppercase font-black tracking-[0.3em]">Parâmetros financeiros do bolão</p>
        </div>
      </div>

      <div className="legacy-card p-10">
        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-4">Valor da Inscrição (R$)</label>
              <div className="relative">
                <i className="fas fa-dollar-sign absolute left-5 top-1/2 -translate-y-1/2 text-gold opacity-50" />
                <input 
                  type="number" 
                  value={config.valor_inscricao}
                  onChange={(e) => setConfig({ ...config, valor_inscricao: parseFloat(e.target.value) })}
                  className="input-text !pl-12"
                  step="0.01"
                  required
                />
              </div>
              <p className="mt-2 text-[9px] text-gray-500 uppercase tracking-widest">Base de cálculo para todos os prêmios</p>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-4">Custo Operacional por Participante (R$)</label>
              <div className="relative">
                <i className="fas fa-calculator absolute left-5 top-1/2 -translate-y-1/2 text-gold opacity-50" />
                <input 
                  type="number" 
                  value={config.custo_operacional}
                  onChange={(e) => setConfig({ ...config, custo_operacional: parseFloat(e.target.value) })}
                  className="input-text !pl-12"
                  step="0.01"
                  required
                />
              </div>
              <p className="mt-2 text-[9px] text-gray-500 uppercase tracking-widest">Valor descontado da arrecadação antes dos prêmios</p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5">
            <button
              type="submit"
              disabled={saving}
              className="legacy-btn w-full !py-5"
            >
              {saving ? (
                <>
                  <i className="fas fa-spinner animate-spin mr-2" /> Salvando...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2" /> Salvar e Recalcular
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-12 bg-gold/5 border border-gold/20 p-8 rounded-2xl flex items-start gap-6">
        <i className="fas fa-info-circle text-gold text-2xl mt-1" />
        <div className="space-y-2">
          <p className="text-white text-xs font-black uppercase tracking-widest">Nota de Recálculo</p>
          <p className="text-gray-400 text-xs leading-relaxed">
            Ao alterar esses valores, o sistema irá recalcular automaticamente o <b>Valor Calculado</b> de todos os prêmios do tipo "DINHEIRO" baseando-se no número atual de participantes ativos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminConfig;
