import { authService } from '@/services/authService';
import { User } from '@/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apolloClient } from '@/lib/apollo';
import { GET_CURRENT_USER } from '@/graphql/queries';
import { AuthContextType } from '@/types/context';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';

async function setSecureToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

async function getSecureToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

async function removeSecureToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await getSecureToken();
        if (token) {          
          // Primero cargar los datos locales para mostrar la UI rápidamente
          const userDataString = await AsyncStorage.getItem('user_data');
          if (userDataString) {
            const userData = JSON.parse(userDataString);
            setUser(userData);
            setIsAuthenticated(true);
          }
          
          // Luego validar el token en segundo plano
          try {
            const { data, errors } = await apolloClient.query({
              query: GET_CURRENT_USER,
              fetchPolicy: 'network-only',
            });

            if (errors || !data?.me) {
              // Token inválido, limpiar sesión
              await removeSecureToken();
              await AsyncStorage.removeItem('user_data');
              setIsAuthenticated(false);
              setUser(null);
            } else {
              // Actualizar datos del usuario si cambiaron
              setUser(data.me);
              await AsyncStorage.setItem('user_data', JSON.stringify(data.me));
            }
          } catch (error: any) {
            // Error al validar, limpiar sesión
            await removeSecureToken();
            await AsyncStorage.removeItem('user_data');
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const startTime = Date.now();
      
      const result = await authService.login(email, password);
      
      const loginTime = Date.now() - startTime;

      if (!result || !result.accessToken || !result.user) {
        throw new Error('Respuesta de login inválida');
      }

      const { accessToken, user: userData } = result;

      // Guardar datos en paralelo para ahorrar tiempo
      await Promise.all([
        setSecureToken(accessToken),
        AsyncStorage.setItem('user_data', JSON.stringify(userData))
      ]);

      setUser(userData);
      setIsAuthenticated(true);
      
      const totalTime = Date.now() - startTime;
    } catch (error: any) {
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, phone: string, role: string) => {
    try {
      await authService.register(email, password, name, phone, role);
      // Login automático después del registro
      await new Promise(resolve => setTimeout(resolve, 1000));
      await login(email, password);
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await removeSecureToken();
      await AsyncStorage.removeItem('user_data');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
