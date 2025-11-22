import { Stack } from 'expo-router';

export default function RatingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Mis Calificaciones',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="rate-business"
        options={{
          title: 'Calificar Negocio',
          headerShown: true,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="rate-consumer"
        options={{
          title: 'Calificar Cliente',
          headerShown: true,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="business-ratings"
        options={{
          title: 'Calificaciones del Negocio',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="my-ratings"
        options={{
          title: 'Mis Calificaciones',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
