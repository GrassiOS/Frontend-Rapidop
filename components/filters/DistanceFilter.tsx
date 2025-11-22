import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DistanceFilterProps {
  distance: number;
  onDistanceChange: (distance: number) => void;
  visible: boolean;
  onToggle: () => void;
}

const DISTANCE_OPTIONS = [
  { value: 1, label: '1 km' },
  { value: 2, label: '2 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: 'Sin límite' },
];

export default function DistanceFilter({ distance, onDistanceChange, visible, onToggle }: DistanceFilterProps) {
  return (
    <View className="px-5 mb-4">
      {/* Toggle Button */}
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row items-center justify-between bg-white border-2 border-[#D2C0C0] rounded-2xl px-4 py-3 shadow-sm"
      >
        <View className="flex-row items-center">
          <Ionicons name="location" size={22} color="#794646" />
          <Text className="ml-2 text-[#794646] font-semibold">
            Radio: {distance >= 100 ? 'Sin límite' : `${distance} km`}
          </Text>
        </View>
        <Ionicons 
          name={visible ? "chevron-up" : "chevron-down"} 
          size={22} 
          color="#794646" 
        />
      </TouchableOpacity>

      {/* Distance Options */}
      {visible && (
        <View className="bg-white border-2 border-[#D2C0C0] rounded-2xl mt-2 p-4 shadow-sm">
          <Text className="text-sm text-gray-600 mb-3">
            Selecciona el radio de búsqueda desde tu ubicación:
          </Text>
          
          {/* Quick Options */}
          <View className="flex-row flex-wrap">
            {DISTANCE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => onDistanceChange(option.value)}
                className={`mr-2 mb-2 px-4 py-2 rounded-full ${
                  distance === option.value 
                    ? 'bg-[#B5A78E]' 
                    : 'bg-[#EBE5EB]'
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    distance === option.value ? 'text-white' : 'text-[#794646]'
                  }`}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
