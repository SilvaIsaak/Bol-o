import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { isAxiosError } from 'axios';

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Profile fields
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [pix, setPix] = useState('');
  
  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  useEffect(() => {
    if (user) {
      setNome(user.nome);
      setWhatsapp(user.whatsapp);
      setPix(user.pix || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const res = await api.put('/user/me', { nome, whatsapp, pix });
      updateUser(res.data.data);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      if (isAxiosError(error)) {
        alert(error.response?.data?.message || 'Erro ao atualizar perfil');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('As senhas não conferem!');
      return;
    }
    try {
      setLoading(true);
      await api.put('/user/change-password', { oldPassword, newPassword });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Senha alterada com sucesso!');
    } catch (error) {
      if (isAxiosError(error)) {
        alert(error.response?.data?.message || 'Erro ao alterar senha');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-4xl font-bold text-white mb-12 uppercase tracking-tighter">
        <i className="fas fa-cog text-gold mr-4" /> Configurações
      </h1>

      <div className="grid gap-12">
        <div className="legacy-card">
          <h2 className="text-2xl font-display font-bold text-white mb-8 flex items-center gap-3">
            <i className="fas fa-user-circle text-gold" /> Dados Pessoais
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <label className="text-gray-500 text-[10px] uppercase font-black tracking-widest ml-4">
                Nome Completo
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="input-text"
                placeholder="Seu nome"
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-gray-500 text-[10px] uppercase font-black tracking-widest ml-4">
                WhatsApp
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="input-text"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="flex flex-col gap-4 md:col-span-2">
              <label className="text-gray-500 text-[10px] uppercase font-black tracking-widest ml-4">
                Chave Pix (opcional)
              </label>
              <input
                type="text"
                value={pix}
                onChange={(e) => setPix(e.target.value)}
                className="input-text"
                placeholder="E-mail, CPF, telefone ou chave aleatória"
              />
            </div>
          </div>

          <div className="mt-10">
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="legacy-btn !px-12"
            >
              <i className="fas fa-save mr-2" /> Salvar Alterações
            </button>
          </div>
        </div>

        <div className="legacy-card">
          <h2 className="text-2xl font-display font-bold text-white mb-8 flex items-center gap-3">
            <i className="fas fa-key text-gold" /> Alterar Senha
          </h2>

          <div className="grid gap-6 max-w-lg">
            <div className="flex flex-col gap-4">
              <label className="text-gray-500 text-[10px] uppercase font-black tracking-widest ml-4">
                Senha Atual
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="input-text"
                placeholder="Digite sua senha atual"
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-gray-500 text-[10px] uppercase font-black tracking-widest ml-4">
                Nova Senha
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-text"
                placeholder="Digite a nova senha (mínimo 6 caracteres)"
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-gray-500 text-[10px] uppercase font-black tracking-widest ml-4">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-text"
                placeholder="Confirme a nova senha"
              />
            </div>
          </div>

          <div className="mt-10">
            <button
              onClick={handleChangePassword}
              disabled={loading}
              className="legacy-btn !px-12"
            >
              <i className="fas fa-lock mr-2" /> Alterar Senha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
