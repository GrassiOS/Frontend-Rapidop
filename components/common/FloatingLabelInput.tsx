import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Text, Animated, Platform, TouchableOpacity } from 'react-native';
import { FloatingLabelInputProps } from '@/types/components';

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  error,
  onFocus,
  onBlur,
  rightIcon,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedIsFocused = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const labelStyle = {
    position: 'absolute' as const,
    left: 18,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [Platform.OS === 'android' ? 14 : 16, -10],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: ['#79464699', isFocused ? '#794646' : '#666'],
    }),
    backgroundColor: '#FFF',
    paddingHorizontal: 4,
    zIndex: 1,
  };

  return (
    <View style={{ marginBottom: error ? 4 : 18 }}>
      <View style={{ position: 'relative' }}>
        <Animated.Text style={labelStyle} pointerEvents="none">
          {label}
        </Animated.Text>
        <TextInput
          {...props}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor="#794646"
          style={{
            width: '100%',
            borderWidth: 1.2,
            borderColor: error ? '#EF4444' : isFocused ? '#794646' : '#D2C0C0',
            borderRadius: 12,
            paddingHorizontal: 18,
            paddingVertical: Platform.OS === 'android' ? 12 : 14,
            paddingRight: rightIcon ? 48 : 18,
            fontSize: 16,
            fontFamily: Platform.OS === 'android' ? 'Roboto' : 'System',
            color: '#000',
            backgroundColor: '#FFF',
            elevation: 2,
          }}
        />
        {rightIcon && (
          <View
            style={{
              position: 'absolute',
              right: 0,
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              paddingRight: 16,
            }}
          >
            {rightIcon}
          </View>
        )}
      </View>
      {error && (
        <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 8 }}>
          {error}
        </Text>
      )}
    </View>
  );
};