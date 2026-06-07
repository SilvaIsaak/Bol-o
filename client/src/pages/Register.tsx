import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { isAxiosError } from 'axios';

const registerSchema = z.object({
  nome: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  cpf: z.string().min(11, 'CPF inválido'),
  whatsapp: z.string().min(10, 'Whatsapp inválido'),
  senha: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmarSenha: z.string()
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await api.post('/auth/register', data);
      alert('Cadastro realizado! Efetue o pagamento para ativar sua conta.');
      
      // Fazer login automático para ir direto para a tela de pagamento
      await login(data.email, data.senha);
      navigate('/pagamento');
    } catch (error) {
      if (isAxiosError(error)) {
        alert(error.response?.data?.message || 'Erro ao realizar cadastro');
      } else {
        alert('Erro ao realizar cadastro');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="auth-card relative overflow-hidden !max-w-lg">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <i className="fas fa-trophy text-gold text-8xl"></i>
        </div>

        <div className="text-center relative z-10 mb-10">
          <div className="bg-gold/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold/20">
            <i className="fas fa-trophy h-8 w-8 text-gold flex items-center justify-center" />
          </div>
          <h2 className="font-display text-3xl font-black text-white uppercase tracking-tighter">
            Criar <span className="text-gold">Nova Conta</span>
          </h2>
          <p className="mt-2 text-[10px] text-gray-500 uppercase font-black tracking-[0.3em]">Junte-se à elite da Copa 2026</p>
        </div>

        <form className="auth-form relative z-10" onSubmit={handleSubmit(onSubmit)}>
          <div className="auth-input-group">
            <label>Nome Completo</label>
            <input 
              {...register('nome')} 
              placeholder="Digite seu nome"
              className="input-text" 
            />
            {errors.nome && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.nome.message}</p>}
          </div>
          <div className="auth-input-group">
            <label>Seu Melhor Email</label>
            <input 
              {...register('email')} 
              type="email" 
              placeholder="exemplo@email.com"
              className="input-text" 
            />
            {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="auth-input-group">
              <label>CPF</label>
              <input 
                {...register('cpf')} 
                placeholder="000.000.000-00"
                className="input-text" 
              />
              {errors.cpf && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.cpf.message}</p>}
            </div>
            <div className="auth-input-group">
              <label>Whatsapp</label>
              <input 
                {...register('whatsapp')} 
                placeholder="(00) 00000-0000"
                className="input-text" 
              />
              {errors.whatsapp && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.whatsapp.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="auth-input-group">
              <label>Sua Senha</label>
              <input 
                {...register('senha')} 
                type="password" 
                placeholder="••••••••"
                className="input-text" 
            />
              {errors.senha && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.senha.message}</p>}
            </div>
            <div className="auth-input-group">
              <label>Confirmar</label>
              <input 
                {...register('confirmarSenha')} 
                type="password" 
                placeholder="••••••••"
                className="input-text" 
              />
              {errors.confirmarSenha && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.confirmarSenha.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="legacy-btn w-full mt-4 disabled:opacity-50"
          >
            <i className="fas fa-user-plus mr-2"></i>
            {isSubmitting ? 'Cadastrando...' : 'Criar Minha Conta'}
          </button>
        </form>

        <div className="text-center mt-10 relative z-10 pt-8 border-t border-white/5">
          <p className="text-gray-500 text-xs font-medium">
            Já possui uma conta? 
            <Link to="/login" className="text-gold font-bold hover:underline ml-2 uppercase tracking-widest text-[10px]">
              Fazer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
