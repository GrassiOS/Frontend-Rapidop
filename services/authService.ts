import { apolloClient } from '@/lib/apollo';
import { CREATE_USER, LOGIN_USER } from '@/graphql/queries';
import { User } from '@/types/auth';

export const register = async (
  email: string,
  password: string,
  name: string,
  phone: string,
  role: string
): Promise<void> => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: CREATE_USER,
      variables: {
        email,
        password,
        name,
        phone,
        role,
      },
    });

    if (!data?.createUser) {
      throw new Error('Error al crear el usuario');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Error en el registro');
  }
};

export const login = async (email: string, password: string) => {
  try {
    const startTime = Date.now();
    
    const { data } = await apolloClient.mutate({
      mutation: LOGIN_USER,
      variables: {
        email,
        password,
      },
    });

    const requestTime = Date.now() - startTime;

    if (!data?.loginUser) {
      throw new Error('Credenciales inválidas');
    }

    return data.loginUser;
  } catch (error: any) {
    throw new Error(error.message || 'Error en el login');
  }
};

export const authService = {
  register,
  login,
};

export type { User };
