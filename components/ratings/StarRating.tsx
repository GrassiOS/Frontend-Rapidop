import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  color?: string;
  emptyColor?: string;
  onRatingChange?: (rating: number) => void;
  disabled?: boolean;
}

/**
 * Componente de calificación por estrellas
 * Puede ser usado de forma interactiva (para calificar) o solo lectura (para mostrar)
 */
export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 24,
  color = '#FFD700',
  emptyColor = '#D3D3D3',
  onRatingChange,
  disabled = false,
}) => {
  const isInteractive = !disabled && onRatingChange !== undefined;

  const handleStarPress = (starIndex: number) => {
    if (isInteractive && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  const renderStar = (index: number) => {
    const starNumber = index + 1;
    const isFilled = starNumber <= rating;
    const isHalfFilled = starNumber - 0.5 === rating;

    const starName = isFilled
      ? 'star'
      : isHalfFilled
      ? 'star-half'
      : 'star-outline';

    const StarComponent = isInteractive ? TouchableOpacity : View;

    return (
      <StarComponent
        key={index}
        onPress={() => handleStarPress(index)}
        disabled={!isInteractive}
        style={styles.starContainer}
        activeOpacity={0.7}
      >
        <Ionicons
          name={starName}
          size={size}
          color={isFilled || isHalfFilled ? color : emptyColor}
        />
      </StarComponent>
    );
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: maxStars }, (_, index) => renderStar(index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    marginHorizontal: 2,
  },
});
