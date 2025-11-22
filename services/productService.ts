import AsyncStorage from '@react-native-async-storage/async-storage';
import { apolloClient } from '@/lib/apollo';
import {
  CREATE_PRODUCT,
  GET_PRODUCTS_BY_BUSINESS,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
} from '@/graphql/queries';

export interface ProductInput {
  businessId: number;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  stock: number;
  categoryId: number;
  imageFile?: any; // File object from ImagePicker
  status: string;
  expiresAt?: string;
}

export interface Product {
  id: number;
  businessId: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  stock: number;
  imageUrl?: string;
  status: string;
  expiresAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

class ProductService {
  async createProduct(input: ProductInput): Promise<Product> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No hay sesión activa. Por favor inicia sesión.');
      }

      // El archivo ya viene en formato correcto de expo-image-picker
      // uploadLink.ts lo detectará automáticamente con nuestra función isExtractableFile
      const { data } = await apolloClient.mutate({
        mutation: CREATE_PRODUCT,
        variables: {
          businessId: input.businessId,
          name: input.name,
          description: input.description,
          price: input.price,
          discountedPrice: input.discountedPrice || input.price,
          stock: input.stock,
          categoryId: input.categoryId,
          imageFile: input.imageFile || null,
          status: input.status,
          expiresAt: input.expiresAt || '',
          token: token,
        },
        refetchQueries: [
          {
            query: GET_PRODUCTS_BY_BUSINESS,
            variables: { businessId: input.businessId },
          },
        ],
      });
      return data.createProduct;
    } catch (error: any) {
      console.error('❌ Error creating product:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ GraphQL errors:', error.graphQLErrors);
      throw new Error(error.message || 'Error al crear el producto');
    }
  }

  async getProductsByBusiness(businessId: number): Promise<Product[]> {
    try {
      
      const { data, errors } = await apolloClient.query({
        query: GET_PRODUCTS_BY_BUSINESS,
        variables: { businessId },
        fetchPolicy: 'network-only', // Cambiado a network-only para asegurar datos frescos
      });

      if (errors && errors.length > 0) {
        console.error('GraphQL Errors:', errors);
        throw new Error(errors[0].message);
      }

      if (data && data.getProductsByBusiness) {
        return Array.isArray(data.getProductsByBusiness)
          ? data.getProductsByBusiness
          : [];
      }

      return [];
    } catch (error: any) {
      console.error('❌ Error fetching products:', error.message);
      throw new Error(error.message || 'Error al obtener los productos');
    }
  }

  async updateProduct(
    id: number,
    input: Partial<ProductInput>
  ): Promise<Product> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No hay sesión activa. Por favor inicia sesión.');
      }

      // Prepare variables for the mutation
      const variables: any = {
        productId: id,
        token,
        name: input.name,
        description: input.description,
        price: input.price,
        discountedPrice: input.discountedPrice,
        stock: input.stock,
        categoryId: input.categoryId,
        status: input.status,
        expiresAt: input.expiresAt || '',
      };

      // Add imageFile if present
      if (input.imageFile) {
        variables.imageFile = input.imageFile;
      }

      const { data } = await apolloClient.mutate({
        mutation: UPDATE_PRODUCT,
        variables,
        refetchQueries: input.businessId
          ? [
              {
                query: GET_PRODUCTS_BY_BUSINESS,
                variables: { businessId: input.businessId },
              },
            ]
          : [],
      });

      return data.updateProduct;
    } catch (error: any) {
      console.error('❌ Error updating product:', error);
      throw new Error(error.message || 'Error al actualizar el producto');
    }
  }

  async deleteProduct(id: number, businessId: number): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No hay sesión activa. Por favor inicia sesión.');
      }


      const { data, errors } = await apolloClient.mutate({
        mutation: DELETE_PRODUCT,
        variables: { productId: id, token },
        refetchQueries: [
          {
            query: GET_PRODUCTS_BY_BUSINESS,
            variables: { businessId },
          },
        ],
      });

      // Verificar si hay errores de GraphQL
      if (errors && errors.length > 0) {
        const errorMessage = errors[0].message;
        console.error('❌ GraphQL error deleting product:', errorMessage);
        
        // Detectar error de integridad referencial
        if (errorMessage.includes('NotNullViolation') || 
            errorMessage.includes('history') ||
            errorMessage.includes('violates not-null constraint')) {
          throw new Error('No se puede eliminar este producto porque tiene reservaciones o historial asociado. Considera inactivarlo en lugar de eliminarlo.');
        }
        
        throw new Error(errorMessage);
      }

      if (!data || !data.deleteProduct) {
        throw new Error('No se recibió respuesta del servidor');
      }

      return true;
    } catch (error: any) {
      console.error('❌ Error deleting product:', error);
      
      // Mejorar mensajes de error
      if (error.message.includes('NotNullViolation') || 
          error.message.includes('history') ||
          error.message.includes('violates not-null constraint')) {
        throw new Error('No se puede eliminar este producto porque tiene reservaciones o historial asociado. Considera inactivarlo en lugar de eliminarlo.');
      }
      
      if (error.message.includes('Token') || error.message.includes('token')) {
        throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      }
      
      throw new Error(error.message || 'Error al eliminar el producto');
    }
  }
}

export default new ProductService();
