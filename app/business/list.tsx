import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useBusiness } from '@/hooks/useBusiness';
import { Business } from '@/services/businessService';
import { useAuth } from '@/contexts/AuthContext';

export default function BusinessListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { getBusinesses, deleteBusiness, loading, error } = useBusiness();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadBusinesses = async () => {
    const data = await getBusinesses();
    setBusinesses(data);
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  // Recargar cuando la pantalla vuelve a estar en foco
  useFocusEffect(
    React.useCallback(() => {
      loadBusinesses();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBusinesses();
    setRefreshing(false);
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de eliminar "${name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteBusiness(id);
              if (success) {
                Alert.alert('Éxito', 'Negocio eliminado correctamente');
                await loadBusinesses();
              } else {
                Alert.alert('Error', 'No se pudo eliminar el negocio');
              }
            } catch (error: any) {
              Alert.alert(
                'Error al eliminar',
                error.message || 'Ocurrió un error inesperado'
              );
            }
          },
        },
      ]
    );
  };

  const getFoodTypeIcon = (foodType: string) => {
    const icons: { [key: string]: any } = {
      Restaurante: 'silverware-fork-knife',
      Cafetería: 'coffee',
      Bar: 'glass-cocktail',
      'Comida Rápida': 'hamburger',
      Panadería: 'baguette',
      Otro: 'store',
    };
    return icons[foodType] || 'store';
  };

  if (loading && !refreshing && businesses.length === 0) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#B5A78E" />
        <Text className="text-[#794646] mt-4">Cargando negocios...</Text>
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
          {user?.role === 'BUSINESS' ? 'Mis Negocios' : 'Negocios'}
        </Text>
        {user?.role === 'BUSINESS' && (
          <TouchableOpacity onPress={() => router.push('../business/create')}>
            <Ionicons name="add-circle" size={32} color="#B5A78E" />
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <View className="bg-red-100 border border-red-400 rounded-lg p-3 mx-5 mt-4">
          <Text className="text-red-700">{error}</Text>
        </View>
      )}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {businesses.length === 0 ? (
          <View className="items-center justify-center py-20">
            <MaterialCommunityIcons name="store-off" size={80} color="#D2C0C0" />
            <Text className="text-[#794646] text-lg mt-4 text-center px-8">
              {user?.role === 'BUSINESS' 
                ? 'No tienes negocios registrados'
                : 'No hay negocios disponibles'}
            </Text>
            {user?.role === 'BUSINESS' && (
              <TouchableOpacity
                onPress={() => router.push('../business/create')}
                className="bg-[#B5A78E] rounded-lg px-6 py-3 mt-4"
              >
                <Text className="text-white font-semibold">Crear mi primer negocio</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View className="px-5 py-4">
            {businesses.map((business) => (
              <View
                key={business.id}
                className="bg-[#F5F5F5] rounded-2xl p-4 mb-4 border border-[#E5E5E5]"
              >
                <View className="flex-row items-start mb-3">
                  <View className="bg-[#B5A78E] rounded-full p-3 mr-3">
                    <MaterialCommunityIcons
                      name={getFoodTypeIcon(business.foodType || 'Otro')}
                      size={28}
                      color="white"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-[#794646] mb-1">
                      {business.name}
                    </Text>
                    <View className="flex-row items-center">
                      <MaterialCommunityIcons
                        name="tag"
                        size={14}
                        color="#B5A78E"
                      />
                      <Text className="text-[#B5A78E] text-sm ml-1">
                        {business.foodType || 'Otro'}
                      </Text>
                    </View>
                  </View>
                </View>

                {business.description && (
                  <Text className="text-[#794646] mb-3" numberOfLines={2}>
                    {business.description}
                  </Text>
                )}

                <View className="mb-2">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="location" size={16} color="#794646" />
                    <Text className="text-[#794646] ml-2 flex-1">
                      {business.address}
                    </Text>
                  </View>

                  {business.latitude && business.longitude && (business.latitude !== 0 || business.longitude !== 0) && (
                    <View className="flex-row items-center">
                      <Ionicons name="navigate" size={16} color="#794646" />
                      <Text className="text-[#794646] ml-2 text-xs">
                        {business.latitude.toFixed(4)}, {business.longitude.toFixed(4)}
                      </Text>
                    </View>
                  )}
                </View>

                <View className="flex-row gap-2 mt-3 pt-3 border-t border-[#E5E5E5]">
                  <TouchableOpacity
                    onPress={() => Alert.alert('Ver detalles', business.name)}
                    className="flex-1 bg-[#B5A78E] rounded-lg py-2 items-center"
                  >
                    <Text className="text-white font-semibold">Ver</Text>
                  </TouchableOpacity>
                  {user?.role === 'BUSINESS' && (
                    <>
                      <TouchableOpacity
                        onPress={() => router.push({ pathname: '../business/edit', params: { id: business.id.toString() } })}
                        className="flex-1 bg-[#794646] rounded-lg py-2 items-center"
                      >
                        <Text className="text-white font-semibold">Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(business.id, business.name)}
                        className="bg-red-500 rounded-lg px-4 py-2 items-center"
                      >
                        <Ionicons name="trash" size={20} color="white" />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        <View className="h-32" />
      </ScrollView>
    </View>
  );
}