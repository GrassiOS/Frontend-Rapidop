import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from './LoadingScreen';
import { BusinessRouteProps } from '@/types/components';

/**
 * Componente para proteger rutas que solo deben ser accesibles para usuarios con rol BUSINESS
 */
export const BusinessRoute: React.FC<BusinessRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return <LoadingScreen message="Verificando permisos..." />;
  }

  // Si no hay usuario o el rol no es BUSINESS, mostrar pantalla de acceso denegado
  if (!user || user.role !== 'BUSINESS') {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="lock-closed" size={80} color="#794646" />
        <Text className="text-2xl font-bold text-[#794646] mt-6 text-center">
          Acceso Restringido
        </Text>
        <Text className="text-[#794646] mt-4 text-center opacity-70 leading-6">
          Solo los usuarios con rol BUSINESS pueden acceder a esta sección.
        </Text>
        <Text className="text-[#794646] mt-2 text-center opacity-70 text-sm">
          Rol actual: {user?.role || 'No autenticado'}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-[#B5A78E] rounded-lg py-3 px-8 mt-8"
        >
          <Text className="text-white text-lg font-semibold">Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return <>{children}</>;
};
