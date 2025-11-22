import { apolloClient } from '@/lib/apollo';
import { CREATE_BUSINESS, UPDATE_BUSINESS, DELETE_BUSINESS } from '@/graphql/queries';
import { GET_BUSINESSES_BY_USER, GET_ALL_BUSINESSES, GET_BUSINESS_BY_ID } from '@/graphql/queries';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BusinessInput {
  name: string;
  description?: string;
  address: string;
  foodType?: string; // Cambiado de category
  latitude?: number;
  longitude?: number;
}

export interface Business {
  id: number;
  name: string;
  description?: string;
  address: string;
  foodType?: string; // Cambiado de category
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchedLocation {
  latitude: number;
  longitude: number;
  address: string;
}

class BusinessService {
  async createBusiness(input: BusinessInput): Promise<Business> {
    try {
      // Obtener el token y datos del usuario autenticado
      const token = await AsyncStorage.getItem('auth_token');
      const userDataString = await AsyncStorage.getItem('user_data');
      
      if (!token || !userDataString) {
        throw new Error('No hay sesión activa. Por favor inicia sesión.');
      }

      const userData = JSON.parse(userDataString);
      const userId = parseInt(userData.id);

      const { data } = await apolloClient.mutate({
        mutation: CREATE_BUSINESS,
        variables: {
          name: input.name,
          description: input.description || '',
          address: input.address,
          foodType: input.foodType || 'Otro',
          latitude: input.latitude || 0.0,
          longitude: input.longitude || 0.0,
          token: token,
        },
        refetchQueries: [{ query: GET_BUSINESSES_BY_USER, variables: { userId } }],
      });

      return data.createBusiness;
    } catch (error: any) {
      console.error('Error creating business:', error);
      throw new Error(error.message || 'Error al crear el negocio');
    }
  }

  async updateBusiness(id: number, input: BusinessInput): Promise<Business> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userDataString = await AsyncStorage.getItem('user_data');
      
      if (!token || !userDataString) {
        throw new Error('No hay sesión activa. Por favor inicia sesión.');
      }

      const userData = JSON.parse(userDataString);
      const userId = parseInt(userData.id);
      
      const { data, errors } = await apolloClient.mutate({
        mutation: UPDATE_BUSINESS,
        variables: {
          token,
          businessId: id,
          name: input.name,
          description: input.description,
          address: input.address,
          foodType: input.foodType,
          latitude: input.latitude,
          longitude: input.longitude,
        },
        refetchQueries: [
          { query: GET_BUSINESSES_BY_USER, variables: { userId } },
          { query: GET_BUSINESS_BY_ID, variables: { businessId: id } },
        ],
      });

      // Verificar si hay errores de GraphQL
      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }

      // Verificar si data existe
      if (!data || !data.updateBusiness) {
        throw new Error('No se recibió respuesta del servidor');
      }

      return data.updateBusiness;
    } catch (error: any) {
      console.error('Error updating business:', error);
      
      // Si es un error de GraphQL con mensaje específico
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        throw new Error(error.graphQLErrors[0].message);
      }
      
      throw new Error(error.message || 'Error al actualizar el negocio');
    }
  }

  async deleteBusiness(id: number): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userDataString = await AsyncStorage.getItem('user_data');
      
      if (!token || !userDataString) {
        throw new Error('No hay sesión activa. Por favor inicia sesión.');
      }

      const userData = JSON.parse(userDataString);
      const userId = parseInt(userData.id);
      
      const { data, errors } = await apolloClient.mutate({
        mutation: DELETE_BUSINESS,
        variables: { 
          token,
          businessId: id 
        },
        refetchQueries: [{ query: GET_BUSINESSES_BY_USER, variables: { userId } }],
      });

      // Verificar si hay errores de GraphQL
      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }

      // Verificar si data existe
      if (!data || data.deleteBusiness === null || data.deleteBusiness === undefined) {
        throw new Error('No se recibió respuesta del servidor');
      }

      return data.deleteBusiness === true;
    } catch (error: any) {
      console.error('Error deleting business:', error);
      
      // Si es un error de GraphQL con mensaje específico
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        throw new Error(error.graphQLErrors[0].message);
      }
      
      throw new Error(error.message || 'Error al eliminar el negocio');
    }
  }

  async getBusinesses(): Promise<Business[]> {
    try {
      // Obtener los datos del usuario autenticado
      const token = await AsyncStorage.getItem('auth_token');
      const userDataString = await AsyncStorage.getItem('user_data');
      
      if (!token || !userDataString) {
        throw new Error('No hay sesión activa. Por favor inicia sesión.');
      }

      const userData = JSON.parse(userDataString);
      const userId = parseInt(userData.id);

      if (!userId) {
        throw new Error('No se pudo obtener el ID del usuario.');
      }
      const { data, errors } = await apolloClient.query({
        query: GET_BUSINESSES_BY_USER,
        variables: { userId },
        fetchPolicy: 'cache-first', // Usa cache primero para respuesta rápida
      });

      if (errors && errors.length > 0) {
        console.error('GraphQL Errors:', errors);
        throw new Error(errors[0].message);
      }

      if (data && data.getBusinessesByUser) {
        return Array.isArray(data.getBusinessesByUser) ? data.getBusinessesByUser : [];
      }

      return [];
    } catch (error: any) {      
      // Si es un error de GraphQL, mostrar más detalles
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const gqlError = error.graphQLErrors[0];
        console.error('GraphQL Error:', gqlError.message);
        throw new Error(gqlError.message || 'Error al obtener los negocios');
      }
      
      // Si no hay negocios pero tampoco hay error crítico, retornar array vacío
      if (error.message && error.message.includes('null')) {
        return [];
      }
      
      throw new Error(error.message || 'Error al obtener los negocios');
    }
  }

  async getBusinessById(id: number): Promise<Business> {
    try {
      const { data } = await apolloClient.query({
        query: GET_BUSINESS_BY_ID,
        variables: { businessId: id },
        fetchPolicy: 'cache-first', // Usa cache primero para respuesta rápida
      });

      return data.getBusiness;
    } catch (error: any) {
      console.error('Error fetching business:', error);
      throw new Error(error.message || 'Error al obtener el negocio');
    }
  }
}

export const businessService = new BusinessService();