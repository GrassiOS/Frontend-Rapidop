import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { reservationService } from '@/services/reservationService';
import { Reservation, ReservationStatus } from '@/types/reservation';
import { useNotification } from './NotificationContext';

interface CustomerNotificationContextType {
  confirmedReservationsCount: number;
  rejectedReservationsCount: number;
  totalNotificationsCount: number;
  refreshNotifications: () => Promise<void>;
  loading: boolean;
  hasNewConfirmed: boolean;
  hasNewRejected: boolean;
  markAsRead: () => void;
}

const CustomerNotificationContext = createContext<CustomerNotificationContextType | undefined>(undefined);

export function CustomerNotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [confirmedReservationsCount, setConfirmedReservationsCount] = useState(0);
  const [rejectedReservationsCount, setRejectedReservationsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasNewConfirmed, setHasNewConfirmed] = useState(false);
  const [hasNewRejected, setHasNewRejected] = useState(false);
  const previousReservations = useRef<Map<number, ReservationStatus>>(new Map());

  const totalNotificationsCount = confirmedReservationsCount + rejectedReservationsCount;

  const markAsRead = useCallback(() => {
    setHasNewConfirmed(false);
    setHasNewRejected(false);
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!user || user.role !== 'CONSUMER') {
      setConfirmedReservationsCount(0);
      setRejectedReservationsCount(0);
      setHasNewConfirmed(false);
      setHasNewRejected(false);
      return;
    }

    setLoading(true);
    try {
      // Obtener todas las reservas del usuario
      const allReservations = await reservationService.getMyReservations();

      // Filtrar las confirmadas y canceladas recientes (últimas 24 horas)
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      let confirmedCount = 0;
      let rejectedCount = 0;
      let newConfirmed = false;
      let newRejected = false;

      allReservations.forEach((reservation: Reservation) => {
        const updatedAt = new Date(reservation.updatedAt);
        const isRecent = updatedAt >= oneDayAgo;

        // Detectar cambios de estado
        const previousStatus = previousReservations.current.get(reservation.id);
        
        if (reservation.status === ReservationStatus.CONFIRMED && isRecent) {
          confirmedCount++;
          
          // Si cambió de PENDING a CONFIRMED, mostrar notificación
          if (previousStatus === ReservationStatus.PENDING) {
            newConfirmed = true;
            showNotification({
              title: '¡Reserva Confirmada!',
              message: `Tu reserva #${reservation.id} ha sido confirmada por el negocio.`,
              type: 'success',
              duration: 6000,
            });
          }
        }

        if (reservation.status === ReservationStatus.CANCELLED && isRecent) {
          rejectedCount++;
          
          // Si cambió de PENDING a CANCELLED, mostrar notificación
          if (previousStatus === ReservationStatus.PENDING) {
            newRejected = true;
            showNotification({
              title: 'Reserva Rechazada',
              message: `Tu reserva #${reservation.id} ha sido rechazada por el negocio.`,
              type: 'error',
              duration: 6000,
            });
          }
        }

        // Actualizar el estado anterior
        previousReservations.current.set(reservation.id, reservation.status);
      });

      setConfirmedReservationsCount(confirmedCount);
      setRejectedReservationsCount(rejectedCount);
      
      if (newConfirmed) setHasNewConfirmed(true);
      if (newRejected) setHasNewRejected(true);

    } catch (error) {
      console.error('Error refreshing customer notifications:', error);
      setConfirmedReservationsCount(0);
      setRejectedReservationsCount(0);
    } finally {
      setLoading(false);
    }
  }, [user, showNotification]);

  // Refrescar al montar y cuando el usuario cambie
  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  // Polling cada 15 segundos para clientes
  useEffect(() => {
    if (!user || user.role !== 'CONSUMER') return;

    const interval = setInterval(() => {
      refreshNotifications();
    }, 15000); // 15 segundos

    return () => clearInterval(interval);
  }, [user, refreshNotifications]);

  return (
    <CustomerNotificationContext.Provider
      value={{
        confirmedReservationsCount,
        rejectedReservationsCount,
        totalNotificationsCount,
        refreshNotifications,
        loading,
        hasNewConfirmed,
        hasNewRejected,
        markAsRead,
      }}
    >
      {children}
    </CustomerNotificationContext.Provider>
  );
}

export function useCustomerNotification() {
  const context = useContext(CustomerNotificationContext);
  if (context === undefined) {
    throw new Error('useCustomerNotification must be used within a CustomerNotificationProvider');
  }
  return context;
}
