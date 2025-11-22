import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { reservationService } from '@/services/reservationService';
import { businessService } from '@/services/businessService';
import { ReservationStatus } from '@/types/reservation';

interface BusinessNotificationContextType {
  pendingReservationsCount: number;
  pendingReservationsByBusiness: Map<number, number>;
  refreshPendingCount: () => Promise<void>;
  loading: boolean;
}

const BusinessNotificationContext = createContext<BusinessNotificationContextType | undefined>(undefined);

export function BusinessNotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [pendingReservationsCount, setPendingReservationsCount] = useState(0);
  const [pendingReservationsByBusiness, setPendingReservationsByBusiness] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(false);

  const refreshPendingCount = useCallback(async () => {
    if (!user || user.role !== 'BUSINESS') {
      setPendingReservationsCount(0);
      setPendingReservationsByBusiness(new Map());
      return;
    }

    setLoading(true);
    try {
      // Obtener todos los negocios del usuario
      const businesses = await businessService.getBusinesses();
      
      if (businesses.length === 0) {
        setPendingReservationsCount(0);
        setPendingReservationsByBusiness(new Map());
        return;
      }

      // Contar reservas pendientes por cada negocio
      const countsByBusiness = new Map<number, number>();
      let totalPending = 0;

      for (const business of businesses) {
        try {
          const reservations = await reservationService.getBusinessReservations(
            business.id,
            ReservationStatus.PENDING
          );
          const count = reservations.length;
          countsByBusiness.set(business.id, count);
          totalPending += count;
        } catch (error) {
          console.error(`Error loading reservations for business ${business.id}:`, error);
          countsByBusiness.set(business.id, 0);
        }
      }

      setPendingReservationsCount(totalPending);
      setPendingReservationsByBusiness(countsByBusiness);
    } catch (error) {
      console.error('Error refreshing pending count:', error);
      setPendingReservationsCount(0);
      setPendingReservationsByBusiness(new Map());
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Refrescar al montar y cuando el usuario cambie
  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  // Polling cada 30 segundos para actualizar el contador
  useEffect(() => {
    if (!user || user.role !== 'BUSINESS') return;

    const interval = setInterval(() => {
      refreshPendingCount();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [user, refreshPendingCount]);

  return (
    <BusinessNotificationContext.Provider
      value={{
        pendingReservationsCount,
        pendingReservationsByBusiness,
        refreshPendingCount,
        loading,
      }}
    >
      {children}
    </BusinessNotificationContext.Provider>
  );
}

export function useBusinessNotification() {
  const context = useContext(BusinessNotificationContext);
  if (context === undefined) {
    throw new Error('useBusinessNotification must be used within a BusinessNotificationProvider');
  }
  return context;
}
