import React, { useEffect, useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import AsyncStorage from '@react-native-async-storage/async-storage'; // esta libreria es para almacenamiento local
import { router } from 'expo-router';
import { businessService } from '@/services/businessService';
import { useAuth } from '@/contexts/AuthContext';

type Branch = {
  name: string;
  description?: string;
  address: string;
  foodType?: string;
};

const PENDING_KEY = 'pending_businesses';

export default function RegisterBusinessScreen() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [postRegister, setPostRegister] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(PENDING_KEY);
      if (raw) {
        try {
          setBranches(JSON.parse(raw));
        } catch {
          setBranches([]);
        }
      }
      const postFlag = await AsyncStorage.getItem('post_register');
      setPostRegister(postFlag === 'true');
    })();
  }, []);

  const savePending = async (list: Branch[]) => {
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(list));
  };

  const handleAdd = () =>
    setBranches((s) => {
      const next = [...s, { name: '', description: '', address: '', foodType: '' }];
      savePending(next);
      return next;
    });

  const handleRemove = (i: number) => {
    const next = branches.filter((_, idx) => idx !== i);
    setBranches(next);
    savePending(next);
  };

  const handleChange = (i: number, key: keyof Branch, value: string) => {
    const next = branches.map((b, idx) => (idx === i ? { ...b, [key]: value } : b));
    setBranches(next);
    savePending(next);
  };

  const handleSaveLocal = async () => {
    await savePending(branches);
    Alert.alert('Guardado', 'Negocios guardados localmente.');
    router.back();
  };

  const handlePostRegister = async () => {
    if (!user) {
      Alert.alert('No autenticado', 'Debes iniciar sesión para registrar negocios.');
      return;
    }
    if (branches.length === 0) {
      Alert.alert('Sin negocios', 'Agrega al menos un negocio.');
      return;
    }

    setIsLoading(true);
    try {
      for (const b of branches) {
        await businessService.createBusiness({
          name: b.name.trim(),
          description: b.description?.trim(),
          address: b.address.trim(),
          foodType: b.foodType?.trim(),
        });
      }
      await AsyncStorage.removeItem(PENDING_KEY);
      await AsyncStorage.removeItem('post_register');
      Alert.alert('Éxito', 'Negocios registrados correctamente.');
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al crear negocios');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#d6d6d6]">
      <ScrollView className="flex-1 px-6 py-8" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-lg p-6 shadow-lg">
          <Text className="text-2xl font-bold text-center mb-4">Registrar Negocios</Text>

          <View className="space-y-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-base">Sucursales</Text>
              <Button title="Agregar" onPress={handleAdd} />
            </View>

            {branches.map((b, i) => (
              <View key={i} className="bg-gray-50 p-3 rounded-md mb-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-medium">Sucursal #{i + 1}</Text>
                  <Button title="Eliminar" variant="secondary" onPress={() => handleRemove(i)} />
                </View>

                <Input label="Nombre" value={b.name} onChangeText={(val) => handleChange(i, 'name', val)} placeholder="Nombre del negocio" />
                <Input label="Descripción (opcional)" value={b.description} onChangeText={(val) => handleChange(i, 'description', val)} placeholder="Descripción" />
                <Input label="Dirección" value={b.address} onChangeText={(val) => handleChange(i, 'address', val)} placeholder="Dirección" />
                <Input label="Tipo de comida (opcional)" value={b.foodType} onChangeText={(val) => handleChange(i, 'foodType', val)} placeholder="Ej: Mexicana" />
              </View>
            ))}

            {!postRegister ? (
              <>
                <Button title="Guardar y volver" onPress={handleSaveLocal} />
                <Button title="Cancelar" variant="secondary" onPress={() => router.back()} />
              </>
            ) : (
              <>
                <Button title={isLoading ? 'Registrando...' : 'Registrar negocios'} onPress={handlePostRegister} disabled={isLoading} />
                <Button title="Omitir" variant="secondary" onPress={() => { AsyncStorage.removeItem('post_register'); router.replace('/(tabs)'); }} disabled={isLoading} />
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
