import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface Metrics {
  totalUsers: number;
  activeUsers: number;
  pendingPayments: number;
  totalRevenue: number;
  totalOperationalCost: number;
  netRevenue: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setMetrics(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-white p-8">Carregando métricas...</div>;

  const cards = [
    { label: 'Total de Participantes', value: metrics?.totalUsers, icon: 'fa-users', color: 'text-blue-500' },
    { label: 'Participantes Ativos', value: metrics?.activeUsers, icon: 'fa-chart-line', color: 'text-green-500' },
    { label: 'Pagamentos Pendentes', value: metrics?.pendingPayments, icon: 'fa-clock', color: 'text-yellow-500' },
    { label: 'Arrecadação Bruta', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics?.totalRevenue || 0), icon: 'fa-dollar-sign', color: 'text-emerald-500' },
    { label: 'Custo Operacional', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics?.totalOperationalCost || 0), icon: 'fa-calculator', color: 'text-red-500' },
    { label: 'Arrecadação Líquida', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics?.netRevenue || 0), icon: 'fa-shield-alt', color: 'text-indigo-500' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-12">
        <i className="fas fa-shield-alt text-red-500 text-4xl" />
        <div>
          <h1 className="font-display text-4xl font-bold text-white uppercase tracking-tighter">
            Painel <span className="text-red-500">Administrativo</span>
          </h1>
          <p className="text-gray-500 text-[10px] uppercase font-black tracking-[0.3em]">Controle total do ecossistema</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {cards.map((card, i) => (
          <div key={i} className="legacy-card p-8 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <i className={`fas ${card.icon} text-[100px]`} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <i className={`fas ${card.icon} ${card.color} text-2xl`} />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{card.label}</span>
              </div>
              <div className="text-3xl font-display font-black text-white">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="legacy-card p-10">
        <h2 className="font-display text-2xl font-bold text-white mb-8 uppercase tracking-widest flex items-center gap-3">
          <i className="fas fa-bolt text-gold" /> Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <button 
            onClick={() => navigate('/admin/usuarios')}
            className="legacy-btn !py-6 !px-4 text-xs tracking-tighter bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
          >
            <i className="fas fa-users mr-2 text-blue-500" /> Usuários
          </button>
          <button 
            onClick={() => navigate('/admin/pagamentos')}
            className="legacy-btn !py-6 !px-4 text-xs tracking-tighter bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
          >
            <i className="fas fa-dollar-sign mr-2 text-green-500" /> Pagamentos
          </button>
          <button 
            onClick={() => navigate('/admin/jogos')}
            className="legacy-btn !py-6 !px-4 text-xs tracking-tighter bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
          >
            <i className="fas fa-calculator mr-2 text-yellow-500" /> Placares
          </button>
          <button 
            onClick={() => navigate('/admin/premios')}
            className="legacy-btn !py-6 !px-4 text-xs tracking-tighter bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
          >
            <i className="fas fa-gift mr-2 text-purple-500" /> Prêmios
          </button>
          <button 
            onClick={() => navigate('/admin/config')}
            className="legacy-btn !py-6 !px-4 text-xs tracking-tighter bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
          >
            <i className="fas fa-cogs mr-2 text-gray-400" /> Configurações
          </button>
          <button 
            onClick={() => navigate('/admin/logs')}
            className="legacy-btn !py-6 !px-4 text-xs tracking-tighter bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
          >
            <i className="fas fa-history mr-2 text-red-400" /> Auditoria
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
