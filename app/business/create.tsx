import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBusiness } from '@/hooks/useBusiness';
import { BusinessInput } from '@/services/businessService';
import { useAuth } from '@/contexts/AuthContext';
import { BusinessRoute } from '@/components/common/BusinessRoute';
import LocationPicker, { LocationData } from '@/components/maps/LocationPicker';

export default function CreateBusinessScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { createBusiness, loading, error } = useBusiness();

  const [formData, setFormData] = useState<BusinessInput>({
    name: '',
    description: '',
    address: '',
    foodType: 'Restaurante', // Cambiado de category
    latitude: 0,
    longitude: 0,
  });

  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const foodTypes = [
    'Restaurante',
    'Cafetería',
    'Bar',
    'Comida Rápida',
    'Panadería',
    'Otro',
  ];

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre del negocio es obligatorio');
      return;
    }

    if (!formData.address.trim()) {
      Alert.alert('Error', 'La dirección es obligatoria');
      return;
    }

    try {
      const business = await createBusiness(formData);

      if (business) {
        // Mostrar mensaje de éxito
        Alert.alert('¡Éxito!', 'Negocio creado correctamente', [
          {
            text: 'OK',
            onPress: () => {
              // Volver atrás y la lista se actualizará automáticamente con useFocusEffect
              router.back();
            },
          },
        ]);
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo crear el negocio');
    }
  };

  const updateField = (field: keyof BusinessInput, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationSelect = (location: LocationData) => {
    setFormData((prev) => ({
      ...prev,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
    }));
    setShowLocationPicker(false);
  };

  return (
    <View className="flex-1 bg-white pt-12">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#794646" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-[#794646] flex-1">
          Crear Negocio
        </Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Error Message */}
        {error && (
          <View className="bg-red-100 border border-red-400 rounded-lg p-3 mb-4 mt-4">
            <Text className="text-red-700">{error}</Text>
          </View>
        )}

        {/* Form */}
        <View className="py-4">
          {/* Name */}
          <View className="mb-4">
            <Text className="text-[#794646] font-semibold mb-2">
              Nombre del Negocio *
            </Text>
            <TextInput
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
              placeholder="Ej: Restaurante El Buen Sabor"
              placeholderTextColor="#79464699"
              className="bg-[#F5F5F5] rounded-lg px-4 py-3 text-[#794646]"
            />
          </View>

          {/* Food Type (Tipo de Comida) */}
          <View className="mb-4">
            <Text className="text-[#794646] font-semibold mb-2">Tipo de Comida</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {foodTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => updateField('foodType', type)}
                  className={`mr-2 px-4 py-2 rounded-lg ${
                    formData.foodType === type
                      ? 'bg-[#B5A78E]'
                      : 'bg-[#F5F5F5]'
                  }`}
                >
                  <Text
                    className={`${
                      formData.foodType === type
                        ? 'text-white font-semibold'
                        : 'text-[#794646]'
                    }`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-[#794646] font-semibold mb-2">
              Descripción
            </Text>
            <TextInput
              value={formData.description}
              onChangeText={(text) => updateField('description', text)}
              placeholder="Describe tu negocio..."
              placeholderTextColor="#79464699"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="bg-[#F5F5F5] rounded-lg px-4 py-3 text-[#794646]"
            />
          </View>

          {/* Address with Map Picker */}
          <View className="mb-4">
            <Text className="text-[#794646] font-semibold mb-2">
              Dirección *
            </Text>
            
            {/* Address Display/Input */}
            <TouchableOpacity
              onPress={() => setShowLocationPicker(true)}
              className="bg-[#F5F5F5] rounded-lg px-4 py-3 mb-2 flex-row items-center justify-between"
            >
              <View className="flex-1 mr-2">
                {formData.address ? (
                  <Text className="text-[#794646]" numberOfLines={2}>
                    {formData.address}
                  </Text>
                ) : (
                  <Text className="text-[#79464699]">
                    Toca para seleccionar ubicación en el mapa
                  </Text>
                )}
              </View>
              <Ionicons name="location" size={24} color="#B5A78E" />
            </TouchableOpacity>

            {/* Manual Address Input (opcional) */}
            <TextInput
              value={formData.address}
              onChangeText={(text) => updateField('address', text)}
              placeholder="O escribe la dirección manualmente"
              placeholderTextColor="#79464699"
              className="bg-[#F5F5F5] rounded-lg px-4 py-3 text-[#794646]"
            />
          </View>

          {/* Location (GPS Coordinates) */}
          {(formData.latitude !== 0 || formData.longitude !== 0) && (
            <View className="mb-4">
              <Text className="text-[#794646] font-semibold mb-2">
                Coordenadas GPS
              </Text>
              <View className="bg-[#F5F5F5] rounded-lg px-4 py-3">
                <View className="flex-row items-center">
                  <Ionicons name="navigate" size={18} color="#B5A78E" />
                  <Text className="text-[#794646] ml-2">
                    Lat: {(formData.latitude || 0).toFixed(6)}, Lng: {(formData.longitude || 0).toFixed(6)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`bg-[#B5A78E] rounded-lg py-4 items-center mb-4 ${
              loading ? 'opacity-50' : ''
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-bold">
                Crear Negocio
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('../business/list')}
            className="bg-[#F5F5F5] rounded-lg py-4 items-center mb-24"
          >
            <Text className="text-[#794646] text-lg font-semibold">
              Ver Negocios
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Location Picker Modal */}
      <LocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={
          formData.latitude && formData.longitude && formData.latitude !== 0 && formData.longitude !== 0
            ? { latitude: formData.latitude, longitude: formData.longitude }
            : undefined
        }
      />
    </View>
  );
}