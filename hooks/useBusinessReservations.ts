import { useState, useCallback } from 'react';
import { reservationService } from '@/services/reservationService';
import { Reservation, ReservationStatus } from '@/types/reservation';
import { Alert } from 'react-native';

export const useBusinessReservations = (businessId: number | null) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReservations = useCallback(async (status?: ReservationStatus) => {
    if (!businessId) {
      setError('No business ID provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await reservationService.getBusinessReservations(businessId, status);
      setReservations(data);
    } catch (err: any) {
      console.error('Error loading business reservations:', err);
      setError(err.message || 'Error al cargar las reservas');
      Alert.alert('Error', err.message || 'Error al cargar las reservas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [businessId]);

  const confirmReservation = useCallback(async (reservationId: number) => {
    try {
      await reservationService.confirmReservation(reservationId);
      // Actualizar la reserva localmente
      setReservations(prev => 
        prev.map(r => 
          r.id === reservationId 
            ? { ...r, status: ReservationStatus.CONFIRMED }
            : r
        )
      );
      return true;
    } catch (err: any) {
      console.error('Error confirming reservation:', err);
      throw err;
    }
  }, []);

  const rejectReservation = useCallback(async (reservationId: number) => {
    try {
      await reservationService.cancelReservation(reservationId);
      // Actualizar la reserva localmente
      setReservations(prev => 
        prev.map(r => 
          r.id === reservationId 
            ? { ...r, status: ReservationStatus.CANCELLED }
            : r
        )
      );
      return true;
    } catch (err: any) {
      console.error('Error rejecting reservation:', err);
      throw err;
    }
  }, []);

  const completeReservation = useCallback(async (reservationId: number) => {
    try {
      await reservationService.markAsPickedUp(reservationId);
      // Actualizar la reserva localmente
      setReservations(prev => 
        prev.map(r => 
          r.id === reservationId 
            ? { ...r, status: ReservationStatus.PICKED_UP }
            : r
        )
      );
      return true;
    } catch (err: any) {
      console.error('Error completing reservation:', err);
      throw err;
    }
  }, []);

  const refresh = useCallback(() => {
    setRefreshing(true);
    loadReservations();
  }, [loadReservations]);

  return {
    reservations,
    loading,
    refreshing,
    error,
    loadReservations,
    confirmReservation,
    rejectReservation,
    completeReservation,
    refresh,
  };
};
