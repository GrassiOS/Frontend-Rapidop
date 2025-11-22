// Ejemplo de uso del sistema de autenticación
// Este archivo es solo para referencia, no se incluye en la build

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

// Ejemplo 1: Usar el hook useAuth en un componente
export function ExampleAuthComponent() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();

  const handleLogin = async () => {
    const success = await login('usuario@ejemplo.com', 'password123');
    if (success) {
    } else {
}
  };

  return (
    <View style={styles.container}>
      <Text>Usuario: {user?.name || 'No autenticado'}</Text>
      <Text>Email: {user?.email || 'N/A'}</Text>
      <Text>Autenticado: {isAuthenticated ? 'Sí' : 'No'}</Text>
      
      {isAuthenticated ? (
        <Button title="Cerrar Sesión" onPress={logout} />
      ) : (
        <Button title="Iniciar Sesión" onPress={handleLogin} />
      )}
    </View>
  );
}

// Ejemplo 2: Proteger una pantalla completa
export function ProtectedScreen() {
  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <Text>Esta pantalla solo es visible para usuarios autenticados</Text>
      </View>
    </ProtectedRoute>
  );
}

// Ejemplo 3: Formulario de login personalizado
export function CustomLoginForm() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = async () => {
    const success = await login(email, password);
    if (!success) {
      alert('Credenciales inválidas');
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <Input
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Button
        title="Iniciar Sesión"
        onPress={handleSubmit}
        loading={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
});
