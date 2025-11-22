import { apolloClient } from '@/lib/apollo';
import {
  RATE_BUSINESS,
  RATE_CONSUMER,
  DELETE_RATING,
  GET_BUSINESS_RATINGS,
  GET_CONSUMER_RATINGS,
  GET_MY_GIVEN_RATINGS,
  GET_MY_RECEIVED_RATINGS,
} from '@/graphql/queries';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Rating,
  RatingStats,
  RateBusinessInput,
  RateConsumerInput,
} from '@/types/rating';

class RatingService {
  /**
   * Califica un negocio (cliente califica a negocio)
   */
  async rateBusiness(input: RateBusinessInput): Promise<Rating> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No hay sesión activa. Por favor inicia sesión.');
      }

      const { data } = await apolloClient.mutate({
        mutation: RATE_BUSINESS,
        variables: {
          token,
          businessId: input.businessId,
          score: input.score,
          comment: input.comment || null,
        },
      });

      return this.mapRatingFromResponse(data.rateBusiness);
    } catch (error: any) {
      console.error('Error rating business:', error);
      throw new Error(error.message || 'Error al calificar el negocio');
    }
  }

  /**
   * Califica un consumidor (negocio califica a cliente)
   */
  async rateConsumer(input: RateConsumerInput): Promise<Rating> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No hay sesión activa. Por favor inicia sesión.');
      }

      const { data } = await apolloClient.mutate({
        mutation: RATE_CONSUMER,
        variables: {
          token,
          consumerUserId: input.consumerUserId,
          score: input.score,
          comment: input.comment || null,
        },
      });

      return this.mapRatingFromResponse(data.rateConsumer);
    } catch (error: any) {
      console.error('Error rating consumer:', error);
      throw new Error(error.message || 'Error al calificar el consumidor');
    }
  }

  /**
   * Elimina una calificación que el usuario haya dado
   */
  async deleteRating(ratingId: number): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No hay sesión activa. Por favor inicia sesión.');
      }

      const { data } = await apolloClient.mutate({
        mutation: DELETE_RATING,
        variables: {
          token,
          ratingId,
        },
      });

      return data.deleteRating;
    } catch (error: any) {
      console.error('Error deleting rating:', error);
      throw new Error(error.message || 'Error al eliminar la calificación');
    }
  }

  /**
   * Obtiene las calificaciones de un negocio
   */
  async getBusinessRatings(businessId: number): Promise<RatingStats> {
    try {
      const { data } = await apolloClient.query({
        query: GET_BUSINESS_RATINGS,
        variables: { businessId },
        fetchPolicy: 'network-only',
      });

      return this.mapRatingStatsFromResponse(data.getBusinessRatings);
    } catch (error: any) {
      console.error('Error fetching business ratings:', error);
      throw new Error(error.message || 'Error al obtener calificaciones del negocio');
    }
  }

  /**
   * Obtiene las calificaciones de un consumidor
   */
  async getConsumerRatings(consumerUserId: number): Promise<RatingStats> {
    try {
      const { data } = await apolloClient.query({
        query: GET_CONSUMER_RATINGS,
        variables: { consumerUserId },
        fetchPolicy: 'network-only',
      });

      return this.mapRatingStatsFromResponse(data.getConsumerRatings);
    } catch (error: any) {
      console.error('Error fetching consumer ratings:', error);
      throw new Error(error.message || 'Error al obtener calificaciones del consumidor');
    }
  }

  /**
   * Obtiene todas las calificaciones que el usuario autenticado ha dado
   */
  async getMyGivenRatings(): Promise<Rating[]> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No hay sesión activa. Por favor inicia sesión.');
      }

      const { data } = await apolloClient.query({
        query: GET_MY_GIVEN_RATINGS,
        variables: { token },
        fetchPolicy: 'network-only',
      });

      return data.getMyGivenRatings.map(this.mapRatingFromResponse);
    } catch (error: any) {
      console.error('Error fetching my given ratings:', error);
      throw new Error(error.message || 'Error al obtener tus calificaciones');
    }
  }

  /**
   * Obtiene todas las calificaciones que el usuario autenticado ha recibido
   */
  async getMyReceivedRatings(): Promise<RatingStats> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No hay sesión activa. Por favor inicia sesión.');
      }

      const { data } = await apolloClient.query({
        query: GET_MY_RECEIVED_RATINGS,
        variables: { token },
        fetchPolicy: 'network-only',
      });

      return this.mapRatingStatsFromResponse(data.getMyReceivedRatings);
    } catch (error: any) {
      console.error('Error fetching my received ratings:', error);
      throw new Error(error.message || 'Error al obtener las calificaciones recibidas');
    }
  }

  /**
   * Mapea la respuesta de una calificación del backend al formato del frontend
   */
  private mapRatingFromResponse(rating: any): Rating {
    return {
      id: rating.id,
      raterUserId: rating.raterUserId,
      targetType: rating.targetType,
      targetUserId: rating.targetUserId,
      score: rating.score,
      comment: rating.comment,
      createdAt: rating.createdAt,
    };
  }

  /**
   * Mapea la respuesta de estadísticas de calificaciones del backend
   */
  private mapRatingStatsFromResponse(stats: any): RatingStats {
    return {
      averageRating: stats.averageRating,
      totalRatings: stats.totalRatings,
      ratings: stats.ratings.map(this.mapRatingFromResponse),
    };
  }
}

export const ratingService = new RatingService();
