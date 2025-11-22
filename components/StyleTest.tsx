import React from 'react';
import { View, Text } from 'react-native';

const StyleTest = () => {
  return (
    <View className="p-4 bg-blue-500 m-4 rounded-lg">
      <Text className="text-white text-center font-bold text-xl">
        🎨 Test de Estilos
      </Text>
      <Text className="text-white text-center mt-2">
        Si ves este texto en blanco sobre fondo azul con bordes redondeados, ¡NativeWind funciona!
      </Text>
      <View className="bg-green-400 p-3 mt-3 rounded">
        <Text className="text-green-900 text-center font-semibold">
          ✅ Estilos funcionando correctamente
        </Text>
      </View>
    </View>
  );
};

export default StyleTest;