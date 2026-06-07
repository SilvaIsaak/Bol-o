import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-100 flex flex-col">
      <div className="user-info-bar">
        <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{user?.nome}</span>
        <button 
          onClick={handleLogout} 
          style={{ background: 'transparent', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '1.2em' }}
          title="Sair"
        >
          <i className="fas fa-power-off"></i>
        </button>
      </div>

      <header className="text-center py-20 px-4 relative">
        <h1 className="legacy-header-h1 text-6xl md:text-8xl font-black tracking-tighter leading-none mb-4">
          <i className="fas fa-trophy mr-4"></i> BOLÃO 2026
        </h1>
        <p className="text-gray-400 font-light text-xl md:text-2xl tracking-[0.3em] uppercase">
          Copa do Mundo 2026
        </p>
      </header>

      <nav className="tabs sticky top-0 z-50">
        <NavLink 
          to="/premios" 
          className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
        >
          <i className="fas fa-book-open mr-2"></i> Regras
        </NavLink>
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
        >
          <i className="fas fa-edit mr-2"></i> Meus Palpites
        </NavLink>
        <NavLink 
          to="/ranking" 
          className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
        >
          <i className="fas fa-trophy mr-2"></i> Ranking
        </NavLink>
        <NavLink 
          to="/configuracoes" 
          className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
        >
          <i className="fas fa-cog mr-2"></i> Configurações
        </NavLink>
        
        {user?.role === 'ADMIN' && (
          <NavLink 
            to="/admin" 
            className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
          >
            <i className="fas fa-tools mr-2"></i> Gestão
          </NavLink>
        )}
        
        {user?.status !== 'ATIVO' && user?.role !== 'ADMIN' && (
          <NavLink 
            to="/pagamento" 
            className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
          >
            <i className="fas fa-dollar-sign mr-2"></i> Pagamento
          </NavLink>
        )}
      </nav>

      <main className="flex-1 container mx-auto px-4 pb-20 max-w-5xl mt-12">
        <Outlet />
      </main>

      <footer className="py-12 border-t border-white/5 mt-auto">
        <div className="text-center text-gray-600 text-xs font-semibold tracking-widest uppercase">
          &copy; 2026 Bolão 2026 &bull; O Design que você ama
        </div>
      </footer>
    </div>
  );
};

export default Layout;
