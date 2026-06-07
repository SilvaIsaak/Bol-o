import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Ranking from './pages/Ranking';
import Prizes from './pages/Prizes';
import Payment from './pages/Payment';
import Settings from './pages/Settings';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPayments from './pages/admin/AdminPayments';
import AdminGames from './pages/admin/AdminGames';
import AdminPrizes from './pages/admin/AdminPrizes';
import AdminConfig from './pages/admin/AdminConfig';
import AdminLogs from './pages/admin/AdminLogs';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected User Routes */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/premios" element={<Prizes />} />
            <Route path="/pagamento" element={<Payment />} />
            <Route path="/configuracoes" element={<Settings />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute adminOnly><Layout /></ProtectedRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/usuarios" element={<AdminUsers />} />
            <Route path="/admin/pagamentos" element={<AdminPayments />} />
            <Route path="/admin/jogos" element={<AdminGames />} />
            <Route path="/admin/premios" element={<AdminPrizes />} />
            <Route path="/admin/config" element={<AdminConfig />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
          </Route>

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
