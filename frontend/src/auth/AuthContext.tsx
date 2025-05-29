import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import api from '../api';
import { User } from '../types/candidate';

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login(email: string, password: string): Promise<void>;
  logout(): void;
}

interface LoginResponse {
  token: string;
  user: User;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const { data } = await api.get<User>('/me');
          setUser(data);
        } catch (error: any) {
          console.error('Erro ao validar token:', error);

          if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('Token inválido, removendo...');
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
          } else {
            console.log('Erro de rede/servidor, mantendo token');
          }
        }
      }
      setIsLoading(false);
    };

    loadUserFromStorage();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.post<LoginResponse>('/auth/login', { email, password });

      localStorage.setItem('token', data.token);

      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      setUser(data.user);

      console.log('Login realizado com sucesso:', data.user);

    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');

    delete api.defaults.headers.common['Authorization'];

    setUser(null);

    api.post('/auth/logout').catch(() => {
      console.error('Erro ao chamar endpoint de logout');
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};