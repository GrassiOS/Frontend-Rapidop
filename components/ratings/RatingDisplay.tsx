import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { StarRating } from './StarRating';
import { RatingList } from './RatingList';
import { RatingForm } from './RatingForm';
import { useRating } from '@/hooks/useRating';
import { Ionicons } from '@expo/vector-icons';
import type { RatingStats } from '@/types/rating';

interface RatingDisplayProps {
  targetType: 'business' | 'consumer';
  targetId: number;
  targetName?: string;
  showRateButton?: boolean;
  allowRating?: boolean;
}

/**
 * Componente completo para mostrar y gestionar calificaciones
 * Muestra el promedio, total de calificaciones y lista de reviews
 */
export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  targetType,
  targetId,
  targetName,
  showRateButton = true,
  allowRating = true,
}) => {
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [showAllRatings, setShowAllRatings] = useState(false);
  const { getBusinessRatings, getConsumerRatings, loading } = useRating();

  useEffect(() => {
    loadRatings();
  }, [targetId, targetType]);

  const loadRatings = async () => {
    const result =
      targetType === 'business'
        ? await getBusinessRatings(targetId)
        : await getConsumerRatings(targetId);

    if (result) {
      setStats(result);
    }
  };

  const handleRatingSuccess = () => {
    setShowRatingForm(false);
    loadRatings();
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se pudieron cargar las calificaciones</Text>
      </View>
    );
  }

  const distribution = getRatingDistribution();

  return (
    <View style={styles.container}>
      {/* Summary Section */}
      <View style={styles.summaryContainer}>
        <View style={styles.averageSection}>
          <Text style={styles.averageNumber}>
            {stats.averageRating.toFixed(1)}
          </Text>
          <StarRating rating={stats.averageRating} size={24} disabled />
          <Text style={styles.totalRatingsText}>
            {stats.totalRatings} {stats.totalRatings === 1 ? 'calificación' : 'calificaciones'}
          </Text>
        </View>

        {stats.totalRatings > 0 && (
          <View style={styles.distributionSection}>
            {[5, 4, 3, 2, 1].map((stars) =>
              renderRatingBar(stars, distribution[stars] || 0, stats.totalRatings)
            )}
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonSection}>
        {showRateButton && allowRating && (
          <TouchableOpacity
            style={styles.rateButton}
            onPress={() => setShowRatingForm(true)}
          >
            <Ionicons name="star" size={20} color="#FFF" />
            <Text style={styles.rateButtonText}>Calificar</Text>
          </TouchableOpacity>
        )}

        {stats.totalRatings > 0 && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => setShowAllRatings(true)}
          >
            <Text style={styles.viewAllButtonText}>
              Ver todas las calificaciones
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Recent Ratings Preview */}
      {stats.ratings.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Calificaciones recientes</Text>
          <RatingList
            ratings={stats.ratings.slice(0, 3)}
            emptyMessage="No hay calificaciones"
          />
        </View>
      )}

      {/* Rating Form Modal */}
      <Modal
        visible={showRatingForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRatingForm(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nueva Calificación</Text>
            <TouchableOpacity onPress={() => setShowRatingForm(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            <RatingForm
              targetType={targetType}
              targetId={targetId}
              targetName={targetName}
              onSuccess={handleRatingSuccess}
              onCancel={() => setShowRatingForm(false)}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* All Ratings Modal */}
      <Modal
        visible={showAllRatings}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAllRatings(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Todas las Calificaciones</Text>
            <TouchableOpacity onPress={() => setShowAllRatings(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>
          <RatingList
            ratings={stats.ratings}
            emptyMessage="No hay calificaciones disponibles"
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContainer: {
    marginBottom: 16,
  },
  averageSection: {
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 16,
  },
  averageNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  totalRatingsText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  distributionSection: {
    paddingHorizontal: 8,
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
  buttonSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  rateButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    paddingHorizontal: 16,
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
  viewAllButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  viewAllButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  recentSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    padding: 32,
  },
});
