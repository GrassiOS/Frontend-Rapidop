import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { FlameLogoProps } from '@/types/components';

export const FlameLogo: React.FC<FlameLogoProps> = ({ size = 120 }) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        {/* Llama principal - forma de llama blanca más estilizada */}
        <Path
          d="M60 15 
             C45 10, 25 20, 25 45 
             C25 60, 35 75, 45 85 
             C50 90, 55 95, 60 100 
             C65 95, 70 90, 75 85 
             C85 75, 95 60, 95 45 
             C95 20, 75 10, 60 15 Z"
          fill="white"
          stroke="#b8aa91"
          strokeWidth="3"
        />
        
        {/* Cubierto izquierdo (cuchara) - más visible */}
        <Path
          d="M42 55 
             C38 52, 35 55, 35 62 
             C35 68, 38 72, 42 75 
             C46 78, 50 75, 50 68 
             C50 62, 46 58, 42 55 Z"
          fill="#4a4a4a"
        />
        
        {/* Mango de la cuchara */}
        <Rect
          x="45"
          y="75"
          width="5"
          height="18"
          fill="#4a4a4a"
          rx="2"
        />
        
        {/* Cubierto derecho (tenedor) - más visible */}
        <Path
          d="M78 55 
             C82 52, 85 55, 85 62 
             C85 68, 82 72, 78 75 
             C74 78, 70 75, 70 68 
             C70 62, 74 58, 78 55 Z"
          fill="#4a4a4a"
        />
        
        {/* Dientes del tenedor */}
        <Rect x="75" y="75" width="2" height="15" fill="#4a4a4a" />
        <Rect x="78" y="75" width="2" height="15" fill="#4a4a4a" />
        <Rect x="81" y="75" width="2" height="15" fill="#4a4a4a" />
        
        {/* Mango del tenedor */}
        <Rect
          x="74"
          y="90"
          width="10"
          height="18"
          fill="#4a4a4a"
          rx="2"
        />
      </Svg>
    </View>
  );
};
