import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TouchableNativeFeedback,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  Dimensions,
  StyleSheet,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FloatingLabelInput } from "@/components/common/FloatingLabelInput";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { login } = useAuth();

  const pulse = useSharedValue(1);
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.03, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );

    fadeIn.value = withTiming(1, { duration: 500 });

    return () => {
      cancelAnimation(pulse);
      cancelAnimation(fadeIn);
    };
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const fadeInStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  const validateInputs = (): boolean => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Campos incompletos", "Por favor ingresa tu correo y contraseña.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Correo inválido", "Por favor ingresa un correo electrónico válido.");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("Contraseña demasiado corta", "Debe tener al menos 6 caracteres.");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;
    setIsLoading(true);

    try {
      await login(email.trim(), password);
      //Alert.alert("Inicio exitoso", "🔥 Bienvenido a ReadyToGo 🔥");
      router.replace("/(tabs)");
    } catch (error) {
      console.error('❌ Login error:', error);
      Alert.alert(
        "Error de inicio de sesión",
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado. Verifica tus credenciales e inténtalo nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const ButtonWrapper = Platform.OS === "android" ? TouchableNativeFeedback : TouchableOpacity;

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      {/* Blur para el área superior (status bar) */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top, zIndex: 10 }}>
        <BlurView intensity={80} tint="light" style={{ flex: 1 }} />
      </View>
      
      {/* Blur para el área inferior */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: insets.bottom, zIndex: 10 }}>
        <BlurView intensity={80} tint="light" style={{ flex: 1 }} />
      </View>

      <SafeAreaView className="flex-1" edges={[]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          className="flex-1"
        >
          <ScrollView
            keyboardShouldPersistTaps="always"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 24,
              paddingTop: 120,
              paddingBottom: 0,
            }}
          >
            <Pressable onPress={Keyboard.dismiss}>
              <Animated.View
                style={[fadeInStyle]}
                className="bg-white rounded-3xl p-8"
              >
                {/* Logo */}
                <View className="items-center mb-10 mt-4">
                  <Animated.View
                    style={[logoStyle]}
                    className="w-48 h-48 items-center justify-center mb-4 rounded-3xl"
                  >
                    <LinearGradient
                      colors={["#B5A78E", "#794646"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        borderRadius: 24,
                        elevation: 3,
                      }}
                    />
                    <Image
                      source={require("../../assets/images/logo.png")}
                      style={{
                        width: 160,
                        height: 160,
                        borderRadius: 24,
                      }}
                      resizeMode="contain"
                      fadeDuration={0}
                    />
                  </Animated.View>

                  <Animated.Text
                    style={{
                      fontSize: 32,
                      fontWeight: "bold",
                      color: "#000",
                      fontStyle: "italic",
                    }}
                  >
                    ReadyToGo
                  </Animated.Text>
                </View>

                {/* Input correo */}
                <FloatingLabelInput
                  label="Correo electrónico"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />

                {/* Input contraseña */}
                <FloatingLabelInput
                  label="Contraseña"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  onSubmitEditing={handleLogin}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <EyeOff color="#794646" size={20} />
                      ) : (
                        <Eye color="#794646" size={20} />
                      )}
                    </TouchableOpacity>
                  }
                />

                {/* Botón de inicio */}
                <View style={{ marginTop: 24, borderRadius: 16, overflow: "hidden" }}>
                  <ButtonWrapper onPress={handleLogin} disabled={isLoading}>
                    <LinearGradient
                      colors={
                        isLoading
                          ? ["#B5A78E99", "#B5A78E99"]
                          : ["#B5A78E", "#794646"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: "100%",
                        borderRadius: 16,
                        paddingVertical: 16,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#000",
                          fontWeight: "600",
                          fontSize: 16,
                        }}
                      >
                        {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                      </Text>
                    </LinearGradient>
                  </ButtonWrapper>
                </View>

                {/* Botón registro */}
                <TouchableOpacity
                  onPress={() => router.push("/auth/register")}
                  disabled={isLoading}
                  style={{
                    marginTop: 14,
                    backgroundColor: "#D2C0C0",
                    borderRadius: 16,
                    paddingVertical: 14,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={{
                      color: "#000",
                      fontWeight: "600",
                      fontSize: 15,
                    }}
                  >
                    ¿No tienes cuenta? Regístrate aquí
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
