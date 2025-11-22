import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@/types/product';
import { useReservation } from '@/hooks/useReservation';
import { useRouter } from 'expo-router';

interface ReservationModalProps {
  visible: boolean;
  onClose: () => void;
  product: Product;
}

export function ReservationModal({
  visible,
  onClose,
  product,
}: ReservationModalProps) {
  const router = useRouter();
  const { createReservation, loading } = useReservation();
  const [quantity, setQuantity] = useState('1');

  const handleQuantityChange = (text: string) => {
    // Solo permitir números
    const numericValue = text.replace(/[^0-9]/g, '');
    setQuantity(numericValue);
  };

  const incrementQuantity = () => {
    const current = parseInt(quantity) || 0;
    if (current < product.stock) {
      setQuantity((current + 1).toString());
    }
  };

  const decrementQuantity = () => {
    const current = parseInt(quantity) || 0;
    if (current > 1) {
      setQuantity((current - 1).toString());
    }
  };

  const handleReserve = async () => {
    const qty = parseInt(quantity);

    // Validaciones
    if (!qty || qty <= 0) {
      Alert.alert('Error', 'Por favor ingresa una cantidad válida');
      return;
    }

    if (qty > product.stock) {
      Alert.alert(
        'Stock insuficiente',
        `Solo hay ${product.stock} unidades disponibles`
      );
      return;
    }

    // Confirmar reserva
    Alert.alert(
      'Confirmar Reserva',
      `¿Deseas reservar ${qty} unidad${qty > 1 ? 'es' : ''} de ${product.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reservar',
          onPress: async () => {
            const reservation = await createReservation({
              productId: product.id,
              businessId: product.businessId,
              quantity: qty,
            });

            if (reservation) {
              onClose();
              setQuantity('1');
            }
          },
        },
      ]
    );
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const qty = parseInt(quantity) || 0;
  const unitPrice = product.discountedPrice || product.price;
  const totalPrice = unitPrice * qty;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-white rounded-t-3xl pb-8 max-h-[80%] shadow-2xl">
          {/* Header */}
          <View className="flex-row justify-between items-center p-5 pb-4 bg-gradient-to-b from-[#B5A78E]/10 to-transparent">
            <Text className="text-xl font-bold text-[#794646]">Hacer Reserva</Text>
            <TouchableOpacity 
              onPress={onClose} 
              disabled={loading}
              className="w-10 h-10 rounded-full bg-[#EBE5EB] items-center justify-center active:scale-90"
            >
              <Ionicons name="close" size={24} color="#794646" />
            </TouchableOpacity>
          </View>

          {/* Producto info */}
          <View className="flex-row p-5 bg-[#FAFAFA] mx-4 rounded-2xl mt-3 shadow-sm border-2 border-[#E5E5E5]">
            {product.imageUrl ? (
              <Image
                source={{ uri: product.imageUrl }}
                className="w-24 h-24 rounded-2xl mr-4 border-2 border-[#EBE5EB]"
                resizeMode="cover"
              />
            ) : (
              <View className="w-24 h-24 rounded-2xl mr-4 bg-gradient-to-br from-[#EBE5EB] to-[#D2C0C0] justify-center items-center border-2 border-[#E5E5E5]">
                <Ionicons name="fast-food-outline" size={48} color="#B5A78E" />
              </View>
            )}

            <View className="flex-1 justify-center">
              <Text className="text-lg font-bold text-[#794646] mb-2" numberOfLines={2}>
                {product.name}
              </Text>
              {product.business && (
                <View className="flex-row items-center mb-2 bg-[#EBE5EB] px-2 py-1 rounded-lg self-start">
                  <Ionicons name="storefront" size={14} color="#B5A78E" />
                  <Text className="text-xs text-[#794646] font-medium ml-1.5 flex-1" numberOfLines={1}>
                    {product.business.name}
                  </Text>
                </View>
              )}
              <View className="flex-row items-baseline gap-2">
                <Text className="text-2xl font-bold text-[#B5A78E]">
                  {formatPrice(unitPrice)}
                </Text>
                {product.discountedPrice && (
                  <Text className="text-sm text-gray-400 line-through">
                    {formatPrice(product.price)}
                  </Text>
                )}
              </View>
              <View className="flex-row items-center mt-2">
                <View className="bg-[#B5A78E]/10 px-2 py-1 rounded-full">
                  <Text className="text-xs text-[#794646] font-semibold">
                    Stock: {product.stock}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Cantidad selector */}
          <View className="p-5 pt-6">
            <Text className=" font-bold text-[#794646] mb-4">Selecciona la cantidad:</Text>
            <View className="flex-row items-center justify-center bg-[#FAFAFA] rounded-2xl p-4 border-2 border-[#E5E5E5]">
              <TouchableOpacity
                className={`w-14 h-14 rounded-full justify-center items-center shadow-md ${
                  qty <= 1 ? 'bg-[#EBE5EB]' : 'bg-[#B5A78E]'
                }`}
                onPress={decrementQuantity}
                disabled={qty <= 1 || loading}
                style={{
                  elevation: qty <= 1 ? 0 : 4,
                }}
              >
                <Ionicons
                  name="remove"
                  size={28}
                  color={qty <= 1 ? '#D2C0C0' : '#FFFFFF'}
                />
              </TouchableOpacity>

              <View className="mx-6 bg-white rounded-2xl border-2 border-[#B5A78E] px-4 py-3 min-w-[80px]">
                <TextInput
                  className="text-center text-3xl font-bold text-[#794646]"
                  value={quantity}
                  onChangeText={handleQuantityChange}
                  keyboardType="number-pad"
                  maxLength={3}
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                className={`w-14 h-14 rounded-full justify-center items-center shadow-md ${
                  qty >= product.stock ? 'bg-[#EBE5EB]' : 'bg-[#B5A78E]'
                }`}
                onPress={incrementQuantity}
                disabled={qty >= product.stock || loading}
                style={{
                  elevation: qty >= product.stock ? 0 : 4,
                }}
              >
                <Ionicons
                  name="add"
                  size={28}
                  color={qty >= product.stock ? '#D2C0C0' : '#FFFFFF'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Total */}
          <View className="mx-5 mb-4 bg-gradient-to-r from-[#B5A78E] to-[#A89780] rounded-2xl p-5 shadow-lg" style={{ elevation: 6 }}>
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-sm text-black font-bold mb-1">Total a pagar</Text>
                <Text className="text-3xl font-bold text-black">{formatPrice(totalPrice)}</Text>
              </View>
            </View>
          </View>

          {/* Información importante */}
          <View className="flex-row p-4 mx-5 mb-4 rounded-2xl items-start border-2 border-gray-300 shadow-sm">
            <View className="bg-amber-100 w-8 h-8 rounded-full items-center justify-center mr-3">
              <Ionicons name="information" size={18} color="#F59E0B" />
            </View>
            <Text className="flex-1 text-sm text-amber-900 font-medium leading-5">
              El negocio debe confirmar tu reserva. Podrás cancelarla dentro de
              los primeros 20 minutos.
            </Text>
          </View>

          {/* Botones */}
          <View className="flex-row px-5 gap-3">
            <TouchableOpacity
              className="flex-1 h-14 rounded-2xl justify-center items-center bg-white border-2 border-[#D2C0C0] active:scale-95"
              onPress={onClose}
              disabled={loading}
              style={{ elevation: 2 }}
            >
              <Text className="text-base font-bold text-[#794646]">Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 h-14 rounded-2xl justify-center items-center flex-row shadow-lg active:scale-95 ${
                loading || qty <= 0 ? 'bg-[#D2C0C0]' : 'bg-[#794646]'
              }`}
              onPress={handleReserve}
              disabled={loading || qty <= 0}
              style={{ elevation: loading || qty <= 0 ? 0 : 8 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="calendar" size={22} color="#fff" />
                  <Text className="text-base font-bold text-white ml-2">Reservar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
