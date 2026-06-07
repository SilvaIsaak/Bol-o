import React, { useEffect, useState } from 'react';
import api from '../../services/api';

interface AuditLog {
  id: string;
  user_id: string;
  user: {
    nome: string;
  } | null;
  acao: string;
  entidade: string;
  entidade_id: string;
  payload: any;
  ip_address: string | null;
  created_at: string;
}

const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/logs?page=${page}&limit=50`);
      setLogs(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  if (loading && pagination.page === 1) return <div className="text-white p-8 text-center">Carregando logs de auditoria...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-12">
        <i className="fas fa-history text-red-500 text-4xl" />
        <div>
          <h1 className="font-display text-4xl font-bold text-white uppercase tracking-tighter">
            Logs de <span className="text-red-500">Auditoria</span>
          </h1>
          <p className="text-gray-500 text-[10px] uppercase font-black tracking-[0.3em]">Histórico completo de ações administrativas</p>
        </div>
      </div>

      <div className="legacy-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                <th className="px-8 py-6 text-gold font-black uppercase text-[10px] tracking-[0.2em]">Data/Hora</th>
                <th className="px-8 py-6 text-gold font-black uppercase text-[10px] tracking-[0.2em]">Administrador</th>
                <th className="px-8 py-6 text-gold font-black uppercase text-[10px] tracking-[0.2em]">Ação</th>
                <th className="px-8 py-6 text-gold font-black uppercase text-[10px] tracking-[0.2em]">Entidade</th>
                <th className="px-8 py-6 text-gold font-black uppercase text-[10px] tracking-[0.2em]">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-white/5">
                  <td className="px-8 py-6 text-gray-400 font-mono text-xs">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-white font-display font-bold">{log.user?.nome || 'Sistema'}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">{log.acao}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-gray-300 text-xs font-bold">{log.entidade}</span>
                      <span className="text-gray-600 text-[9px] font-mono">{log.entidade_id}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-gray-500 font-mono text-[10px]">
                    {log.ip_address || 'N/A'}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-gray-600 font-display italic">
                    Nenhum log registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="p-8 flex items-center justify-between border-t border-white/5 bg-white/1">
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
              Total de {pagination.total} registros
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => fetchLogs(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-3 bg-white/5 text-white rounded-xl hover:bg-white/10 disabled:opacity-20 transition-all"
              >
                <i className="fas fa-chevron-left" />
              </button>
              <div className="flex items-center px-4 bg-gold/10 text-gold rounded-xl font-display font-black text-xs">
                {pagination.page} / {pagination.totalPages}
              </div>
              <button
                onClick={() => fetchLogs(pagination.page + 1)}
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

export default AdminLogs;
