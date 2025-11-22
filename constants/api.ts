import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getApiUrl = (): string => {
  // prioridad: proceso -> expo extra -> dev heurística
  const expoExtra = (Constants.expoConfig as any)?.extra || (Constants.manifest as any)?.extra;
  const override =
    (process.env.API_URL as string | undefined) ||
    (process.env.EXPO_PUBLIC_API_URL as string | undefined) ||
    expoExtra?.API_URL;

  if (override) return override;

  // dev fallbacks (emulador / dispositivo)
  if (__DEV__) {
    if (Platform.OS === 'android') return 'http://10.0.2.2:8000/graphql';
    const host = (Constants.manifest?.debuggerHost || '').split(':').shift();
    if (host) return `http://${host}:8000/graphql`;
    // Si no se puede determinar el host, usar localhost como último recurso
    return 'http://localhost:8000/graphql';
  }

  // En producción exigir la variable para evitar usar un literal incorrecto
  throw new Error(
    'API_URL no está definida. Define API_URL (process.env.API_URL o EXPO_PUBLIC_API_URL) o expo.extra.API_URL en app.json'
  );
};

export const API_URL = getApiUrl();

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{ message: string; path?: any[]; locations?: any[] }>;
}

export const graphqlRequest = async <T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<T> => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    //console.log('Making GraphQL request to:', API_URL);
    //console.log('Query:', query);
    //console.log('Variables:', variables);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const result: GraphQLResponse<T> = await response.json();
    console.log('GraphQL Response:', result);

    if (result.errors && result.errors.length) {
      const errorMessage = result.errors[0].message;
      console.error('GraphQL Error:', errorMessage);
      throw new Error(errorMessage);
    }

    if (!result.data) {
      throw new Error('No data received from server');
    }

    return result.data;
  } catch (error) {
    console.error('GraphQL request error:', error);
    throw error;
  }
};
