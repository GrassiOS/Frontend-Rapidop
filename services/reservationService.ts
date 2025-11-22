import { apolloClient } from '@/lib/apollo';
import {
  CREATE_RESERVATION,
  GET_MY_RESERVATIONS,
  GET_RESERVATION_BY_ID,
  CANCEL_RESERVATION,
  CONFIRM_RESERVATION,
  MARK_AS_PICKED_UP,
  GET_BUSINESS_RESERVATIONS,
  GET_PRODUCTS_BY_BUSINESS,
  GET_ALL_PRODUCTS,
  GET_ALL_BUSINESSES,
} from '@/graphql/queries';
import {
  Reservation,
  CreateReservationInput,
  ReservationStatus,
} from '@/types/reservation';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ReservationService {
  private async getToken(): Promise<string> {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return token;
  }

  /**
   * Convierte el enum del frontend (MAYÚSCULAS) al formato del backend (minúsculas)
   */
  private toBackendStatus(status: ReservationStatus): string {
    return status.toLowerCase();
  }

  /**
   * RF11: Crear una nueva reserva de producto
   */
  async createReservation(input: CreateReservationInput): Promise<Reservation> {
    try {
      const token = await this.getToken();
      const { data } = await apolloClient.mutate({
        mutation: CREATE_RESERVATION,
        variables: {
          businessId: input.businessId,
          productId: input.productId,
          quantity: input.quantity,
          token,
        },
      });

      if (!data?.createReservation) {
        throw new Error('Failed to create reservation');
      }

      return data.createReservation;
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      throw new Error(error.message || 'Failed to create reservation');
    }
  }

  /**
   * RF13: Obtener mis reservas con filtro opcional de estado
   * NOTA: Como el backend solo tiene getBusinessReservations, obtenemos todas las reservas
   * de todos los negocios y filtramos por el usuario actual
   */
  async getMyReservations(status?: ReservationStatus): Promise<Reservation[]> {
    try {
      const token = await this.getToken();

      // 1. Obtener directamente las reservas del usuario usando el endpoint dedicado
      const { data } = await apolloClient.query({
        query: GET_MY_RESERVATIONS,
        variables: {
          token,
          status: status ? this.toBackendStatus(status) : null,
        },
        fetchPolicy: 'network-only',
      });

      const myReservations = data?.getMyReservations || [];

      if (!myReservations.length) {
        return [];
      }

      // 2. Enriquecer con datos de productos (solo lo necesario para la UI)
      try {
        const { data: productsData } = await apolloClient.query({
          query: GET_ALL_PRODUCTS,
          variables: { limit: 1000, offset: 0 },
          fetchPolicy: 'cache-first',
        });

  const allProducts: any[] = productsData?.getAllProducts || [];
  const productMap = new Map<number, any>(allProducts.map((p: any) => [p.id as number, p]));

        return myReservations.map((reservation: any) => {
          const product: any | undefined = productMap.get(reservation.productId as number);
          return {
            ...reservation,
            product: product
              ? {
                  id: product.id,
                  name: product.name,
                  description: product.description,
                  price: product.price,
                  discountedPrice: product.discountedPrice,
                  imageUrl: product.imageUrl,
                  business: product.business
                    ? {
                        id: product.business.id,
                        name: product.business.name,
                        address: (product.business as any).address || '',
                      }
                    : undefined,
                }
              : undefined,
          };
        });
      } catch (productError) {
        console.warn('⚠️ Falló la carga de productos para enriquecer reservas:', productError);
        return myReservations; // retornar sin enriquecimiento si falla
      }
    } catch (error: any) {
      console.error('❌ Error fetching my reservations:', error);
      throw new Error(error.message || 'Failed to fetch reservations');
    }
  }

  /**
   * Obtener una reserva por ID
   */
  async getReservationById(id: number): Promise<Reservation> {
    try {
      const token = await this.getToken();

      // Usar getMyReservations y filtrar por ID
      const { data } = await apolloClient.query({
        query: GET_MY_RESERVATIONS,
        variables: {
          token,
          status: null, // Sin filtro de estado
        },
        fetchPolicy: 'network-only',
      });

      const myReservations = data?.getMyReservations || [];
      const reservation = myReservations.find((r: any) => r.id === id);

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      // Obtener información del producto y negocio
      try {
        const [productsResponse, businessesResponse] = await Promise.all([
          apolloClient.query({
            query: GET_ALL_PRODUCTS,
            variables: { limit: 1000, offset: 0 },
            fetchPolicy: 'cache-first',
          }),
          apolloClient.query({
            query: GET_ALL_BUSINESSES,
            fetchPolicy: 'cache-first',
          }),
        ]);

        const allProducts = productsResponse?.data?.getAllProducts || [];
        const allBusinesses = businessesResponse?.data?.getAllBusinesses || [];
        
        const product: any = allProducts.find((p: any) => p.id === reservation.productId);
        
        if (product) {
          const business = allBusinesses.find((b: any) => b.id === product.businessId);
          
          return {
            ...reservation,
            product: {
              id: product.id,
              name: product.name,
              description: product.description,
              price: product.price,
              discountedPrice: product.discountedPrice,
              imageUrl: product.imageUrl,
              business: business ? {
                id: business.id,
                name: business.name,
                address: business.address,
                phone: business.phone,
                latitude: business.latitude,
                longitude: business.longitude,
              } : undefined,
            },
          };
        }
      } catch (productError) {
        console.error('Error fetching product for reservation:', productError);
      }

      // Retornar sin información del producto si falla
      return reservation;
    } catch (error: any) {
      console.error('Error fetching reservation:', error);
      throw new Error(error.message || 'Failed to fetch reservation');
    }
  }

  /**
   * RF12: Cancelar una reserva (solo dentro de 20 minutos)
   */
  async cancelReservation(id: number): Promise<Reservation> {
    try {
      const token = await this.getToken();
      const { data } = await apolloClient.mutate({
        mutation: CANCEL_RESERVATION,
        variables: {
          reservationId: id,
          token,
        },
      });

      if (!data?.cancelReservation) {
        throw new Error('Failed to cancel reservation');
      }

      return data.cancelReservation;
    } catch (error: any) {
      console.error('Error canceling reservation:', error);
      throw new Error(error.message || 'Failed to cancel reservation');
    }
  }

  /**
   * RF11: Confirmar una reserva (solo para negocios)
   */
  async confirmReservation(id: number): Promise<Reservation> {
    try {
      const token = await this.getToken();
      const { data } = await apolloClient.mutate({
        mutation: CONFIRM_RESERVATION,
        variables: {
          reservationId: id,
          token,
        },
      });

      if (!data?.updateReservationStatus) {
        throw new Error('Failed to confirm reservation');
      }

      return data.updateReservationStatus;
    } catch (error: any) {
      console.error('Error confirming reservation:', error);
      throw new Error(error.message || 'Failed to confirm reservation');
    }
  }

  /**
   * RF15: Marcar como recogido (solo para negocios)
   */
  async markAsPickedUp(id: number): Promise<Reservation> {
    try {
      const token = await this.getToken();
      const { data } = await apolloClient.mutate({
        mutation: MARK_AS_PICKED_UP,
        variables: {
          reservationId: id,
          token,
        },
      });

      if (!data?.markReservationPickedUp) {
        throw new Error('Failed to mark as picked up');
      }

      return data.markReservationPickedUp;
    } catch (error: any) {
      console.error('Error marking as picked up:', error);
      throw new Error(error.message || 'Failed to mark as picked up');
    }
  }

  /**
   * Obtener reservas de un negocio (para dueños de negocios)
   */
  async getBusinessReservations(
    businessId: number,
    status?: ReservationStatus
  ): Promise<Reservation[]> {
    try {
      const token = await this.getToken();
      
      // Obtener las reservas
      const { data: reservationsData } = await apolloClient.query({
        query: GET_BUSINESS_RESERVATIONS,
        variables: {
          businessId,
          token,
          status: status ? this.toBackendStatus(status) : null,
        },
        fetchPolicy: 'network-only',
      });

      const reservations = reservationsData?.getBusinessReservations || [];
      
      // Si no hay reservas, retornar array vacío
      if (reservations.length === 0) {
        return [];
      }

      // Intentar obtener los productos del negocio
      try {
        const { data: productsData } = await apolloClient.query({
          query: GET_PRODUCTS_BY_BUSINESS,
          variables: {
            businessId,
          },
          fetchPolicy: 'network-only',
        });

        const products = productsData?.getProductsByBusiness || [];

        // Si no hay productos, retornar las reservas sin información del producto
        if (products.length === 0) {
          console.warn('No products found for business:', businessId);
          return reservations;
        }

        // Crear un mapa de productos por ID para acceso rápido
        const productMap = new Map(products.map((p: any) => [p.id, p]));

        // Enriquecer las reservas con información del producto
        const enrichedReservations = reservations.map((reservation: any) => {
          const product: any = productMap.get(reservation.productId);
          return {
            ...reservation,
            product: product ? {
              id: product.id,
              name: product.name,
              description: product.description,
              price: product.price,
              discountedPrice: product.discountedPrice,
              imageUrl: product.imageUrl,
            } : undefined,
          };
        });

        return enrichedReservations;
      } catch (productError) {
        // Si falla la obtención de productos, retornar reservas sin información del producto
        console.error('Error fetching products for reservations:', productError);
        return reservations;
      }
    } catch (error: any) {
      console.error('Error fetching business reservations:', error);
      throw new Error(error.message || 'Failed to fetch business reservations');
    }
  }

  /**
   * RF12: Verificar si una reserva puede ser cancelada (dentro de 20 minutos)
   */
  canCancelReservation(reservation: Reservation): boolean {
    const createdAt = new Date(reservation.createdAt);
    const now = new Date();
    const minutesPassed = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    
    return (
      reservation.status === ReservationStatus.PENDING &&
      minutesPassed <= 20
    );
  }

  /**
   * Calcular tiempo restante para cancelar (en minutos)
   */
  getTimeLeftToCancel(reservation: Reservation): number {
    const createdAt = new Date(reservation.createdAt);
    const now = new Date();
    const minutesPassed = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    const timeLeft = 20 - minutesPassed;
    
    return Math.max(0, Math.floor(timeLeft));
  }

  /**
   * Verificar si una reserva está expirada
   */
  isReservationExpired(reservation: Reservation): boolean {
    if (!reservation.expiresAt) return false;
    
    const expiresAt = new Date(reservation.expiresAt);
    const now = new Date();
    
    return now > expiresAt;
  }

  /**
   * Normaliza valores de estado entrantes (e.g. "Pending", "picked up") a claves conocidas
   */
  private normalizeStatus(status: ReservationStatus | string): string {
    const raw = String(status).toUpperCase().replace(/[-\s]+/g, '_');
    // Ajustes de variantes más comunes
    if (raw === 'CANCELED') return 'CANCELLED';
    if (raw === 'PICKEDUP') return 'PICKED_UP';
    return raw;
  }

  /**
   * Obtener el color del estado de la reserva
   */
  getStatusColor = (status: ReservationStatus | string): string => {
    const key = this.normalizeStatus(status);
    const colors: Record<string, string> = {
      PENDING: '#B5A78E', // Café/Beige - Color primario
      CONFIRMED: '#794646', // Marrón oscuro - Color secundario
      PICKED_UP: '#EBE5EB', // Gris lavanda - Completado
      CANCELLED: '#D2C0C0', // Rosa grisáceo - Cancelado
      EXPIRED: '#E5E5E5', // Gris claro - Expirado
    };
    return colors[key] || '#E5E5E5';
  }

  /**
   * Obtener el texto en español del estado
   */
  getStatusText = (status: ReservationStatus | string): string => {
    const key = this.normalizeStatus(status);
    const texts: Record<string, string> = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmada',
      PICKED_UP: 'Retirada',
      CANCELLED: 'Cancelada',
      EXPIRED: 'Expirada',
    };
    return texts[key] || String(status);
  }
}

export const reservationService = new ReservationService();
