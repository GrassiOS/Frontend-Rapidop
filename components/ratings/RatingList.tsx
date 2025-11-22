import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StarRating } from './StarRating';
import { Ionicons } from '@expo/vector-icons';
import type { Rating } from '@/types/rating';

interface RatingListProps {
  ratings: Rating[];
  loading?: boolean;
  showDeleteButton?: boolean;
  onDeleteRating?: (ratingId: number) => void;
  emptyMessage?: string;
}

/**
 * Componente para mostrar una lista de calificaciones
 */
export const RatingList: React.FC<RatingListProps> = ({
  ratings,
  loading = false,
  showDeleteButton = false,
  onDeleteRating,
  emptyMessage = 'No hay calificaciones disponibles',
}) => {
  const handleDelete = (ratingId: number) => {
    Alert.alert(
      'Eliminar calificación',
      '¿Estás seguro de que deseas eliminar esta calificación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onDeleteRating?.(ratingId),
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const renderRatingItem = ({ item }: { item: Rating }) => (
    <View style={styles.ratingCard}>
      <View style={styles.ratingHeader}>
        <View style={styles.ratingInfo}>
          <StarRating rating={item.score} size={20} disabled />
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>
        {showDeleteButton && onDeleteRating && (
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="#DC3545" />
          </TouchableOpacity>
        )}
      </View>
      
      {item.comment && (
        <Text style={styles.commentText}>{item.comment}</Text>
      )}
    
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#794646" />
      </View>
    );
  }

  if (ratings.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="star-outline" size={64} color="#CCC" />
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={ratings}
      renderItem={renderRatingItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  ratingCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#794646',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  commentText: {
    fontSize: 14,
    color: '#794646',
    lineHeight: 20,
    marginBottom: 8,
  },
  ratingFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
    marginTop: 8,
  },
  targetTypeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 16,
    color: '#794646',
    opacity: 0.6,
    marginTop: 16,
    textAlign: 'center',
  },
});
