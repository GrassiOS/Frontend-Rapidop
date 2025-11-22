import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useReservation } from '@/hooks/useReservation';
import { ReservationCard } from '@/components/reservations/ReservationCard';
import { Reservation, ReservationStatus } from '@/types/reservation';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useCustomerNotification } from '@/contexts/CustomerNotificationContext';

export default function ReservationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const { 
    totalNotificationsCount, 
    confirmedReservationsCount, 
    rejectedReservationsCount,
    markAsRead 
  } = useCustomerNotification();
  const {
    reservations,
    loading,
    refreshing,
    error,
    fetchMyReservations,
    refreshReservations,
    cancelReservation,
    canCancelReservation,
    getTimeLeftToCancel, 
    getStatusColor,
    getStatusText,
  } = useReservation();

  const [selectedFilter, setSelectedFilter] = useState<ReservationStatus | 'ALL'>('ALL');
  const previousReservations = useRef<Reservation[]>([]);

  // Marcar notificaciones como leídas cuando entra a la pantalla
  useFocusEffect(
    React.useCallback(() => {
      markAsRead();
    }, [markAsRead])
  );

  useEffect(() => {
    if (user) {
      const status = selectedFilter === 'ALL' ? undefined : selectedFilter;
      fetchMyReservations(status);
    }
  }, [user, selectedFilter]);

  // Polling para detectar cambios en las reservas
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const status = selectedFilter === 'ALL' ? undefined : selectedFilter;
      fetchMyReservations(status);
    }, 10000); // Verificar cada 10 segundos

    return () => clearInterval(interval);
  }, [user, selectedFilter]);

  // Detectar cambios en el estado de las reservas
  useEffect(() => {
    if (previousReservations.current.length > 0 && reservations.length > 0) {
      reservations.forEach((currentReservation) => {
        const previousReservation = previousReservations.current.find(
          (r) => r.id === currentReservation.id
        );

        if (previousReservation && previousReservation.status !== currentReservation.status) {
          // El estado cambió, mostrar notificación
          if (currentReservation.status === ReservationStatus.CONFIRMED) {
            showNotification({
              title: '¡Reserva Confirmada!',
              message: `Tu reserva #${currentReservation.id} ha sido confirmada por el negocio.`,
              type: 'success',
              duration: 6000,
            });
          } else if (currentReservation.status === ReservationStatus.CANCELLED) {
            showNotification({
              title: 'Reserva Cancelada',
              message: `Tu reserva #${currentReservation.id} ha sido cancelada.`,
              type: 'error',
              duration: 6000,
            });
          } else if (currentReservation.status === ReservationStatus.PICKED_UP) {
            showNotification({
              title: 'Producto Retirado',
              message: `Tu reserva #${currentReservation.id} ha sido marcada como retirada.`,
              type: 'info',
              duration: 6000,
            });
          }
        }
      });
    }

    // Actualizar las reservas anteriores
    previousReservations.current = [...reservations];
  }, [reservations]);

  const handleRefresh = () => {
    const status = selectedFilter === 'ALL' ? undefined : selectedFilter;
    refreshReservations(status);
  };

  const handleFilterChange = (filter: ReservationStatus | 'ALL') => {
    setSelectedFilter(filter);
  };

  const handleViewDetails = (reservation: Reservation) => {
    router.push({
      pathname: '/reservations/details' as any,
      params: { id: reservation.id },
    });
  };

  const handleCancel = async (id: number) => {
    const success = await cancelReservation(id);
    if (success) {
      const status = selectedFilter === 'ALL' ? undefined : selectedFilter;
      fetchMyReservations(status);
    }
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-8">
      {error ? (
        <>
          <Ionicons name="alert-circle-outline" size={64} color="#DC2626" />
          <Text className="text-xl font-semibold text-[#794646] mt-4 mb-2">
            Error al cargar reservas
          </Text>
          <Text className="text-sm text-[#794646] opacity-70 text-center mb-6">
            {error}
          </Text>
          <TouchableOpacity
            className="bg-[#B5A78E] px-6 py-3 rounded-lg"
            onPress={() => {
              const status = selectedFilter === 'ALL' ? undefined : selectedFilter;
              fetchMyReservations(status);
            }}
          >
            <Text className="text-white text-base font-semibold">Reintentar</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Ionicons name="receipt-outline" size={64} color="#D2C0C0" />
          <Text className="text-xl font-semibold text-[#794646] mt-4 mb-2">
            No hay reservas
          </Text>
          <Text className="text-sm text-[#794646] opacity-70 text-center mb-6">
            {selectedFilter === 'ALL'
              ? 'Aún no has realizado ninguna reserva'
              : `No tienes reservas con estado: ${getStatusText(selectedFilter as ReservationStatus)}`}
          </Text>
          <TouchableOpacity
            className="bg-[#B5A78E] px-6 py-3 rounded-lg"
            onPress={() => router.push('/(tabs)')}
          >
            <Text className="text-white text-base font-semibold">Explorar Productos</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderFilterButton = (
    filter: ReservationStatus | 'ALL',
    label: string
  ) => (
    <TouchableOpacity
      key={filter}
      className={`px-4 py-2 rounded-full mr-2 ${
        selectedFilter === filter ? 'bg-[#B5A78E]' : 'bg-[#EBE5EB]'
      }`}
      onPress={() => handleFilterChange(filter)}
    >
      <Text
        className={`text-sm font-medium ${
          selectedFilter === filter ? 'text-white' : 'text-[#794646]'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View className="flex-1 bg-white pt-12">
        <View className="flex-1 justify-center items-center px-8">
          <Ionicons name="person-outline" size={64} color="#D2C0C0" />
          <Text className="text-xl font-semibold text-[#794646] mt-4 mb-2">
            Inicia Sesión
          </Text>
          <Text className="text-sm text-[#794646] opacity-70 text-center mb-6">
            Debes iniciar sesión para ver tus reservas
          </Text>
          <TouchableOpacity
            className="bg-[#B5A78E] px-6 py-3 rounded-lg"
            onPress={() => router.push('/auth/login')}
          >
            <Text className="text-white text-base font-semibold">Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading && !refreshing && reservations.length === 0) {
    return (
      <View className="flex-1 bg-white items-center justify-center pt-12">
        <ActivityIndicator size="large" color="#B5A78E" />
        <Text className="text-[#794646] mt-4">Cargando reservas...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white pt-12">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#794646" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-[#794646] flex-1">
          Mis Reservas
        </Text>
        {totalNotificationsCount > 0 && (
          <View className="bg-red-600 rounded-full min-w-[24px] h-[24px] items-center justify-center px-2 ml-2">
            <Text className="text-white text-xs font-bold">
              {totalNotificationsCount > 9 ? '9+' : totalNotificationsCount}
            </Text>
          </View>
        )}
      </View>

      {/* Filtros */}
      <View className="flex-row px-3 py-3 bg-white border-b border-gray-200">
        {renderFilterButton('ALL', 'Todas')}
        {renderFilterButton(ReservationStatus.PENDING, 'Pendientes')}
        {renderFilterButton(ReservationStatus.CONFIRMED, 'Confirmadas')}
        {renderFilterButton(ReservationStatus.PICKED_UP, 'Retiradas')}
        {renderFilterButton(ReservationStatus.CANCELLED, 'Canceladas')}
      </View>

      {/* Lista de reservas */}
      <FlatList
        data={reservations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ReservationCard
            reservation={item}
            onCancel={handleCancel}
            onViewDetails={handleViewDetails}
            canCancelReservation={canCancelReservation}
            getTimeLeftToCancel={getTimeLeftToCancel}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
          />
        )}
        contentContainerStyle={reservations.length === 0 ? { flexGrow: 1 } : { paddingVertical: 8 }}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#B5A78E']}
            tintColor="#B5A78E"
          />
        }
      />
    </View>
  );
}
