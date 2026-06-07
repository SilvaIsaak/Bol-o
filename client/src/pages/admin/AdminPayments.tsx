import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { isAxiosError } from 'axios';

interface Pagamento {
  id: string;
  user_id: string;
  user: {
    nome: string;
    email: string;
    matricula: string;
  };
  comprovante_url: string;
  status: string;
  valor: number;
  created_at: string;
}

const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveSubTab] = useState<'PENDENTE' | 'EM_ANALISE' | 'APROVADO'>('EM_ANALISE');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  const fetchPayments = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/pagamentos?page=${page}&limit=20`);
      setPayments(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(1);
  }, []);

  const filteredPayments = payments.filter(p => p.status === activeTab);

  const handleApprove = async (id: string) => {
    if (!confirm('Deseja aprovar este pagamento? O usuário será ativado.')) return;
    try {
      await api.put(`/admin/pagamentos/${id}/aprovar`);
      alert('Pagamento aprovado!');
      fetchPayments(pagination.page);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        alert(err.response?.data?.message || 'Erro ao aprovar');
      } else {
        alert('Erro ao aprovar');
      }
    }
  };

  const handleReject = async (_id: string, userId: string) => {
    const reason = prompt('Motivo da rejeição:');
    if (reason === null) return;
    
    try {
      await api.put(`/admin/usuarios/${userId}/status`, { status: 'AGUARDANDO_PAGAMENTO' });
      alert('Pagamento rejeitado e usuário notificado.');
      fetchPayments(pagination.page);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        alert(err.response?.data?.message || 'Erro ao rejeitar');
      } else {
        alert('Erro ao rejeitar');
      }
    }
  };

  if (loading) return <div className="text-white p-8 text-center">Carregando pagamentos...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-12">
        <i className="fas fa-dollar-sign text-green-500 text-4xl" />
        <div>
          <h1 className="font-display text-4xl font-bold text-white uppercase tracking-tighter">
            Gestão de <span className="text-green-500">Pagamentos</span>
          </h1>
          <p className="text-gray-500 text-[10px] uppercase font-black tracking-[0.3em]">Auditoria de Inscrições e Comprovantes</p>
        </div>
      </div>

      <div className="sub-tabs mb-12">
        <button 
          className={`sub-tab-btn ${activeTab === 'PENDENTE' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('PENDENTE')}
        >
          <i className="fas fa-user-clock mr-2" /> Pendentes
        </button>
        <button 
          className={`sub-tab-btn ${activeTab === 'EM_ANALISE' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('EM_ANALISE')}
        >
          <i className="fas fa-exclamation-circle mr-2" /> Aguardando Conferência
        </button>
        <button 
          className={`sub-tab-btn ${activeTab === 'APROVADO' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('APROVADO')}
        >
          <i className="fas fa-check-double mr-2" /> Confirmados
        </button>
      </div>

      <div className="legacy-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                <th className="px-8 py-6 text-gold font-black uppercase text-[10px] tracking-[0.2em]">Participante</th>
                <th className="px-8 py-6 text-gold font-black uppercase text-[10px] tracking-[0.2em]">Valor</th>
                <th className="px-8 py-6 text-gold font-black uppercase text-[10px] tracking-[0.2em] text-center">Comprovante</th>
                <th className="px-8 py-6 text-gold font-black uppercase text-[10px] tracking-[0.2em]">Data Envio</th>
                <th className="px-8 py-6 text-gold font-black uppercase text-[10px] tracking-[0.2em] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-white/5">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-white font-display font-bold">{p.user.nome}</span>
                      <span className="text-gray-500 font-mono text-[10px] tracking-widest">{p.user.matricula}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-white font-black font-display text-lg">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valor)}
                  </td>
                  <td className="px-8 py-6 text-center">
                    {p.comprovante_url ? (
                      <a 
                        href={p.comprovante_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-400 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
                      >
                        <i className="fas fa-external-link-alt" /> Ver Anexo
                      </a>
                    ) : (
                      <span className="text-gray-600 text-[10px] uppercase font-black tracking-widest">Sem comprovante</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-gray-500 font-mono text-[10px]">
                    {new Date(p.created_at).toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      {p.status === 'EM_ANALISE' && (
                        <>
                          <button 
                            onClick={() => handleApprove(p.id)}
                            className="p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all shadow-lg hover:shadow-green-500/20"
                            title="Aprovar"
                          >
                            <i className="fas fa-check-circle text-xl" />
                          </button>
                          <button 
                            onClick={() => handleReject(p.id, p.user_id)}
                            className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-500/20"
                            title="Rejeitar"
                          >
                            <i className="fas fa-times-circle text-xl" />
                          </button>
                        </>
                      )}
                      {p.status === 'APROVADO' && (
                        <div className="text-green-500 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                          <i className="fas fa-check-double" /> Confirmado
                        </div>
                      )}
                      {p.status === 'PENDENTE' && (
                        <div className="text-gold flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                          <i className="fas fa-clock" /> Aguardando
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-gray-600 font-display italic">
                    Nenhum pagamento nesta categoria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="p-8 flex items-center justify-between border-t border-white/5 bg-white/1">
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
              Mostrando {payments.length} de {pagination.total} pagamentos
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => fetchPayments(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-3 bg-white/5 text-white rounded-xl hover:bg-white/10 disabled:opacity-20 transition-all"
              >
                <i className="fas fa-chevron-left" />
              </button>
              <div className="flex items-center px-4 bg-gold/10 text-gold rounded-xl font-display font-black text-xs">
                {pagination.page} / {pagination.totalPages}
              </div>
              <button
                onClick={() => fetchPayments(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-3 bg-white/5 text-white rounded-xl hover:bg-white/10 disabled:opacity-20 transition-all"
              >
                <i className="fas fa-chevron-right" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;
