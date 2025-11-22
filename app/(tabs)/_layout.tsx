import React from "react";
import { Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { View, Text } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessNotification } from "@/contexts/BusinessNotificationContext";
import { useCustomerNotification } from "@/contexts/CustomerNotificationContext";

export default function TabLayout() {
  const { user } = useAuth();
  const { pendingReservationsCount } = useBusinessNotification();
  const { totalNotificationsCount } = useCustomerNotification();

  // Mostrar badge dependiendo del rol
  const showBusinessBadge = user?.role === 'BUSINESS' && pendingReservationsCount > 0;
  const showCustomerBadge = user?.role === 'CONSUMER' && totalNotificationsCount > 0;
  const badgeCount = user?.role === 'BUSINESS' ? pendingReservationsCount : totalNotificationsCount;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#794646",
        tabBarInactiveTintColor: "#B5A78E",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#D2C0C0",
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 0,
          marginBottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="map-marker" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => (
            <View>
              <FontAwesome size={28} name="user" color={color} />
              {(showBusinessBadge || showCustomerBadge) && (
                <View
                  style={{
                    position: 'absolute',
                    right: -6,
                    top: -3,
                    backgroundColor: '#DC2626',
                    borderRadius: 10,
                    width: 20,
                    height: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: '#FFFFFF',
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
