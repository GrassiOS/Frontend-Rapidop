import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StarRating } from './StarRating';
import { useRating } from '@/hooks/useRating';
import type { RateBusinessInput, RateConsumerInput } from '@/types/rating';

interface RatingFormProps {
  targetType: 'business' | 'consumer';
  targetId: number;
  targetName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialRating?: number;
  initialComment?: string;
}

/**
 * Formulario para calificar un negocio o consumidor
 */
export const RatingForm: React.FC<RatingFormProps> = ({
  targetType,
  targetId,
  targetName,
  onSuccess,
  onCancel,
  initialRating = 0,
  initialComment = '',
}) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const { rateBusiness, rateConsumer, loading, error } = useRating();

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Por favor selecciona una calificación');
      return;
    }

    try {
      let result;
      if (targetType === 'business') {
        const input: RateBusinessInput = {
          businessId: targetId,
          score: rating,
          comment: comment.trim() || undefined,
        };
        result = await rateBusiness(input);
      } else {
        const input: RateConsumerInput = {
          consumerUserId: targetId,
          score: rating,
          comment: comment.trim() || undefined,
        };
        result = await rateConsumer(input);
      }

      if (result) {
        Alert.alert('Éxito', 'Calificación enviada correctamente');
        if (onSuccess) {
          onSuccess();
        }
      } else if (error) {
        Alert.alert('Error', error);
      }
    } catch (err) {
      Alert.alert('Error', 'Ocurrió un error al enviar la calificación');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Calificar {targetType === 'business' ? 'Negocio' : 'Cliente'}
      </Text>
      
      {targetName && (
        <Text style={styles.targetName}>{targetName}</Text>
      )}

      <View style={styles.ratingSection}>
        <Text style={styles.label}>Tu calificación:</Text>
        <StarRating
          rating={rating}
          onRatingChange={setRating}
          size={36}
          color="#FFD700"
          emptyColor="#D3D3D3"
        />
        <Text style={styles.ratingText}>
          {rating > 0 ? `${rating} de 5 estrellas` : 'Selecciona una calificación'}
        </Text>
      </View>

      <View style={styles.commentSection}>
        <Text style={styles.label}>Comentario (opcional):</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Escribe tu comentario aquí..."
          placeholderTextColor="#999"
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
          maxLength={500}
          editable={!loading}
        />
        <Text style={styles.characterCount}>{comment.length}/500</Text>
      </View>

      <View style={styles.buttonContainer}>
        {onCancel && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
          disabled={loading || rating === 0}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Enviar Calificación</Text>
          )}
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#794646',
    marginBottom: 8,
    textAlign: 'center',
  },
  targetName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#794646',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  commentSection: {
    marginBottom: 24,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#ff6b35',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  errorText: {
    fontSize: 14,
    color: '#ff6b35',
    marginTop: 12,
    textAlign: 'center',
  },
});
