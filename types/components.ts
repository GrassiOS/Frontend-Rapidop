import { ViewStyle, TextStyle, TextInputProps } from 'react-native';

// Button component props
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// Input component props
export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  disabled?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

// FloatingLabelInput component props
export interface FloatingLabelInputProps extends TextInputProps {
  label: string;
  value: string;
  error?: string | null;
  onFocus?: () => void;
  onBlur?: () => void;
  rightIcon?: React.ReactNode;
}

// LoadingScreen component props
export interface LoadingScreenProps {
  message?: string;
}

// ProtectedRoute component props
export interface ProtectedRouteProps {
  children: React.ReactNode;
}

// BusinessRoute component props
export interface BusinessRouteProps {
  children: React.ReactNode;
}

// FlameLogo component props
export interface FlameLogoProps {
  size?: number;
}

// LocationPicker component props
export interface LocationPickerProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}
