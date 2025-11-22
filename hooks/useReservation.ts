import { useState, useEffect, useCallback } from 'react';
import { reservationService } from '@/services/reservationService';
import {
  Reservation,
  CreateReservationInput,
  ReservationStatus,
} from '@/types/reservation';
import { Alert } from 'react-native';

export function useReservation() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Crear una nueva reserva
   */
  const createReservation = useCallback(
    async (input: CreateReservationInput): Promise<Reservation | null> => {
      try {
        setLoading(true);
        setError(null);

        const reservation = await reservationService.createReservation(input);

        Alert.alert(
          '¡Reserva Creada!',
          'Tu reserva ha sido creada exitosamente. El negocio debe confirmarla.',
          [{ text: 'OK' }]
        );

        return reservation;
      } catch (err: any) {
        const errorMessage = err.message || 'Error al crear la reserva';
        setError(errorMessage);
        Alert.alert('Error', errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * RF13: Obtener mis reservas
   */
  const fetchMyReservations = useCallback(
    async (status?: ReservationStatus) => {
      try {
        setLoading(true);
        setError(null);

        const data = await reservationService.getMyReservations(status);
        setReservations(data);
      } catch (err: any) {
        const errorMessage = err.message || 'Error al cargar las reservas';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Refrescar reservas (pull-to-refresh)
   */
  const refreshReservations = useCallback(
    async (status?: ReservationStatus) => {
      try {
        setRefreshing(true);
        const data = await reservationService.getMyReservations(status);
        setReservations(data);
      } catch (err: any) {
        console.error('Error refreshing reservations:', err);
      } finally {
        setRefreshing(false);
      }
    },
    []
  );

  /**
   * Obtener una reserva por ID
   */
  const getReservationById = useCallback(
    async (id: number): Promise<Reservation | null> => {
      try {
        setLoading(true);
        setError(null);

        const reservation = await reservationService.getReservationById(id);
        return reservation;
      } catch (err: any) {
        const errorMessage = err.message || 'Error al cargar la reserva';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * RF12: Cancelar una reserva (solo dentro de 20 minutos)
   */
  const cancelReservation = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        // Buscar la reserva para verificar tiempo
        const reservation = reservations.find((r) => r.id === id);
        
        if (!reservation) {
          Alert.alert('Error', 'Reserva no encontrada');
          return false;
        }

        // Verificar si puede ser cancelada
        if (!reservationService.canCancelReservation(reservation)) {
          const timeLeft = reservationService.getTimeLeftToCancel(reservation);
          
          if (timeLeft <= 0) {
            Alert.alert(
              'No se puede cancelar',
              'El tiempo límite de 20 minutos para cancelar ha expirado.'
            );
          } else if (reservation.status !== ReservationStatus.PENDING) {
            Alert.alert(
              'No se puede cancelar',
              'Solo se pueden cancelar reservas pendientes.'
            );
          }
          
          return false;
        }

        // Mostrar confirmación
        return new Promise((resolve) => {
          Alert.alert(
            'Cancelar Reserva',
            '¿Estás seguro de que deseas cancelar esta reserva?',
            [
              {
                text: 'No',
                style: 'cancel',
                onPress: () => resolve(false),
              },
              {
                text: 'Sí, Cancelar',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await reservationService.cancelReservation(id);
                    
                    // Actualizar la lista local
                    setReservations((prev) =>
                      prev.map((r) =>
                        r.id === id
                          ? {
                              ...r,
                              status: ReservationStatus.CANCELLED,
                              cancelledAt: new Date().toISOString(),
                            }
                          : r
                      )
                    );

                    Alert.alert(
                      'Reserva Cancelada',
                      'Tu reserva ha sido cancelada exitosamente.'
                    );
                    
                    resolve(true);
                  } catch (err: any) {
                    Alert.alert('Error', err.message || 'Error al cancelar la reserva');
                    resolve(false);
                  }
                },
              },
            ]
          );
        });
      } catch (err: any) {
        const errorMessage = err.message || 'Error al cancelar la reserva';
        setError(errorMessage);
        Alert.alert('Error', errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [reservations]
  );

  /**
   * RF11: Confirmar una reserva (para negocios)
   */
  const confirmReservation = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        await reservationService.confirmReservation(id);

        // Actualizar la lista local
        setReservations((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, status: ReservationStatus.CONFIRMED }
              : r
          )
        );

        Alert.alert(
          'Reserva Confirmada',
          'La reserva ha sido confirmada exitosamente.'
        );

        return true;
      } catch (err: any) {
        const errorMessage = err.message || 'Error al confirmar la reserva';
        setError(errorMessage);
        Alert.alert('Error', errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * RF15: Marcar como recogido (para negocios)
   */
  const markAsPickedUp = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        await reservationService.markAsPickedUp(id);

        // Actualizar la lista local
        setReservations((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: ReservationStatus.PICKED_UP,
                  pickedUpAt: new Date().toISOString(),
                }
              : r
          )
        );

        Alert.alert(
          'Producto Retirado',
          'El producto ha sido marcado como retirado.'
        );

        return true;
      } catch (err: any) {
        const errorMessage = err.message || 'Error al marcar como retirado';
        setError(errorMessage);
        Alert.alert('Error', errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Obtener reservas de un negocio
   */
  const fetchBusinessReservations = useCallback(
    async (businessId: number, status?: ReservationStatus) => {
      try {
        setLoading(true);
        setError(null);

        const data = await reservationService.getBusinessReservations(
          businessId,
          status
        );
        setReservations(data);
      } catch (err: any) {
        const errorMessage = err.message || 'Error al cargar las reservas del negocio';
        setError(errorMessage);
        console.error('Error fetching business reservations:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    reservations,
    loading,
    error,
    refreshing,
    createReservation,
    fetchMyReservations,
    refreshReservations,
    getReservationById,
    cancelReservation,
    confirmReservation,
    markAsPickedUp,
    fetchBusinessReservations,
    // Utilidades del servicio
    canCancelReservation: reservationService.canCancelReservation,
    getTimeLeftToCancel: reservationService.getTimeLeftToCancel,
    isReservationExpired: reservationService.isReservationExpired,
    getStatusColor: reservationService.getStatusColor,
    getStatusText: reservationService.getStatusText,
  };
}
