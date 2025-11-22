import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessNotification } from '@/contexts/BusinessNotificationContext';
import { Reservation, ReservationStatus } from '@/types/reservation';
import { Business, businessService } from '@/services/businessService';
import { reservationService } from '@/services/reservationService';
import { useBusinessReservations } from '@/hooks/useBusinessReservations';
import { authService } from '@/services/authService';

type FilterStatus = ReservationStatus | 'ALL';

export default function BusinessReservationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { pendingReservationsCount, pendingReservationsByBusiness, refreshPendingCount } = useBusinessNotification();
  
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('ALL');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [showBusinessPicker, setShowBusinessPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const {
    reservations,
    loading,
    refreshing,
    loadReservations,
    confirmReservation,
    rejectReservation,
    completeReservation,
    refresh,
  } = useBusinessReservations(businessId);

  useEffect(() => {
    if (user && user.role === 'BUSINESS') {
      loadBusinesses();
    }
  }, [user]);

  useEffect(() => {
    if (businessId) {
      const status = selectedFilter === 'ALL' ? undefined : selectedFilter;
      loadReservations(status);
    }
  }, [businessId, selectedFilter, loadReservations]);

  const loadBusinesses = async () => {
    try {
      const businessesData = await businessService.getBusinesses();
      if (businessesData && businessesData.length > 0) {
        setBusinesses(businessesData);
        // Seleccionar el primer negocio por defecto
        setSelectedBusinessId(businessesData[0].id);
        setBusinessId(businessesData[0].id);
      } else {
        Alert.alert(
          'Sin Negocio',
          'No tienes un negocio registrado. Crea uno primero.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error: any) {
      console.error('Error loading businesses:', error);
      Alert.alert('Error', 'No se pudo cargar la información de los negocios');
    }
  };

  const onRefresh = () => {
    const status = selectedFilter === 'ALL' ? undefined : selectedFilter;
    loadReservations(status);
  };

  const handleFilterChange = (filter: FilterStatus) => {
    setSelectedFilter(filter);
    setShowStatusPicker(false);
  };

  const handleBusinessChange = (newBusinessId: number) => {
    setSelectedBusinessId(newBusinessId);
    setBusinessId(newBusinessId);
    setShowBusinessPicker(false);
  };

  const handleConfirmReservation = async (reservationId: number) => {
    Alert.alert(
      'Confirmar Reserva',
      '¿Estás seguro de que quieres confirmar esta reserva?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await confirmReservation(reservationId);
              refreshPendingCount(); // Actualizar contador
              Alert.alert('Éxito', 'La reserva ha sido confirmada. El cliente ha sido notificado.');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo confirmar la reserva');
            }
          },
        },
      ]
    );
  };

  const handleRejectReservation = async (reservationId: number) => {
    Alert.alert(
      'Rechazar Reserva',
      '¿Estás seguro de que quieres rechazar esta reserva? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectReservation(reservationId);
              refreshPendingCount(); // Actualizar contador
              Alert.alert('Éxito', 'La reserva ha sido rechazada. El cliente ha sido notificado.');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo rechazar la reserva');
            }
          },
        },
      ]
    );
  };

  const handleCompleteReservation = async (reservationId: number) => {
    Alert.alert(
      'Completar Reserva',
      '¿El cliente ya recogió el producto?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sí, marcar como completada',
          onPress: async () => {
            try {
              await completeReservation(reservationId);
              Alert.alert('Éxito', 'La reserva ha sido marcada como completada');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo completar la reserva');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: ReservationStatus) => reservationService.getStatusColor(status);

  const getStatusText = (status: ReservationStatus | 'ALL') =>
    status === 'ALL' ? 'Todas' : reservationService.getStatusText(status);

  const getStatusIcon = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.PENDING:
        return 'time-outline';
      case ReservationStatus.CONFIRMED:
        return 'checkmark-circle';
      case ReservationStatus.CANCELLED:
        return 'close-circle';
      case ReservationStatus.PICKED_UP:
        return 'checkmark-done-circle';
      case ReservationStatus.EXPIRED:
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSelectedBusinessName = () => {
    const business = businesses.find(b => b.id === selectedBusinessId);
    return business ? business.name : 'Seleccionar negocio';
  };

  const statusOptions: { value: FilterStatus; label: string }[] = [
    { value: 'ALL', label: 'Todas' },
    { value: ReservationStatus.PENDING, label: 'Pendientes' },
    { value: ReservationStatus.CONFIRMED, label: 'Confirmadas' },
    { value: ReservationStatus.PICKED_UP, label: 'Retiradas' },
    { value: ReservationStatus.CANCELLED, label: 'Canceladas' },
  ];

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#B5A78E" />
          <Text className="text-[#794646] mt-4">Cargando reservas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#794646" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-[#794646] flex-1">
          Reservas del Negocio
        </Text>
        <View className="relative">
          <View className="bg-[#B5A78E] rounded-full px-3 py-1">
            <Text className="text-white font-bold">{reservations.length}</Text>
          </View>
          
        </View>
      </View>

      {/* Filters Row */}
      <View className="flex-row px-5 py-3 gap-3 border-b border-gray-100">
        {/* Business Dropdown */}
        {businesses.length > 0 && (
          <TouchableOpacity
            onPress={() => setShowBusinessPicker(true)}
            className="flex-1 flex-row items-center justify-between bg-white border-2 border-[#D2C0C0] rounded-lg px-4 py-3"
          >
            <View className="flex-row items-center flex-1">
              <MaterialCommunityIcons name="store" size={20} color="#794646" />
              <Text className="text-[#794646] ml-2 flex-1" numberOfLines={1}>
                {getSelectedBusinessName()}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#794646" />
          </TouchableOpacity>
        )}

        {/* Status Dropdown */}
        <TouchableOpacity
          onPress={() => setShowStatusPicker(true)}
          className="flex-1 flex-row items-center justify-between bg-white border-2 border-[#D2C0C0] rounded-lg px-4 py-3"
        >
          <View className="flex-row items-center flex-1">
            <Ionicons name="filter" size={20} color="#794646" />
            <Text className="text-[#794646] ml-2 flex-1" numberOfLines={1}>
              {getStatusText(selectedFilter)}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={20} color="#794646" />
        </TouchableOpacity>
      </View>

      {/* Reservations List */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#B5A78E']}
            tintColor="#B5A78E"
          />
        }
      >
        {reservations.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <MaterialCommunityIcons name="calendar-blank" size={80} color="#D2C0C0" />
            <Text className="text-[#794646] text-lg mt-4 text-center px-8">
              {selectedFilter === 'ALL'
                ? 'No hay reservas aún'
                : `No hay reservas ${getStatusText(selectedFilter).toLowerCase()}`}
            </Text>
            <Text className="text-gray-500 text-sm mt-2 text-center px-8">
              Las reservas de tus clientes aparecerán aquí
            </Text>
          </View>
        ) : (
          <View className="px-5 py-4">
            {reservations.map((reservation: Reservation) => (
              <View
                key={reservation.id}
                className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-4 mb-4 shadow-sm"
              >
                {/* Header */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <View 
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${getStatusColor(reservation.status)}20` }}
                    >
                      <Ionicons
                        name={getStatusIcon(reservation.status) as any}
                        size={24}
                        color={getStatusColor(reservation.status)}
                      />
                    </View>
                    <View>
                      
                      <View
                        className="px-2 py-1 rounded-full mt-1"
                        style={{ backgroundColor: getStatusColor(reservation.status) }}
                      >
                        <Text className="text-white text-xs font-bold">
                          {getStatusText(reservation.status)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <TouchableOpacity>
                    <Ionicons name="ellipsis-vertical" size={20} color="#794646" />
                  </TouchableOpacity>
                </View>

                {/* Product Info */}
                {reservation.product ? (
                  <View className="bg-[#F5F5F5] rounded-xl p-3 mb-3">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="cube-outline" size={16} color="#794646" />
                      <Text className="text-[#794646] ml-2 text-sm font-semibold flex-1">
                        {reservation.product.name}
                      </Text>
                    </View>
                    <View className="flex-row items-center mb-2">
                      <MaterialCommunityIcons name="cart" size={16} color="#794646" />
                      <Text className="text-[#794646] ml-2 text-sm">
                        Cantidad: {reservation.quantity}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View className="bg-[#F5F5F5] rounded-xl p-3 mb-3">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="cube-outline" size={16} color="#794646" />
                      <Text className="text-[#794646] ml-2 text-sm font-semibold flex-1">
                        Producto ID: {reservation.productId}
                      </Text>
                    </View>
                    <View className="flex-row items-center mb-2">
                      <MaterialCommunityIcons name="numeric" size={16} color="#794646" />
                      <Text className="text-[#794646] ml-2 text-sm">
                        Cantidad: {reservation.quantity}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Date Info */}
                <View className="bg-[#F5F5F5] rounded-xl p-3 mb-3 border border-[#E5E5E5]">
                  <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={16} color="#B5A78E" />
                    <View className="ml-2 flex-1">
                      <Text className="text-[#794646] text-xs font-semibold">Fecha de reserva</Text>
                      <Text className="text-[#794646] text-xs opacity-80">
                        {formatDate(reservation.createdAt)}
                      </Text>
                    </View>
                  </View>
                  {reservation.expiresAt && (
                    <View className="flex-row items-center mt-2 pt-2 border-t border-[#E5E5E5]">
                      <Ionicons name="time-outline" size={16} color="#B5A78E" />
                      <View className="ml-2 flex-1">
                        <Text className="text-[#794646] text-xs font-semibold">Expira</Text>
                        <Text className="text-[#794646] text-xs opacity-80">
                          {formatDate(reservation.expiresAt)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Actions */}
                {String(reservation.status).toUpperCase() === 'PENDING' && (
                  <View className="flex-row gap-2 mt-3 pt-3 border-t border-[#E5E5E5]">
                    <TouchableOpacity
                      className="flex-1 bg-[#794646] rounded-lg py-3 items-center"
                      onPress={() => handleConfirmReservation(reservation.id)}
                    >
                      <Text className="text-white font-semibold text-base">Confirmar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 bg-[#D2C0C0] rounded-lg py-3 items-center"
                      onPress={() => handleRejectReservation(reservation.id)}
                    >
                      <Text className="text-[#794646] font-semibold text-base">Rechazar</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {String(reservation.status).toUpperCase() === 'CONFIRMED' && (
                  <View className="mt-3 pt-3 border-t border-[#E5E5E5]">
                    <TouchableOpacity
                      className="bg-[#B5A78E] rounded-lg py-3 items-center"
                      onPress={() => handleCompleteReservation(reservation.id)}
                    >
                      <Text className="text-white font-semibold text-base">Marcar como Retirada</Text>
                    </TouchableOpacity>
                  </View>
                )}

                
              </View>
            ))}
          </View>
        )}

        <View className="h-32" />
      </ScrollView>

      {/* Business Picker Modal */}
      <Modal
        visible={showBusinessPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBusinessPicker(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowBusinessPicker(false)}
        >
          <Pressable
            className="bg-white rounded-2xl mx-5 w-5/6 max-h-96"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="p-5 border-b border-gray-200">
              <Text className="text-xl font-bold text-[#794646]">Seleccionar Negocio</Text>
            </View>
            <ScrollView className="max-h-80">
              {businesses.map((business) => {
                const pendingCount = pendingReservationsByBusiness.get(business.id) || 0;
                return (
                  <TouchableOpacity
                    key={business.id}
                    onPress={() => handleBusinessChange(business.id)}
                    className={`p-4 border-b border-gray-100 flex-row items-center justify-between ${
                      selectedBusinessId === business.id ? 'bg-[#F5F5F5]' : ''
                    }`}
                  >
                    <View className="flex-row items-center flex-1">
                      <View className="relative">
                        <MaterialCommunityIcons 
                          name="store" 
                          size={24} 
                          color={selectedBusinessId === business.id ? '#794646' : '#999'} 
                        />
                        {pendingCount > 0 && (
                          <View className="absolute -top-1 -right-1 bg-red-600 rounded-full min-w-[14px] h-[14px] items-center justify-center">
                            <Text className="text-white text-[8px] font-bold">
                              {pendingCount > 9 ? '9+' : pendingCount}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View className="ml-3 flex-1">
                        <Text
                          className={`text-base ${
                            selectedBusinessId === business.id
                              ? 'text-[#794646] font-bold'
                              : 'text-gray-700'
                          }`}
                        >
                          {business.name}
                        </Text>
                        {pendingCount > 0 && (
                          <Text className="text-xs text-red-600 font-semibold mt-1">
                            {pendingCount} {pendingCount === 1 ? 'reserva pendiente' : 'reservas pendientes'}
                          </Text>
                        )}
                      </View>
                    </View>
                    {selectedBusinessId === business.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#794646" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowBusinessPicker(false)}
              className="p-4 border-t border-gray-200"
            >
              <Text className="text-center text-[#794646] font-semibold">Cerrar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Status Picker Modal */}
      <Modal
        visible={showStatusPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStatusPicker(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowStatusPicker(false)}
        >
          <Pressable
            className="bg-white rounded-2xl mx-5 w-5/6"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="p-5 border-b border-gray-200">
              <Text className="text-xl font-bold text-[#794646]">Filtrar por Estado</Text>
            </View>
            <ScrollView className="max-h-80">
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleFilterChange(option.value)}
                  className={`p-4 border-b border-gray-100 flex-row items-center justify-between ${
                    selectedFilter === option.value ? 'bg-[#F5F5F5]' : ''
                  }`}
                >
                  <View className="flex-row items-center flex-1">
                    <Ionicons 
                      name="filter" 
                      size={24} 
                      color={selectedFilter === option.value ? '#794646' : '#999'} 
                    />
                    <Text
                      className={`ml-3 text-base ${
                        selectedFilter === option.value
                          ? 'text-[#794646] font-bold'
                          : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </View>
                  {selectedFilter === option.value && (
                    <Ionicons name="checkmark-circle" size={24} color="#794646" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowStatusPicker(false)}
              className="p-4 border-t border-gray-200"
            >
              <Text className="text-center text-[#794646] font-semibold">Cerrar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
