import React, { createContext, useContext, useState, useCallback } from 'react';
import { Modal, View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const showNotification = useCallback((notif: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notif, id };
    
    setNotification(newNotification);
    
    // Animación de entrada
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto-cerrar después de la duración especificada
    const duration = notif.duration || 5000;
    setTimeout(() => {
      hideNotification();
    }, duration);
  }, []);

  const hideNotification = useCallback(() => {
    // Animación de salida
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setNotification(null);
    });
  }, []);

  const getIconName = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      case 'info':
        return 'information-circle';
      default:
        return 'notifications';
    }
  };

  const getColors = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return { bg: '#4CAF50', border: '#45a049' };
      case 'error':
        return { bg: '#f44336', border: '#da190b' };
      case 'warning':
        return { bg: '#ff9800', border: '#e68900' };
      case 'info':
        return { bg: '#2196F3', border: '#0b7dda' };
      default:
        return { bg: '#B5A78E', border: '#9a8976' };
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      
      {/* Modal de Notificación */}
      <Modal
        visible={!!notification}
        transparent={true}
        animationType="none"
        onRequestClose={hideNotification}
      >
        <View className="flex-1 justify-start items-center pt-16">
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
              ],
            }}
            className="bg-white rounded-2xl shadow-2xl mx-5 overflow-hidden"
          >
            {notification && (
              <View
                style={{
                  backgroundColor: getColors(notification.type).bg,
                  borderColor: getColors(notification.type).border,
                }}
                className="border-b-2"
              >
                <View className="p-4 flex-row items-center">
                  <View className="mr-3">
                    <Ionicons
                      name={getIconName(notification.type) as any}
                      size={32}
                      color="#FFFFFF"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-lg font-bold mb-1">
                      {notification.title}
                    </Text>
                    <Text className="text-white text-sm opacity-90">
                      {notification.message}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={hideNotification} className="ml-2">
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
