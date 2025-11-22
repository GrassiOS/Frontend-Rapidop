import { ApolloClient, InMemoryCache, from, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { createUploadLink } from '@/lib/uploadLink';

// Función para obtener la URL de la API
const getApiUrl = (): string => {
  const expoExtra = (Constants.expoConfig as any)?.extra || (Constants.manifest as any)?.extra;
  const override =
    (process.env.API_URL as string | undefined) ||
    (process.env.EXPO_PUBLIC_API_URL as string | undefined) ||
    expoExtra?.API_URL;

  if (override) return override;

  // dev fallbacks
  if (__DEV__) {
    return 'http://10.0.2.2:8000/graphql'; // Para Android emulator
  }

  throw new Error('API_URL no está definida');
};

// Upload Link - soporta multipart/form-data para file uploads
const uploadLink = createUploadLink({
  uri: getApiUrl(),
  // Timeout de 30 segundos para uploads de imágenes
  fetchOptions: {
    timeout: 30000,
  },
});

// Auth Link - para agregar el token de autenticación
const authLink = setContext(async (_, { headers }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
        'Content-Type': 'application/json',
      }
    };
  } catch (error) {
    console.error('Error getting auth token:', error);
    return { headers };
  }
});

// Error Link - para manejar errores de autenticación
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      const message = err.message.toLowerCase();
      
      // Detectar errores de autenticación
      if (
        message.includes('token') || 
        message.includes('unauthorized') || 
        message.includes('not authenticated') ||
        message.includes('authentication')
      ) {        
        // Limpiar la sesión
        AsyncStorage.removeItem('auth_token').catch(console.error);
        AsyncStorage.removeItem('user_data').catch(console.error);
        
        // Nota: La redirección al login se manejará automáticamente
        // por el AuthContext cuando detecte que no hay token
      }
      
      console.error(
        `[GraphQL error]: Message: ${err.message}, Location: ${err.locations}, Path: ${err.path}`,
      );
    }
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Configuración del cache optimizada
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        getAllBusinesses: {
          merge(existing, incoming) {
            return incoming;
          },
        },
        getBusinessesByUser: {
          merge(existing, incoming) {
            return incoming;
          },
        },
        getProductsByBusiness: {
          merge(existing, incoming) {
            return incoming;
          },
        },
      },
    },
    Business: {
      keyFields: ['id'],
    },
    Product: {
      keyFields: ['id'],
    },
  },
  // Configuración explícita para Apollo Client 3.14+
  addTypename: true,
});

// Cliente Apollo optimizado con soporte para file uploads
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, uploadLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  // Configuración para Apollo Client 3.14+ para evitar warnings
  name: 'app-movil-client',
  version: '1.0.0',
});

// Función helper para limpiar el caché de forma selectiva
export const clearCacheForTypes = (types: string[]) => {
  types.forEach(type => {
    apolloClient.cache.evict({ fieldName: type });
  });
  apolloClient.cache.gc();
};

// Función helper para refrescar datos específicos
export const refetchBusinessData = async (userId?: number) => {
  if (userId) {
    await apolloClient.refetchQueries({
      include: ['GetBusinessesByUser', 'GetAllBusinesses'],
    });
  } else {
    await apolloClient.refetchQueries({
      include: ['GetAllBusinesses'],
    });
  }
};

export const refetchProductData = async (businessId?: number) => {
  await apolloClient.refetchQueries({
    include: ['GetProductsByBusiness'],
  });
};

export default apolloClient;