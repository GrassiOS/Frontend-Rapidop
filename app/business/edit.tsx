import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useBusiness } from '@/hooks/useBusiness';
import { Business, BusinessInput } from '@/services/businessService';
import LocationPicker from '@/components/maps/LocationPicker';

const FOOD_TYPES = [
  { value: 'Restaurante', icon: 'silverware-fork-knife', label: 'Restaurante' },
  { value: 'Cafetería', icon: 'coffee', label: 'Cafetería' },
  { value: 'Bar', icon: 'glass-cocktail', label: 'Bar' },
  { value: 'Comida Rápida', icon: 'hamburger', label: 'Comida Rápida' },
  { value: 'Panadería', icon: 'baguette', label: 'Panadería' },
  { value: 'Otro', icon: 'store', label: 'Otro' },
];

export default function EditBusinessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const businessId = params.id ? parseInt(params.id as string) : null;
  
  const { getBusinessById, updateBusiness, loading } = useBusiness();

  const [business, setBusiness] = useState<Business | null>(null);
  const [formData, setFormData] = useState<BusinessInput>({
    name: '',
    description: '',
    address: '',
    foodType: 'Restaurante',
    latitude: 0,
    longitude: 0,
  });
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [loadingBusiness, setLoadingBusiness] = useState(true);

  useEffect(() => {
    if (businessId) {
      loadBusiness();
    }
  }, [businessId]);

  const loadBusiness = async () => {
    if (!businessId) return;
    
    setLoadingBusiness(true);
    try {
      const data = await getBusinessById(businessId);
      if (data) {
        setBusiness(data);
        setFormData({
          name: data.name,
          description: data.description || '',
          address: data.address,
          foodType: data.foodType || 'Restaurante',
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el negocio');
      router.back();
    } finally {
      setLoadingBusiness(false);
    }
  };

  const handleLocationSelect = (location: { latitude: number; longitude: number }) => {
    setFormData({
      ...formData,
      latitude: location.latitude,
      longitude: location.longitude,
    });
    setShowLocationPicker(false);
  };

  const handleSubmit = async () => {
    if (!businessId) {
      Alert.alert('Error', 'ID de negocio no válido');
      return;
    }

    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre del negocio es requerido');
      return;
    }

    if (!formData.address.trim()) {
      Alert.alert('Error', 'La dirección es requerida');
      return;
    }

    if (!formData.latitude || !formData.longitude || (formData.latitude === 0 && formData.longitude === 0)) {
      Alert.alert(
        'Ubicación requerida',
        'Por favor selecciona la ubicación del negocio en el mapa'
      );
      return;
    }

    try {
      const result = await updateBusiness(businessId, formData);
      if (result) {
        Alert.alert('Éxito', 'Negocio actualizado correctamente', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo actualizar el negocio');
    }
  };

  if (loadingBusiness) {
    return (
      <View className="flex-1 bg-white items-center justify-center pt-12">
        <ActivityIndicator size="large" color="#B5A78E" />
        <Text className="text-[#794646] mt-4">Cargando negocio...</Text>
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
        <Text className="text-2xl font-bold text-[#794646]">Editar Negocio</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Nombre */}
        <View className="mt-6">
          <Text className="text-[#794646] text-base font-semibold mb-2">
            Nombre del negocio *
          </Text>
          <TextInput
            className="bg-[#F5F5F5] rounded-xl px-4 py-3 text-[#794646] border border-[#E5E5E5]"
            placeholder="Ej: La Casa del Sabor"
            placeholderTextColor="#D2C0C0"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
        </View>

        {/* Descripción */}
        <View className="mt-4">
          <Text className="text-[#794646] text-base font-semibold mb-2">
            Descripción
          </Text>
          <TextInput
            className="bg-[#F5F5F5] rounded-xl px-4 py-3 text-[#794646] border border-[#E5E5E5]"
            placeholder="Describe tu negocio..."
            placeholderTextColor="#D2C0C0"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{ minHeight: 100 }}
          />
        </View>

        {/* Tipo de comida */}
        <View className="mt-4">
          <Text className="text-[#794646] text-base font-semibold mb-2">
            Tipo de negocio *
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {FOOD_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                onPress={() => setFormData({ ...formData, foodType: type.value })}
                className={`flex-row items-center px-4 py-2 rounded-xl border ${
                  formData.foodType === type.value
                    ? 'bg-[#B5A78E] border-[#B5A78E]'
                    : 'bg-[#F5F5F5] border-[#E5E5E5]'
                }`}
              >
                <MaterialCommunityIcons
                  name={type.icon as any}
                  size={20}
                  color={formData.foodType === type.value ? 'white' : '#794646'}
                />
                <Text
                  className={`ml-2 ${
                    formData.foodType === type.value ? 'text-white' : 'text-[#794646]'
                  }`}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dirección */}
        <View className="mt-4">
          <Text className="text-[#794646] text-base font-semibold mb-2">
            Dirección *
          </Text>
          <TextInput
            className="bg-[#F5F5F5] rounded-xl px-4 py-3 text-[#794646] border border-[#E5E5E5]"
            placeholder="Calle, número, ciudad..."
            placeholderTextColor="#D2C0C0"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />
        </View>

        {/* Ubicación en mapa */}
        <View className="mt-4">
          <Text className="text-[#794646] text-base font-semibold mb-2">
            Ubicación en el mapa *
          </Text>
          <TouchableOpacity
            onPress={() => setShowLocationPicker(true)}
            className="bg-[#F5F5F5] rounded-xl px-4 py-3 border border-[#E5E5E5] flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1">
              <Ionicons
                name={
                  formData.latitude && formData.longitude && (formData.latitude !== 0 || formData.longitude !== 0)
                    ? 'location'
                    : 'location-outline'
                }
                size={24}
                color="#794646"
              />
              <Text className="text-[#794646] ml-3 flex-1">
                {formData.latitude && formData.longitude && (formData.latitude !== 0 || formData.longitude !== 0)
                  ? `${formData.latitude.toFixed(4)}, ${formData.longitude.toFixed(4)}`
                  : 'Seleccionar ubicación en el mapa'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B5A78E" />
          </TouchableOpacity>
        </View>

        {/* Botón de guardar */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`mt-8 mb-8 rounded-xl py-4 items-center ${
            loading ? 'bg-gray-400' : 'bg-[#B5A78E]'
          }`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <View className="flex-row items-center">
              <Ionicons name="save" size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">
                Guardar Cambios
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View className="h-32" />
      </ScrollView>

      {/* Location Picker Modal */}
      <LocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={
          formData.latitude && formData.longitude && (formData.latitude !== 0 || formData.longitude !== 0)
            ? { latitude: formData.latitude, longitude: formData.longitude }
            : undefined
        }
      />
    </View>
  );
}
