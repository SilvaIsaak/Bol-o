import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { isAxiosError } from 'axios';

interface PaymentData {
  valor: number;
  pixCode: string;
  qrCode: string;
  status: string;
}

const Payment: React.FC = () => {
  const { user } = useAuth();
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchPayment = async () => {
    try {
      const res = await api.get('/user/pagamento');
      setPayment(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchPayment();
    };
    init();
  }, []);

  const copyToClipboard = () => {
    if (payment?.pixCode) {
      navigator.clipboard.writeText(payment.pixCode);
      alert('Código PIX copiado!');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('comprovante', file);

    try {
      await api.post('/user/pagamento', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Comprovante enviado com sucesso! Aguarde a análise do administrador.');
      setFile(null);
      window.location.reload(); // Recarregar para atualizar status
    } catch (error) {
      if (isAxiosError(error)) {
        alert(error.response?.data?.message || 'Erro ao enviar comprovante');
      } else {
        alert('Erro ao enviar comprovante');
      }
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="text-white text-center mt-20">Carregando dados de pagamento...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <header className="mb-16 text-center">
        <h1 className="font-display text-4xl font-bold text-white mb-2 uppercase tracking-tighter">
          Olá, <span className="text-gold">{user?.nome?.split(' ')[0]}</span>
        </h1>
        <p className="text-gray-500 font-medium tracking-[0.3em] uppercase text-[10px]">
          Sua matrícula: <span className="text-white">{user?.matricula}</span>
        </p>
        <div className="mt-6 inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full">
          <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Status da Conta:</span>
          <span className={`text-[10px] font-black uppercase tracking-widest ${
            user?.status === 'AGUARDANDO_APROVACAO' ? 'text-blue-400' : 'text-gold'
          }`}>
            {user?.status?.replace('_', ' ')}
          </span>
        </div>
      </header>

      {user?.status === 'AGUARDANDO_APROVACAO' ? (
        <div className="legacy-card p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <i className="fas fa-clock text-blue-400 text-[150px]" />
          </div>
          <div className="relative z-10">
            <div className="bg-blue-400/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-400/20">
              <i className="fas fa-clock text-blue-400 animate-pulse text-5xl" />
            </div>
            <h2 className="font-display text-3xl font-black text-white mb-4 uppercase tracking-wider">Pagamento em Análise</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-10 leading-relaxed">
              Obrigado pelo envio! Nossa equipe de auditoria está validando seu comprovante. Sua jornada na Copa 2026 começará em breve.
            </p>
            <div className="inline-block bg-blue-400/5 border border-blue-400/20 px-6 py-3 rounded-xl">
              <p className="text-blue-400 text-xs font-black uppercase tracking-widest">Aprovação em até 24 horas</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="legacy-card p-10 flex flex-col items-center">
            <div className="w-full mb-8 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center font-display font-black text-gold border border-gold/20">1</div>
              <h2 className="font-display text-2xl font-bold text-white uppercase tracking-wider">Pagamento PIX</h2>
            </div>
            
            <div className="bg-white p-6 rounded-2xl mb-10 shadow-2xl shadow-white/5 group transition-transform hover:scale-105">
              {payment?.qrCode ? (
                <img src={payment.qrCode} alt="QR Code PIX" className="w-56 h-56" />
              ) : (
                <i className="fas fa-qrcode text-gray-900 text-[224px]" />
              )}
            </div>

            <div className="w-full space-y-6 mb-10">
              <div className="text-center">
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.3em] mb-1">Valor da Inscrição</p>
                <p className="text-5xl font-display font-black text-gold drop-shadow-lg">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payment?.valor || 70)}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mb-2">Código Copia e Cola</p>
                <div className="flex items-center gap-3 bg-black/40 p-4 rounded-xl border border-white/5 group hover:border-gold/30 transition-colors">
                  <span className="text-gray-400 font-mono text-[10px] flex-1 truncate">{payment?.pixCode}</span>
                  <button onClick={copyToClipboard} className="text-gold hover:text-white transition-colors">
                    <i className="far fa-copy text-xl" />
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full space-y-3">
              <div className="flex gap-4 items-start p-3 rounded-lg bg-white/2">
                <i className="fas fa-check-circle text-green-500 shrink-0 mt-0.5" />
                <p className="text-gray-500 text-[10px] uppercase font-bold leading-tight">Pagamento único para acesso vitalício à edição 2026</p>
              </div>
              <div className="flex gap-4 items-start p-3 rounded-lg bg-white/2">
                <i className="fas fa-check-circle text-green-500 shrink-0 mt-0.5" />
                <p className="text-gray-500 text-[10px] uppercase font-bold leading-tight">Validação manual garante segurança total ao prêmio</p>
              </div>
            </div>
          </div>

          <div className="legacy-card p-10 flex flex-col">
            <div className="w-full mb-8 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center font-display font-black text-gold border border-gold/20">2</div>
              <h2 className="font-display text-2xl font-bold text-white uppercase tracking-wider">Comprovante</h2>
            </div>
            
            <div className="flex-1 flex flex-col space-y-8">
              <div 
                className={`flex-1 border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-500 flex flex-col items-center justify-center gap-6 group ${
                  file ? 'border-green-500 bg-green-500/5' : 'border-white/10 hover:border-gold/50 hover:bg-white/2'
                }`}
              >
                <input 
                  type="file" 
                  id="receipt" 
                  className="hidden" 
                  accept="image/*,.pdf" 
                  onChange={handleFileChange} 
                />
                <label htmlFor="receipt" className="cursor-pointer w-full flex flex-col items-center gap-6">
                  {file ? (
                    <>
                      <div className="bg-green-500/10 p-6 rounded-full">
                        <i className="fas fa-file-invoice text-green-500 text-6xl" />
                      </div>
                      <div className="text-center">
                        <span className="text-white text-sm font-bold block mb-1 truncate max-w-[200px]">{file.name}</span>
                        <span className="text-green-500 text-[10px] uppercase font-black tracking-widest">Arquivo Selecionado</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white/5 p-6 rounded-full group-hover:scale-110 transition-transform">
                        <i className="fas fa-upload text-gray-500 group-hover:text-gold transition-colors text-6xl" />
                      </div>
                      <div className="text-center">
                        <span className="text-gray-400 text-sm font-medium block mb-1">Upload do Comprovante</span>
                        <span className="text-gray-600 text-[10px] uppercase font-black tracking-widest">JPG, PNG ou PDF</span>
                      </div>
                    </>
                  )}
                </label>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!file || uploading}
                className="legacy-btn w-full !py-5 disabled:opacity-30"
              >
                {uploading ? (
                  <>
                    <i className="fas fa-spinner animate-spin mr-2" />
                    Processando...
                  </>
                ) : (
                  'Confirmar Inscrição'
                )}
              </button>
            </div>

            <div className="mt-10 pt-8 border-t border-white/5">
              <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-4 text-center">Precisa de suporte imediato?</p>
              <a 
                href={`https://wa.me/5500000000000?text=${encodeURIComponent(`Olá, realizei o pagamento do Bolão Copa 2026.\n\nMatrícula: ${user?.matricula}\nParticipante: ${user?.nome}\nValor: R$ 70,00\n\nSegue o comprovante em anexo.`)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-green-600/10 border border-green-600/20 hover:bg-green-600/20 text-green-500 font-black uppercase text-[10px] tracking-widest py-4 rounded-xl transition-all"
              >
                <i className="fab fa-whatsapp text-xl" /> Falar com Suporte
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
