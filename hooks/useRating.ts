import { useState } from 'react';
import { ratingService } from '@/services/ratingService';
import type {
  Rating,
  RatingStats,
  RateBusinessInput,
  RateConsumerInput,
} from '@/types/rating';

export const useRating = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Califica un negocio
   */
  const rateBusiness = async (input: RateBusinessInput): Promise<Rating | null> => {
    setLoading(true);
    setError(null);
    try {
      const rating = await ratingService.rateBusiness(input);
      return rating;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Califica un consumidor
   */
  const rateConsumer = async (input: RateConsumerInput): Promise<Rating | null> => {
    setLoading(true);
    setError(null);
    try {
      const rating = await ratingService.rateConsumer(input);
      return rating;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Elimina una calificación
   */
  const deleteRating = async (ratingId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const result = await ratingService.deleteRating(ratingId);
      return result;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtiene las calificaciones de un negocio
   */
  const getBusinessRatings = async (businessId: number): Promise<RatingStats | null> => {
    setLoading(true);
    setError(null);
    try {
      const stats = await ratingService.getBusinessRatings(businessId);
      return stats;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtiene las calificaciones de un consumidor
   */
  const getConsumerRatings = async (consumerUserId: number): Promise<RatingStats | null> => {
    setLoading(true);
    setError(null);
    try {
      const stats = await ratingService.getConsumerRatings(consumerUserId);
      return stats;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtiene todas las calificaciones dadas por el usuario autenticado
   */
  const getMyGivenRatings = async (): Promise<Rating[] | null> => {
    setLoading(true);
    setError(null);
    try {
      const ratings = await ratingService.getMyGivenRatings();
      return ratings;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtiene todas las calificaciones recibidas por el usuario autenticado
   */
  const getMyReceivedRatings = async (): Promise<RatingStats | null> => {
    setLoading(true);
    setError(null);
    try {
      const stats = await ratingService.getMyReceivedRatings();
      return stats;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    rateBusiness,
    rateConsumer,
    deleteRating,
    getBusinessRatings,
    getConsumerRatings,
    getMyGivenRatings,
    getMyReceivedRatings,
  };
};
