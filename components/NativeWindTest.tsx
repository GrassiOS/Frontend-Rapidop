import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const NativeWindTest: React.FC = () => {
  return (
    <View className="flex-1 bg-gradient-to-br from-blue-400 to-purple-600 items-center justify-center p-6">
      <View className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <Text className="text-3xl font-bold text-gray-800 text-center mb-4">
          🎨 NativeWind Test
        </Text>
        
        <Text className="text-gray-600 text-center mb-6">
          Si ves este diseño con colores y estilos, ¡NativeWind está funcionando correctamente!
        </Text>
        
        <TouchableOpacity className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 py-3 px-6 rounded-full mb-3">
          <Text className="text-white font-semibold text-center">
            Botón Azul
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="bg-green-500 hover:bg-green-600 active:bg-green-700 py-3 px-6 rounded-full mb-3">
          <Text className="text-white font-semibold text-center">
            Botón Verde
          </Text>
        </TouchableOpacity>
        
        <View className="flex-row justify-between mt-4">
          <View className="bg-red-100 p-3 rounded-lg flex-1 mr-2">
            <Text className="text-red-800 text-sm font-medium text-center">
              Flex & Colors
            </Text>
          </View>
          <View className="bg-yellow-100 p-3 rounded-lg flex-1 ml-2">
            <Text className="text-yellow-800 text-sm font-medium text-center">
              Working! ✅
            </Text>
          </View>
        </View>
        
        <View className="mt-6 border-t border-gray-200 pt-4">
          <Text className="text-xs text-gray-500 text-center">
            Clases utilizadas: flex, bg-*, text-*, rounded-*, shadow-*, p-*, m-*, etc.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default NativeWindTest;