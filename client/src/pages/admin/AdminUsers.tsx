import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { isAxiosError } from 'axios';
import { useAuth } from '../../hooks/useAuth';

interface User {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  status: string;
  role: string;
  pix?: string;
  whatsapp?: string;
}

const AdminUsers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/usuarios?page=${page}&limit=20`);
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/admin/usuarios/${id}/status`, { status });
      fetchUsers(pagination.page);
      alert('Status atualizado!');
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        alert(err.response?.data?.message || 'Erro ao atualizar status');
      } else {
        alert('Erro ao atualizar status');
      }
    }
  };

  const deleteUser = async (id: string, nome: string) => {
    const confirmed = window.confirm(`Deseja realmente apagar o usuário "${nome}"?`);
    if (!confirmed) return;

    try {
      await api.delete(`/admin/usuarios/${id}`);
      await fetchUsers(pagination.page);
      alert('Usuário removido com sucesso!');
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        alert(err.response?.data?.message || 'Erro ao remover usuário');
      } else {
        alert('Erro ao remover usuário');
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.matricula.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-white p-8">Carregando usuários...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end mb-10">
        <div className="flex items-center gap-4">
          <i className="fas fa-users text-blue-500 text-4xl" />
          <div>
            <h1 className="font-display text-4xl font-bold text-white uppercase tracking-tighter">
              Gestão de <span className="text-blue-500">Usuários</span>
            </h1>
            <p className="text-gray-500 text-[10px] uppercase font-black tracking-[0.3em]">Controle de Acesso e Participantes</p>
          </div>
        </div>
        
        <div className="relative w-full lg:w-96 group">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou matrícula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-gold/50 transition-all"
          />
        </div>
      </div>

      <div className="legacy-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                <th className="px-8 py-6 text-gold font-black uppercase text-[10px] tracking-[0.2em]">Participante</th>
                <th className="px-8 py-6 text-gold font-black uppercase text-[10px] tracking-[0.2em]">Matrícula</th>
                <th className="px-8 py-6 text-gold font-black uppercase text-[10px] tracking-[0.2em]">WhatsApp</th>
                <th className="px-8 py-6 text-gold font-black uppercase text-[10px] tracking-[0.2em]">Pix</th>
                <th className="px-8 py-6 text-gold font-black uppercase text-[10px] tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-gold font-black uppercase text-[10px] tracking-[0.2em] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((rowUser) => (
                <tr key={rowUser.id} className="transition-colors hover:bg-white/5">
                  <td className="px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-white font-display font-bold">{rowUser.nome}</span>
                      <span className="text-gray-500 text-[10px] tracking-widest uppercase">{rowUser.email}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 lg:px-8 py-6 text-gray-400 font-mono text-xs tracking-widest">{rowUser.matricula}</td>
                  <td className="px-4 sm:px-6 lg:px-8 py-6 text-gray-400 text-xs tracking-widest">
                    {rowUser.whatsapp || <span className="text-gray-600 italic">Não informado</span>}
                  </td>
                  <td className="px-4 sm:px-6 lg:px-8 py-6 text-gray-400 text-xs tracking-widest">
                    {rowUser.pix || <span className="text-gray-600 italic">Não informado</span>}
                  </td>
                  <td className="px-4 sm:px-6 lg:px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${
                      rowUser.status === 'ATIVO' ? 'bg-green-500/10 text-green-500' : 
                      rowUser.status === 'PENDENTE_PAGAMENTO' ? 'bg-gold/10 text-gold' :
                      rowUser.status === 'AGUARDANDO_APROVACAO' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {rowUser.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 lg:px-8 py-6 text-right">
                    <div className="flex flex-wrap justify-end items-center gap-2 sm:gap-3">
                      {rowUser.status !== 'ATIVO' && (
                        <button 
                          onClick={() => updateStatus(rowUser.id, 'ATIVO')}
                          className="p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all shadow-lg hover:shadow-green-500/20"
                          title="Ativar Participante"
                        >
                          <i className="fas fa-user-check text-xl" />
                        </button>
                      )}
                      {rowUser.status === 'ATIVO' && (
                        <button 
                          onClick={() => updateStatus(rowUser.id, 'PENDENTE_PAGAMENTO')}
                          className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-500/20"
                          title="Suspender Participante"
                        >
                          <i className="fas fa-user-times text-xl" />
                        </button>
                      )}
                      {(currentUser?.role === 'ADMIN') && rowUser.id !== currentUser?.id && (
                        <button
                          onClick={() => deleteUser(rowUser.id, rowUser.nome)}
                          className="p-3 bg-rose-500/10 text-rose-300 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-lg hover:shadow-rose-500/20"
                          title="Apagar usuário"
                        >
                          <i className="fas fa-trash text-xl" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-gray-600 font-display italic">
                    Nenhum participante encontrado com estes critérios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="p-8 flex items-center justify-between border-t border-white/5 bg-white/1">
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
              Mostrando {users.length} de {pagination.total} participantes
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-3 bg-white/5 text-white rounded-xl hover:bg-white/10 disabled:opacity-20 transition-all"
              >
                <i className="fas fa-chevron-left" />
              </button>
              <div className="flex items-center px-4 bg-gold/10 text-gold rounded-xl font-display font-black text-xs">
                {pagination.page} / {pagination.totalPages}
              </div>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
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

export default AdminUsers;
