import { createContext } from 'react';

interface User {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  pix?: string | null;
  role: 'USER' | 'ADMIN';
  status: string;
  matricula: string;
  campeao_aposta?: string;
  artilheiro_aposta?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export type { User, AuthContextType };
