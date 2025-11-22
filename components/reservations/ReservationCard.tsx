import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Reservation, ReservationStatus } from '@/types/reservation';
import { Ionicons } from '@expo/vector-icons';

interface ReservationCardProps {
  reservation: Reservation;
  onCancel?: (id: number) => void;
  onConfirm?: (id: number) => void;
  onMarkPickedUp?: (id: number) => void;
  onViewDetails?: (reservation: Reservation) => void;
  showBusinessActions?: boolean;
  canCancelReservation?: (reservation: Reservation) => boolean;
  getTimeLeftToCancel?: (reservation: Reservation) => number;
  getStatusColor: (status: ReservationStatus) => string;
  getStatusText: (status: ReservationStatus) => string;
}

export function ReservationCard({
  reservation,
  onCancel,
  onConfirm,
  onMarkPickedUp,
  onViewDetails,
  showBusinessActions = false,
  canCancelReservation,
  getTimeLeftToCancel,
  getStatusColor,
  getStatusText,
}: ReservationCardProps) {
  const statusColor = getStatusColor(reservation.status);
  const statusText = getStatusText(reservation.status);


  const handleCancel = () => {
    if (onCancel) {
      onCancel(reservation.id);
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      Alert.alert(
        'Confirmar Reserva',
        '¿Deseas confirmar esta reserva?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar', onPress: () => onConfirm(reservation.id) },
        ]
      );
    }
  };

  const handleMarkPickedUp = () => {
    if (onMarkPickedUp) {
      Alert.alert(
        'Marcar como Retirado',
        '¿El cliente ya retiró el producto?',
        [
          { text: 'No', style: 'cancel' },
          { text: 'Sí', onPress: () => onMarkPickedUp(reservation.id) },
        ]
      );
    }
  };

  const canCancel = canCancelReservation && canCancelReservation(reservation);
  const timeLeft = getTimeLeftToCancel ? getTimeLeftToCancel(reservation) : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const totalPrice = reservation.product?.discountedPrice
    ? reservation.product.discountedPrice * reservation.quantity
    : (reservation.product?.price || 0) * reservation.quantity;

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl mx-4 my-2 overflow-hidden border-2 border-[#E5E5E5]"
      onPress={() => onViewDetails && onViewDetails(reservation)}
      activeOpacity={0.7}
      style={{
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-gradient-to-r from-[#EBE5EB] to-[#F5F5F5]">
        <View className="px-4 py-1.5 rounded-full shadow-sm" style={{ backgroundColor: statusColor, elevation: 2 }}>
          <Text className="text-white text-xs font-bold">{statusText}</Text>
        </View>
        <View className="bg-white/60 px-3 py-1 rounded-full">
          <Text className="text-xs text-[#794646] font-bold">#{reservation.id}</Text>
        </View>
      </View>

      {/* Content */}
      <View className="flex-row p-4 bg-[#FAFAFA]">
        {reservation.product?.imageUrl ? (
          <Image
            source={{ uri: reservation.product.imageUrl }}
            className="w-24 h-24 rounded-2xl mr-3 border-2 border-[#EBE5EB]"
            resizeMode="cover"
          />
        ) : (
          <View className="w-24 h-24 rounded-2xl mr-3 bg-gradient-to-br from-[#EBE5EB] to-[#D2C0C0] justify-center items-center border-2 border-[#E5E5E5]">
            <Ionicons name="fast-food-outline" size={48} color="#B5A78E" />
          </View>
        )}

        <View className="flex-1 justify-center">
          <Text className="text-base font-bold text-[#794646] mb-2" numberOfLines={2}>
            {reservation.product?.name || 'Producto'}
          </Text>

          {reservation.product?.business && (
            <View className="flex-row items-center mb-2 bg-[#EBE5EB] px-2 py-1 rounded-lg self-start">
              <Ionicons name="storefront" size={12} color="#B5A78E" />
              <Text className="text-xs text-[#794646] font-medium ml-1.5" numberOfLines={1}>
                {reservation.product.business.name}
              </Text>
            </View>
          )}

          <View className="flex-row items-center mb-1.5">
            <View className="bg-[#B5A78E]/10 px-2 py-1 rounded-full mr-2">
              <View className="flex-row items-center">
                <Ionicons name="cube" size={12} color="#B5A78E" />
                <Text className="text-xs text-[#794646] font-semibold ml-1">
                  {reservation.quantity}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-center mb-1.5">
            <Ionicons name="cash" size={16} color="#B5A78E" />
            <Text className="text-base font-bold text-[#B5A78E] ml-1.5">
              {formatPrice(totalPrice)}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={12} color="#B5A78E" />
            <Text className="text-xs text-[#794646] opacity-70 ml-1">
              {formatDate(reservation.createdAt)}
            </Text>
          </View>

          {reservation.expiresAt && (
            <View className="flex-row items-center mt-1">
              <Ionicons name="alarm" size={12} color="#F59E0B" />
              <Text className="text-xs text-amber-700 font-semibold ml-1">
                Expira: {formatDate(reservation.expiresAt)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Acciones para consumidor */}
      {!showBusinessActions && canCancel && (
        <View className="p-4 bg-white border-t-2 border-[#E5E5E5]">
          <View className="flex-row items-center bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-xl mb-3 border-2 border-amber-200">
            <View className="bg-amber-100 w-7 h-7 rounded-full items-center justify-center mr-2.5">
              <Ionicons name="information" size={16} color="#F59E0B" />
            </View>
            <Text className="text-xs text-amber-900 font-medium flex-1 leading-4">
              Puedes cancelar en los próximos {timeLeft} minutos
            </Text>
          </View>
          <TouchableOpacity
            className="bg-white border-2 border-[#D2C0C0] flex-row items-center justify-center py-3.5 rounded-xl active:scale-95 shadow-sm"
            onPress={handleCancel}
            style={{ elevation: 2 }}
          >
            <Ionicons name="close-circle" size={22} color="#794646" />
            <Text className="text-[#794646] text-sm font-bold ml-2">Cancelar Reserva</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Acciones para negocio */}
      {showBusinessActions && (
        <View className="p-4 bg-white border-t-2 border-[#E5E5E5]">
          {reservation.status === ReservationStatus.PENDING && onConfirm && (
            <TouchableOpacity
              className="bg-[#794646] flex-row items-center justify-center py-3.5 rounded-xl active:scale-95 shadow-lg"
              onPress={handleConfirm}
              style={{ elevation: 6 }}
            >
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text className="text-white text-sm font-bold ml-2">Confirmar Reserva</Text>
            </TouchableOpacity>
          )}

          {reservation.status === ReservationStatus.CONFIRMED && onMarkPickedUp && (
            <TouchableOpacity
              className="bg-gradient-to-r from-[#B5A78E] to-[#A89780] flex-row items-center justify-center py-3.5 rounded-xl active:scale-95 shadow-lg"
              onPress={handleMarkPickedUp}
              style={{ elevation: 6 }}
            >
              <Ionicons name="bag-check" size={22} color="#fff" />
              <Text className="text-white text-sm font-bold ml-2">Marcar como Retirado</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}
