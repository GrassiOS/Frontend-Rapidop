import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessNotification } from '@/contexts/BusinessNotificationContext';
import { useCustomerNotification } from '@/contexts/CustomerNotificationContext';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { reservationService } from '@/services/reservationService';
import { businessService } from '@/services/businessService';
import { ReservationStatus } from '@/types/reservation';

const ProfileOption = ({ 
  icon, 
  name, 
  onPress, 
  iconColor, 
  textColor,
  badge 
}: { 
  icon: any; 
  name: string; 
  onPress?: () => void; 
  iconColor?: string; 
  textColor?: string;
  badge?: number;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center justify-between bg-white p-4 rounded-xl mb-3 shadow-sm border border-[#D2C0C0]"
  >
    <View className="flex-row items-center">
      <View className="relative">
        <MaterialIcons name={icon} size={24} color={iconColor || "#794646"} />
        {badge !== undefined && badge > 0 && (
          <View className="absolute -top-2 -right-2 bg-red-600 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
            <Text className="text-white text-[10px] font-bold">
              {badge > 99 ? '99+' : badge}
            </Text>
          </View>
        )}
      </View>
      <Text className={`text-base ml-4 font-medium ${textColor || 'text-[#794646]'}`}>{name}</Text>
    </View>
    <MaterialIcons name="chevron-right" size={24} color="#B5A78E" />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { pendingReservationsCount, refreshPendingCount } = useBusinessNotification();
  const { totalNotificationsCount, refreshNotifications } = useCustomerNotification();

  // Recargar cuando vuelve al foco
  useFocusEffect(
    React.useCallback(() => {
      if (user?.role === 'BUSINESS') {
        refreshPendingCount();
      } else if (user?.role === 'CONSUMER') {
        refreshNotifications();
      }
    }, [user, refreshPendingCount, refreshNotifications])
  );

  const handleLogout = () => {
    logout();
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FFFFFF]">
      <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="items-center mb-8">
          <View className="w-28 h-28 rounded-full bg-gradient-to-br from-[#B5A78E] to-[#794646] justify-center items-center shadow-lg mb-4">
            <Ionicons name="person" size={60} color="white" />
          </View>
          <Text className="text-2xl font-bold text-[#794646]">{user?.name || 'Usuario'}</Text>
          <Text className="text-base text-[#B5A78E]">{user?.email}</Text>
        </View>

        {/* Menu Options */}
        <View className="px-2 mb-6">
          <ProfileOption icon="account-circle" name="Editar Perfil" onPress={() => alert('Función no implementada')} />
          
          {/* Consumer Section - Solo para usuarios CONSUMER */}
          {user?.role === 'CONSUMER' && (
            <>
              <ProfileOption 
                icon="receipt-long" 
                name="Mis Reservas" 
                onPress={() => router.push('/reservations' as any)}
                iconColor="#794646"
                badge={totalNotificationsCount}
              />
            </>
          )}
                    
          {/* Business Section - Solo para usuarios BUSINESS */}
          {user?.role === 'BUSINESS' && (
            <>
              <ProfileOption 
                icon="store" 
                name="Mis Negocios" 
                onPress={() => router.push('/business/list')}
                iconColor="#B5A78E"
              />
              <ProfileOption 
                icon="restaurant-menu" 
                name="Mis Productos" 
                onPress={() => router.push('/products/list')}
                iconColor="#B5A78E"
              />
              <ProfileOption 
                icon="assignment" 
                name="Reservas del Negocio" 
                onPress={() => router.push('/business/reservations' as any)}
                iconColor="#B5A78E"
                badge={pendingReservationsCount}
              />
            </>
          )}
          
          <ProfileOption icon="settings" name="Configuración" onPress={() => alert('Función no implementada')} />
          <ProfileOption icon="help-outline" name="Centro de Ayuda" onPress={() => alert('Función no implementada')} />
        </View>

        {/* Logout Section */}
        <View className="mt-0 px-2">
          <ProfileOption 
            icon="logout" 
            name="Cerrar Sesión" 
            onPress={handleLogout}
            iconColor="#794646"
            textColor="text-[#794646]"
          />
        </View>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
