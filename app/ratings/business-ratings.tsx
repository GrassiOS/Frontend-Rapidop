import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRating } from '@/hooks/useRating';
import { StarRating, RatingList } from '@/components/ratings';
import { useAuth } from '@/contexts/AuthContext';
import type { RatingStats } from '@/types/rating';

/**
 * Pantalla para ver todas las calificaciones de un negocio
 * Recibe: businessId, businessName como parámetros de ruta
 */
export default function BusinessRatingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const businessId = parseInt(params.businessId as string);
  const businessName = params.businessName as string;

  const { getBusinessRatings, loading } = useRating();
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRatings();
  }, [businessId]);

  const loadRatings = async () => {
    const result = await getBusinessRatings(businessId);
    if (result) {
      setStats(result);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRatings();
    setRefreshing(false);
  };

  const handleRatePress = () => {
    router.push({
      pathname: '/ratings/rate-business',
      params: { businessId, businessName },
    });
  };

  const getRatingDistribution = () => {
    if (!stats || stats.ratings.length === 0) return {};

    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stats.ratings.forEach((rating) => {
      distribution[rating.score] = (distribution[rating.score] || 0) + 1;
    });

    return distribution;
  };

  const renderRatingBar = (stars: number, count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
      <View key={stars} style={styles.ratingBarContainer}>
        <Text style={styles.starLabel}>{stars}</Text>
        <Ionicons name="star" size={14} color="#FFD700" />
        <View style={styles.barBackground}>
          <View style={[styles.barFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.countLabel}>{count}</Text>
      </View>
    );
  };

  if (loading && !stats) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  const distribution = getRatingDistribution();

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Resumen */}
        <View style={styles.summaryCard}>
          <Text style={styles.businessName}>{businessName}</Text>

          <View style={styles.summaryContent}>
            <Text style={styles.averageNumber}>
              {stats?.averageRating?.toFixed(1) || '0.0'}
            </Text>
            <StarRating rating={stats?.averageRating || 0} size={28} disabled />
            <Text style={styles.totalText}>
              {stats?.totalRatings || 0}{' '}
              {stats?.totalRatings === 1 ? 'calificación' : 'calificaciones'}
            </Text>
          </View>

          {/* Distribución */}
          {stats && stats.totalRatings > 0 && (
            <View style={styles.distributionSection}>
              {[5, 4, 3, 2, 1].map((stars) =>
                renderRatingBar(stars, distribution[stars] || 0, stats.totalRatings)
              )}
            </View>
          )}

          {/* Botón para calificar */}
          {user?.role === 'CONSUMER' && (
            <TouchableOpacity style={styles.rateButton} onPress={handleRatePress}>
              <Ionicons name="star" size={20} color="#FFF" />
              <Text style={styles.rateButtonText}>Calificar este negocio</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Lista de calificaciones */}
        {stats && stats.ratings.length > 0 ? (
          <View style={styles.listSection}>
            <Text style={styles.listTitle}>Todas las calificaciones</Text>
            <RatingList
              ratings={stats.ratings}
              emptyMessage="No hay calificaciones disponibles"
            />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="star-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>
              Este negocio aún no tiene calificaciones
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  businessName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  averageNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 8,
  },
  totalText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  distributionSection: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 16,
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  starLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    width: 20,
  },
  barBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  countLabel: {
    fontSize: 12,
    color: '#666',
    width: 30,
    textAlign: 'right',
  },
  rateButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  rateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
});
