import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Keyboard,
  Image,
  Dimensions,
  TouchableNativeFeedback,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
  Layout,
  FadeOut,
  FadeIn,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Eye, EyeOff, User, Briefcase } from "lucide-react-native";
import { FloatingLabelInput } from "@/components/common/FloatingLabelInput";

const { width } = Dimensions.get("window");

// Componente para mostrar errores de validación
const ValidationError = ({ message }: { message: string | null }) => {
  if (!message) return null;
  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <Text className="text-red-500 text-xs mt-1 ml-2">{message}</Text>
    </Animated.View>
  );
};

// Componente para un solo requisito de contraseña con animación de salida
const RequirementItem = ({ text, met }: { text: string; met: boolean }) => {
  if (met) return null;

  return (
    <Animated.View exiting={FadeOut.duration(400)}>
      <Text className="text-sm text-gray-500">{text}</Text>
    </Animated.View>
  );
};

const PasswordStrengthIndicator = ({ checks }: { checks: any }) => {
  if (Object.values(checks).every(Boolean)) return null;

  return (
    <Animated.View
      layout={Layout.springify()}
      className=" mb-4 p-3 bg-gray-100 rounded-lg space-y-1"
    >
      <RequirementItem text="* Mínimo 8 caracteres" met={checks.length} />
      <RequirementItem text="* Una letra mayúscula" met={checks.uppercase} />
      <RequirementItem text="* Una letra minúscula" met={checks.lowercase} />
      <RequirementItem text="* Un número" met={checks.number} />
      <RequirementItem
        text="* Un carácter especial (!@#...)"
        met={checks.special}
      />
      {!checks.noPattern && (
        <Animated.View exiting={FadeOut.duration(400)}>
          <Text className="text-sm text-red-500">Sin patrones comunes</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
};

// Componente para seleccionar el rol
const RoleSelector = ({
  selectedRole,
  onSelectRole,
}: {
  selectedRole: string | null;
  onSelectRole: (role: string) => void;
}) => {
  return (
    <View className="mb-6">
      <Text className="text-base font-semibold mb-3 text-gray-700">
        ¿Cómo deseas usar ReadyToGo?
      </Text>
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={() => onSelectRole("CONSUMER")}
          className="flex-1"
          activeOpacity={0.7}
        >
          <View
            style={{
              borderWidth: 2,
              borderColor: selectedRole === "CONSUMER" ? "#794646" : "#D2C0C0",
              borderRadius: 12,
              padding: 16,
              backgroundColor: selectedRole === "CONSUMER" ? "#79464610" : "#FFF",
              alignItems: "center",
            }}
          >
            <User
              size={32}
              color={selectedRole === "CONSUMER" ? "#794646" : "#79464699"}
            />
            <Text
              style={{
                marginTop: 8,
                fontSize: 14,
                fontWeight: "600",
                color: selectedRole === "CONSUMER" ? "#794646" : "#666",
              }}
            >
              Cliente
            </Text>

          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onSelectRole("BUSINESS")}
          className="flex-1"
          activeOpacity={0.7}
        >
          <View
            style={{
              borderWidth: 2,
              borderColor: selectedRole === "BUSINESS" ? "#794646" : "#D2C0C0",
              borderRadius: 12,
              padding: 16,
              backgroundColor: selectedRole === "BUSINESS" ? "#79464610" : "#FFF",
              alignItems: "center",
            }}
          >
            <Briefcase
              size={32}
              color={selectedRole === "BUSINESS" ? "#794646" : "#79464699"}
            />
            <Text
              style={{
                marginTop: 8,
                fontSize: 14,
                fontWeight: "600",
                color: selectedRole === "BUSINESS" ? "#794646" : "#666",
              }}
            >
              Negocio
            </Text>

          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    noPattern: true,
  });

  const { register } = useAuth();

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
  const fadeInStyle = useAnimatedStyle(() => ({ opacity: fadeIn.value }));

  const validateName = () => {
    if (name.trim().length < 3) {
      setNameError("El nombre debe tener al menos 3 caracteres.");
      return false;
    }
    setNameError(null);
    return true;
  };

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError("Por favor, introduce un correo electrónico válido.");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePhone = () => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.trim())) {
      setPhoneError("El teléfono debe tener 10 dígitos.");
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const validateRole = () => {
    if (!role) {
      setRoleError("Por favor, selecciona un tipo de cuenta.");
      return false;
    }
    setRoleError(null);
    return true;
  };

  const validateConfirmPassword = () => {
    if (password && confirmPassword !== password) {
      setConfirmPasswordError("Las contraseñas no coinciden.");
      return false;
    }
    setConfirmPasswordError(null);
    return true;
  };

  const validatePasswordRealtime = (pass: string) => {
    const commonPatterns = ["1234", "abcd", "password", "qwerty", "asdf"];
    const checks = {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /\d/.test(pass),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
      noPattern: !commonPatterns.some((p) => pass.toLowerCase().includes(p)),
    };
    setPasswordChecks(checks);
    if (confirmPassword) {
      if (pass === confirmPassword) {
        setConfirmPasswordError(null);
      } else {
        setConfirmPasswordError("Las contraseñas no coinciden.");
      }
    }
    return Object.values(checks).every(Boolean);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    validatePasswordRealtime(text);
  };

  const handleRegister = async () => {
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPhoneValid = validatePhone();
    const isRoleValid = validateRole();
    const isPasswordStrong = validatePasswordRealtime(password);
    const doPasswordsMatch = validateConfirmPassword();

    if (
      !isNameValid ||
      !isEmailValid ||
      !isPhoneValid ||
      !isRoleValid ||
      !isPasswordStrong ||
      !doPasswordsMatch
    ) {
      Alert.alert(
        "Campos inválidos",
        "Por favor, corrige los errores antes de continuar."
      );
      return;
    }

    setIsLoading(true);
    try {
      await register(email.trim(), password, name.trim(), phone.trim(), role!);
      Alert.alert("Registro exitoso", "Bienvenido a ReadyToGo");
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "❌ Error",
        error instanceof Error ? error.message : "Ocurrió un error inesperado."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const ButtonWrapper =
    Platform.OS === "android" ? TouchableNativeFeedback : TouchableOpacity;

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <SafeAreaView className="flex-1" edges={['left', 'right']}>
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
              paddingTop: 40,
              paddingBottom: 40,
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
                    renderToHardwareTextureAndroid
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
                      style={{ width: 160, height: 160, borderRadius: 24 }}
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

                {/* Campo Nombre */}
                <FloatingLabelInput
                  label="Nombre completo"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (nameError) setNameError(null);
                  }}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => {
                    setNameFocused(false);
                    validateName();
                  }}
                  error={nameError}
                />

                {/* Campo Email */}
                <FloatingLabelInput
                  label="Correo electrónico"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => {
                    setEmailFocused(false);
                    validateEmail();
                  }}
                  error={emailError}
                />

                {/* Campo Teléfono */}
                <FloatingLabelInput
                  label="Teléfono (10 dígitos)"
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    if (phoneError) setPhoneError(null);
                  }}
                  keyboardType="phone-pad"
                  maxLength={10}
                  onFocus={() => setPhoneFocused(true)}
                  onBlur={() => {
                    setPhoneFocused(false);
                    validatePhone();
                  }}
                  error={phoneError}
                />

                {/* Campo Contraseña */}
                <View className="mb-0">
                  <FloatingLabelInput
                    label="Contraseña"
                    value={password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
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
                </View>

                {passwordFocused && (
                  <PasswordStrengthIndicator checks={passwordChecks} />
                )}

                {/* Campo Confirmar Contraseña */}
                <View className="mt-0">
                  <FloatingLabelInput
                    label="Confirmar contraseña"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (confirmPasswordError) validateConfirmPassword();
                    }}
                    secureTextEntry={!showConfirm}
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => {
                      setConfirmPasswordFocused(false);
                      validateConfirmPassword();
                    }}
                    error={confirmPasswordError}
                    rightIcon={
                      <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                        {showConfirm ? (
                          <EyeOff color="#794646" size={20} />
                        ) : (
                          <Eye color="#794646" size={20} />
                        )}
                      </TouchableOpacity>
                    }
                  />
                </View>

                {/* Selector de Rol - AHORA DESPUÉS DE LAS CONTRASEÑAS */}
                <View className="mt-2">
                  <RoleSelector
                    selectedRole={role}
                    onSelectRole={(selectedRole) => {
                      setRole(selectedRole);
                      if (roleError) setRoleError(null);
                    }}
                  />
                  <ValidationError message={roleError} />
                </View>

                {/* Botón Registrarse */}
                <View
                  style={{
                    marginTop: 4,
                    borderRadius: 16,
                    overflow: "hidden",
                  }}
                >
                  <ButtonWrapper onPress={handleRegister} disabled={isLoading}>
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
                        {isLoading ? "Creando cuenta..." : "Registrarse"}
                      </Text>
                    </LinearGradient>
                  </ButtonWrapper>
                </View>

                {/* Botón Ya tienes cuenta */}
                <TouchableOpacity
                  onPress={() => router.push("/auth/login")}
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
                    style={{ color: "#000", fontWeight: "600", fontSize: 15 }}
                  >
                    ¿Ya tienes cuenta? Inicia sesión
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