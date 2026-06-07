import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isAxiosError } from 'axios';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.senha);
      navigate('/dashboard');
    } catch (error) {
      if (isAxiosError(error)) {
        alert(error.response?.data?.message || 'Erro ao fazer login');
      } else {
        alert('Erro ao fazer login');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="auth-card relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <i className="fas fa-trophy text-gold text-8xl"></i>
        </div>
        
        <div className="text-center relative z-10 mb-10">
          <div className="bg-gold/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold/20">
            <i className="fas fa-trophy h-8 w-8 text-gold flex items-center justify-center" />
          </div>
          <h2 className="font-display text-3xl font-black text-white uppercase tracking-tighter">
            Acesso ao <span className="text-gold">Bolão</span>
          </h2>
          <p className="mt-2 text-[10px] text-gray-500 uppercase font-black tracking-[0.3em]">Copa do Mundo 2026</p>
        </div>

        <form className="auth-form relative z-10" onSubmit={handleSubmit(onSubmit)}>
          <div className="auth-input-group">
            <label>Seu Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="exemplo@email.com"
              className="input-text"
            />
            {errors.email && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase">{errors.email.message}</p>}
          </div>
          <div className="auth-input-group">
            <label>Sua Senha</label>
            <input
              {...register('senha')}
              type="password"
              placeholder="••••••••"
              className="input-text"
            />
            {errors.senha && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase">{errors.senha.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="legacy-btn w-full mt-4 disabled:opacity-50"
          >
            {isSubmitting ? 'Validando...' : 'Entrar no Jogo'}
          </button>
        </form>

        <div className="text-center mt-10 relative z-10 pt-8 border-t border-white/5">
          <p className="text-gray-500 text-xs font-medium">
            Ainda não faz parte? 
            <Link to="/register" className="text-gold font-bold hover:underline ml-2 uppercase tracking-widest text-[10px]">
              Criar Conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
