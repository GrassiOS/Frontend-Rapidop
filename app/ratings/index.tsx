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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRating } from '@/hooks/useRating';
import { StarRating, RatingList } from '@/components/ratings';
import { useAuth } from '@/contexts/AuthContext';
import type { RatingStats } from '@/types/rating';

/**
 * Pantalla principal de calificaciones
 * Muestra las calificaciones recibidas y dadas por el usuario
 */
export default function RatingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { getMyReceivedRatings, getMyGivenRatings, loading } = useRating();
  const [receivedStats, setReceivedStats] = useState<RatingStats | null>(null);
  const [givenRatings, setGivenRatings] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'received' | 'given'>('received');

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    const [received, given] = await Promise.all([
      getMyReceivedRatings(),
      getMyGivenRatings(),
    ]);

    if (received) setReceivedStats(received);
    if (given) setGivenRatings(given);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRatings();
    setRefreshing(false);
  };

  if (loading && !receivedStats) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.activeTab]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
            Recibidas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'given' && styles.activeTab]}
          onPress={() => setActiveTab('given')}
        >
          <Text style={[styles.tabText, activeTab === 'given' && styles.activeTabText]}>
            Dadas
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'received' ? (
          <>
            {/* Resumen de calificaciones recibidas */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Mis Calificaciones</Text>
              <View style={styles.summaryContent}>
                <Text style={styles.averageNumber}>
                  {receivedStats?.averageRating?.toFixed(1) || '0.0'}
                </Text>
                <StarRating
                  rating={receivedStats?.averageRating || 0}
                  size={28}
                  disabled
                />
                <Text style={styles.totalText}>
                  {receivedStats?.totalRatings || 0} calificaciones
                </Text>
              </View>
            </View>

            {/* Lista de calificaciones recibidas */}
            {receivedStats && receivedStats.ratings.length > 0 ? (
              <View style={styles.listContainer}>
                <RatingList
                  ratings={receivedStats.ratings}
                  emptyMessage="No has recibido calificaciones"
                />
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="star-outline" size={64} color="#CCC" />
                <Text style={styles.emptyText}>
                  Aún no has recibido calificaciones
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Lista de calificaciones dadas */}
            <View style={styles.givenHeader}>
              <Text style={styles.givenTitle}>
                Calificaciones que has dado ({givenRatings.length})
              </Text>
            </View>

            {givenRatings.length > 0 ? (
              <View style={styles.listContainer}>
                <RatingList
                  ratings={givenRatings}
                  emptyMessage="No has dado calificaciones"
                />
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="star-outline" size={64} color="#CCC" />
                <Text style={styles.emptyText}>
                  No has dado calificaciones
                </Text>
              </View>
            )}
          </>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF6B35',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#FF6B35',
  },
  content: {
    flex: 1,
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
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryContent: {
    alignItems: 'center',
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
  listContainer: {
    paddingHorizontal: 16,
  },
  givenHeader: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  givenTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
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
