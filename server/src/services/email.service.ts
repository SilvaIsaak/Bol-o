import nodemailer from 'nodemailer';
import { env } from '../utils/env.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const sendWelcomeEmail = async (email: string, nome: string, matricula: string) => {
  if (!env.SMTP_USER) return;

  await transporter.sendMail({
    from: `"Bolão Copa 2026" <${env.SMTP_USER}>`,
    to: email,
    subject: 'Bem-vindo ao Bolão da Copa 2026!',
    html: `
      <h1>Olá, ${nome}!</h1>
      <p>Seu cadastro foi realizado com sucesso.</p>
      <p>Sua matrícula é: <strong>${matricula}</strong></p>
      <p>Para começar a pontuar, realize o pagamento da inscrição e envie o comprovante pelo sistema.</p>
      <br/>
      <p>Boa sorte!</p>
    `,
  });
};

export const sendStatusUpdateEmail = async (email: string, nome: string, status: string) => {
  if (!env.SMTP_USER) return;

  const statusMessages: Record<string, string> = {
    ATIVO: 'Sua conta foi ativada! Agora você já pode dar seus palpites e concorrer aos prêmios.',
    BLOQUEADO: 'Sua conta foi bloqueada. Entre em contato com o suporte para mais informações.',
    REJEITADO: 'Seu comprovante de pagamento foi rejeitado. Por favor, envie um novo comprovante válido.',
  };

  await transporter.sendMail({
    from: `"Bolão Copa 2026" <${env.SMTP_USER}>`,
    to: email,
    subject: 'Atualização no seu Bolão Copa 2026',
    html: `
      <h1>Olá, ${nome}!</h1>
      <p>${statusMessages[status] || `O status da sua conta foi alterado para: ${status}`}</p>
      <br/>
      <p>Atenciosamente,<br/>Equipe Bolão Copa 2026</p>
    `,
  });
};
