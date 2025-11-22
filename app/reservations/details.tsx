import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useReservation } from '@/hooks/useReservation';
import { Reservation, ReservationStatus } from '@/types/reservation';
import { Ionicons } from '@expo/vector-icons';
import { RatingDisplay, RatingForm } from '@/components/ratings';
import { useAuth } from '@/contexts/AuthContext';

export default function ReservationDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const {
    getReservationById,
    cancelReservation,
    canCancelReservation,
    getTimeLeftToCancel,
    getStatusColor,
    getStatusText,
  } = useReservation();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    loadReservation();
  }, [id]);

  const loadReservation = async () => {
    if (!id) return;
    
    setLoading(true);
    const data = await getReservationById(parseInt(id));
    setReservation(data);
    setLoading(false);
  };

  const handleCancel = async () => {
    if (!reservation) return;
    
    const success = await cancelReservation(reservation.id);
    if (success) {
      await loadReservation();
    }
  };

  const handleCallBusiness = () => {
    const phone = reservation?.product?.business?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Error', 'No hay número de teléfono disponible');
    }
  };

  const handleOpenMap = () => {
    const business = reservation?.product?.business;
    if (business?.latitude && business?.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`;
      Linking.openURL(url);
    } else {
      Alert.alert('Error', 'No hay ubicación disponible');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center pt-12">
        <ActivityIndicator size="large" color="#ff6b35" />
        <Text className="text-gray-600 mt-3">Cargando detalles...</Text>
      </View>
    );
  }

  if (!reservation) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-8 pt-12">
        <Ionicons name="alert-circle-outline" size={64} color="#f44336" />
        <Text className="text-xl font-semibold text-gray-800 mt-4 mb-6">
          Reserva no encontrada
        </Text>
        <TouchableOpacity
          className="bg-[#ff6b35] px-6 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white text-base font-semibold">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColor = getStatusColor(reservation.status);
  const statusText = getStatusText(reservation.status);
  const canCancel = canCancelReservation(reservation);
  const timeLeft = getTimeLeftToCancel(reservation);

  const totalPrice = reservation.product?.discountedPrice
    ? reservation.product.discountedPrice * reservation.quantity
    : (reservation.product?.price || 0) * reservation.quantity;

  return (
    <ScrollView className="flex-1 bg-white pt-12">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#794646" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-[#794646] flex-1">
          Detalle de Reserva
        </Text>
      </View>

      {/* Header con estado */}
      <View className="p-6 items-center" style={{ backgroundColor: statusColor }}>
        <Text className="text-2xl font-bold text-white mb-1">{statusText}</Text>
      </View>

      {/* Imagen del producto - Grande */}
      {reservation.product?.imageUrl ? (
        <Image
          source={{ uri: reservation.product.imageUrl }}
          className="w-full h-80 bg-gray-100"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-80 bg-gray-100 justify-center items-center">
          <Ionicons name="fast-food-outline" size={100} color="#ccc" />
        </View>
      )}

      {/* Nombre del negocio destacado sobre la imagen */}
      {reservation.product?.business && (
        <View className="bg-white/95 mx-4 -mt-12 mb-3 p-4 rounded-xl shadow-lg" style={{ 
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
          <View className="flex-row items-center">
            <View className="bg-orange-100 p-3 rounded-full mr-3">
              <Ionicons name="storefront" size={24} color="#ff6b35" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1">NEGOCIO</Text>
              <Text className="text-xl font-bold text-gray-900">
                {reservation.product.business.name}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Información del producto */}
      <View className="bg-white p-4 mt-3">
        <Text className="text-lg font-semibold text-gray-800 mb-3">Producto</Text>
        <Text className="text-xl font-semibold text-gray-900 mb-2">
          {reservation.product?.name}
        </Text>
        <Text className="text-sm text-gray-600 leading-5 mb-4">
          {reservation.product?.description}
        </Text>

        <View className="flex-row justify-between pt-4 border-t border-gray-100">
          <View className="items-center">
            <Text className="text-xs text-gray-500 mb-1">Precio unitario</Text>
            <Text className="text-base font-semibold text-gray-900">
              {formatPrice(reservation.product?.discountedPrice || reservation.product?.price || 0)}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-xs text-gray-500 mb-1">Cantidad</Text>
            <Text className="text-base font-semibold text-gray-900">
              {reservation.quantity}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-xs text-gray-500 mb-1">Total</Text>
            <Text className="text-lg font-bold text-[#ff6b35]">
              {formatPrice(totalPrice)}
            </Text>
          </View>
        </View>
      </View>

      {/* Información del negocio */}
      {reservation.product?.business && (
        <View className="bg-white p-4 mt-3">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Negocio</Text>
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            {reservation.product.business.name}
          </Text>
          <View className="flex-row items-center mb-4">
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text className="text-sm text-gray-600 ml-2 flex-1">
              {reservation.product.business.address}
            </Text>
          </View>

          <View className="flex-row gap-3">
            {reservation.product.business.phone && (
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center p-3 rounded-lg border border-gray-200"
                onPress={handleCallBusiness}
              >
                <Ionicons name="call-outline" size={20} color="#4CAF50" />
                <Text className="text-sm font-medium text-gray-900 ml-2">Llamar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center p-3 rounded-lg border border-gray-200"
              onPress={handleOpenMap}
            >
              <Ionicons name="map-outline" size={20} color="#2196F3" />
              <Text className="text-sm font-medium text-gray-900 ml-2">Ver mapa</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Información de la reserva */}
      <View className="bg-white p-4 mt-3">
        <Text className="text-lg font-semibold text-gray-800 mb-3">Detalles de la Reserva</Text>
        
        <View className="flex-row justify-between py-2 border-b border-gray-100">
          <Text className="text-sm text-gray-600">Creada:</Text>
          <Text className="text-sm font-medium text-gray-900 flex-1 text-right ml-4">
            {formatDate(reservation.createdAt)}
          </Text>
        </View>

        {reservation.expiresAt && (
          <View className="flex-row justify-between py-2 border-b border-gray-100">
            <Text className="text-sm text-gray-600">Expira:</Text>
            <Text className="text-sm font-medium text-red-600 flex-1 text-right ml-4">
              {formatDate(reservation.expiresAt)}
            </Text>
          </View>
        )}

        {reservation.cancelledAt && (
          <View className="flex-row justify-between py-2 border-b border-gray-100">
            <Text className="text-sm text-gray-600">Cancelada:</Text>
            <Text className="text-sm font-medium text-gray-900 flex-1 text-right ml-4">
              {formatDate(reservation.cancelledAt)}
            </Text>
          </View>
        )}

        {reservation.pickedUpAt && (
          <View className="flex-row justify-between py-2 border-b border-gray-100">
            <Text className="text-sm text-gray-600">Retirada:</Text>
            <Text className="text-sm font-medium text-gray-900 flex-1 text-right ml-4">
              {formatDate(reservation.pickedUpAt)}
            </Text>
          </View>
        )}
      </View>

      {/* Acciones */}
      {canCancel && (
        <View className="bg-white p-4 mt-3">
          <View className="flex-row bg-orange-50 p-3 rounded-lg mb-4">
            <Ionicons name="information-circle-outline" size={24} color="#ff9800" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold text-orange-900 mb-1">
                Tiempo para cancelar
              </Text>
              <Text className="text-xs text-orange-900">
                Tienes {timeLeft} minutos restantes para cancelar esta reserva
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="bg-red-500 flex-row items-center justify-center p-4 rounded-lg"
            onPress={handleCancel}
          >
            <Ionicons name="close-circle-outline" size={24} color="#fff" />
            <Text className="text-white text-base font-semibold ml-2">Cancelar Reserva</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Información según el estado */}
      {reservation.status === ReservationStatus.PENDING && (
        <View className="flex-row bg-orange-50 p-4 mx-4 mt-3 rounded-lg items-center">
          <Ionicons name="time-outline" size={24} color="#ff9800" />
          <Text className="flex-1 text-sm text-gray-800 ml-3 leading-5">
            Tu reserva está pendiente de confirmación por parte del negocio.
          </Text>
        </View>
      )}

      {reservation.status === ReservationStatus.CONFIRMED && (
        <View className="flex-row bg-green-50 p-4 mx-4 mt-3 rounded-lg items-center">
          <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
          <Text className="flex-1 text-sm text-gray-800 ml-3 leading-5">
            ¡Tu reserva ha sido confirmada! Puedes recoger tu producto en el negocio.
          </Text>
        </View>
      )}

      {(reservation.status === ReservationStatus.PICKED_UP || 
        reservation.status === 'PICKED_UP' || 
        reservation.pickedUpAt) && (
        <View className="flex-row p-4 mx-4 mt-3 rounded-lg items-center" style={{ backgroundColor: '#F5F5F5' }}>
          <Ionicons name="bag-check-outline" size={24} color="#794646" />
          <Text className="flex-1 text-sm ml-3 leading-5" style={{ color: '#794646' }}>
            Esta reserva ha sido completada exitosamente.
          </Text>
        </View>
      )}

      {/* Sección de Calificaciones - Solo para reservas completadas (Retirada) */}
      {(reservation.status === ReservationStatus.PICKED_UP || 
        reservation.status === 'PICKED_UP' || 
        reservation.pickedUpAt) && 
       reservation.product?.business && 
       user?.role === 'CONSUMER' && (
        <View className="bg-white p-4 mx-4 mt-3 mb-6 rounded-xl" style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <View className="flex-row items-center mb-4">
            <Ionicons name="star" size={24} color="#794646" />
            <Text className="text-xl font-bold ml-2" style={{ color: '#794646' }}>
              Califica tu experiencia
            </Text>
          </View>
          
          <View className="p-3 rounded-lg mb-4" style={{ backgroundColor: '#F5F5F5' }}>
            <Text className="text-sm text-center" style={{ color: '#794646' }}>
              ¿Cómo fue tu experiencia con <Text className="font-bold">{reservation.product.business.name}</Text>?
            </Text>
          </View>

          {/* Botón para abrir modal de calificación */}
          <TouchableOpacity
            className="flex-row items-center justify-center p-4 rounded-lg mb-4"
            style={{ backgroundColor: '#794646' }}
            onPress={() => setShowRatingModal(true)}
          >
            <Ionicons name="star" size={20} color="#FFF" />
            <Text className="text-white text-base font-semibold ml-2">
              Calificar este negocio
            </Text>
          </TouchableOpacity>

          {/* Vista de calificaciones existentes */}
          <RatingDisplay
            targetType="business"
            targetId={reservation.product.business.id}
            targetName={reservation.product.business.name}
            showRateButton={false}
            allowRating={false}
          />
        </View>
      )}

      <View className="h-6" />

      {/* Modal de calificación */}
      <Modal
        visible={showRatingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl pt-6 pb-8 px-4" style={{
            maxHeight: '90%',
          }}>
            {/* Barra superior del modal */}
            <View className="items-center mb-4">
              <View className="w-12 h-1 rounded-full" style={{ backgroundColor: '#794646' }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {reservation.product?.business && (
                <RatingForm
                  targetType="business"
                  targetId={reservation.product.business.id}
                  targetName={reservation.product.business.name}
                  onSuccess={() => {
                    setShowRatingModal(false);
                    loadReservation();
                  }}
                  onCancel={() => setShowRatingModal(false)}
                />
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
