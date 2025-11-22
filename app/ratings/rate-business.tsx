import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { RatingForm } from '@/components/ratings';

/**
 * Pantalla para calificar un negocio
 * Recibe: businessId, businessName como parámetros de ruta
 */
export default function RateBusinessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const businessId = parseInt(params.businessId as string);
  const businessName = params.businessName as string;

  const handleSuccess = () => {
    Alert.alert(
      'Éxito',
      'Calificación enviada correctamente',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <RatingForm
          targetType="business"
          targetId={businessId}
          targetName={businessName}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  content: {
    padding: 16,
  },
});
