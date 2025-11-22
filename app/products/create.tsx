import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useProduct } from '@/hooks/useProduct';
import { useBusiness } from '@/hooks/useBusiness';
import { ProductInput } from '@/services/productService';
import { Business } from '@/services/businessService';
import { apolloClient } from '@/lib/apollo';
import { GET_CATEGORIES } from '@/graphql/queries';
import { Category } from '@/types/product';

export default function CreateProductScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { createProduct, updateProduct, getProductsByBusiness, loading, error } = useProduct();
  const { getBusinesses } = useBusiness();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [productId, setProductId] = useState<number | null>(null);

  const [formData, setFormData] = useState<ProductInput>({
    businessId: 0,
    name: '',
    description: '',
    price: 0,
    discountedPrice: 0,
    stock: 0,
    categoryId: 0,
    status: 'active',
    expiresAt: '',
  });

  useEffect(() => {
    loadBusinesses();
    loadCategories();
    
    // Check if we're in edit mode
    if (params.productId) {
      setIsEditMode(true);
      setProductId(parseInt(params.productId as string));
    }
  }, []);

  useEffect(() => {
    // Load product data if in edit mode
    if (isEditMode && productId && params.businessId) {
      loadProductData(productId, parseInt(params.businessId as string));
    }
  }, [isEditMode, productId, params.businessId]);

  const loadProductData = async (prodId: number, busId: number) => {
    setLoadingProduct(true);
    try {
      const products = await getProductsByBusiness(busId);
      const product = products.find(p => p.id === prodId);
      
      if (product) {
        setFormData({
          businessId: product.businessId,
          name: product.name,
          description: product.description,
          price: product.price,
          discountedPrice: product.discountedPrice || product.price,
          stock: product.stock,
          categoryId: product.categoryId,
          status: product.status,
          expiresAt: product.expiresAt || '',
        });
        setSelectedBusiness(product.businessId);
        
        // Store existing image URL if available
        if (product.imageUrl) {
          setExistingImageUrl(product.imageUrl);
        }
      } else {
        Alert.alert('Error', 'No se pudo cargar el producto');
        router.back();
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo cargar el producto');
      router.back();
    } finally {
      setLoadingProduct(false);
    }
  };

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const { data, errors } = await apolloClient.query({
        query: GET_CATEGORIES,
        fetchPolicy: 'network-only',
      });

      if (errors && errors.length > 0) {
        console.error('GraphQL Errors:', errors);
        Alert.alert('Error', 'No se pudieron cargar las categorías');
        return;
      }

      if (data && data.getAllCategories) {
        const allCategories = data.getAllCategories;
        setCategories(allCategories);

        // Si hay categorías, seleccionar la primera por defecto
        if (allCategories.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: allCategories[0].id }));
        }
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      Alert.alert('Error', 'No se pudieron cargar las categorías');
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadBusinesses = async () => {
    setLoadingBusinesses(true);
    try {
      const data = await getBusinesses();
      setBusinesses(data);

      // Si viene un businessId en los params, seleccionarlo
      if (params.businessId) {
        const businessId = parseInt(params.businessId as string);
        setSelectedBusiness(businessId);
        setFormData(prev => ({ ...prev, businessId }));
      } else if (data.length === 1) {
        // Si solo tiene un negocio, seleccionarlo automáticamente
        setSelectedBusiness(data[0].id);
        setFormData(prev => ({ ...prev, businessId: data[0].id }));
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudieron cargar los negocios');
    } finally {
      setLoadingBusinesses(false);
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para seleccionar imágenes');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const takePicture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu cámara para tomar fotos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!selectedBusiness) {
      Alert.alert('Error', 'Debes seleccionar un negocio');
      return;
    }

    if (!formData.categoryId || formData.categoryId === 0) {
      Alert.alert('Error', 'Debes seleccionar una categoría');
      return;
    }

    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre del producto es obligatorio');
      return;
    }

    if (formData.price <= 0) {
      Alert.alert('Error', 'El precio debe ser mayor a 0');
      return;
    }

    if (formData.stock < 0) {
      Alert.alert('Error', 'El stock no puede ser negativo');
      return;
    }

    try {
      const productData: ProductInput = {
        ...formData,
        businessId: selectedBusiness,
      };

      // Si hay imagen seleccionada, agregarla al formData
      if (selectedImage) {
        productData.imageFile = {
          uri: selectedImage.uri,
          type: selectedImage.mimeType || 'image/jpeg',
          name: selectedImage.fileName || `product_${Date.now()}.jpg`,
        };
      } else if (isEditMode) {
      }

      if (isEditMode && productId) {
        // Modo edición
        const product = await updateProduct(productId, productData);
        
        if (product) {
          Alert.alert(
            '¡Éxito!',
            'Producto actualizado correctamente',
            [
              {
                text: 'OK',
                onPress: () => router.back(),
              },
            ]
          );
        }
      } else {
        // Modo creación
        const product = await createProduct(productData);

        if (product) {
          Alert.alert(
            '¡Éxito!',
            'Producto creado correctamente',
            [
              {
                text: 'Crear otro',
                onPress: () => {
                  setFormData({
                    businessId: selectedBusiness,
                    name: '',
                    description: '',
                    price: 0,
                    discountedPrice: 0,
                    stock: 0,
                    categoryId: categories.length > 0 ? categories[0].id : 0,
                    status: 'active',
                    expiresAt: '',
                  });
                  setSelectedImage(null);
                  setExistingImageUrl(null);
                },
              },
              {
                text: 'Ver productos',
                onPress: () => router.back(),
              },
            ]
          );
        }
      }
    } catch (err: any) {
      console.error('❌ Error in handleSubmit:', err);
      const errorMessage = err.message || `No se pudo ${isEditMode ? 'actualizar' : 'crear'} el producto`;

      // Si el token es inválido, sugerir relogin
      if (errorMessage.includes('Token') || errorMessage.includes('token')) {
        Alert.alert(
          'Sesión Expirada',
          'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
          [
            {
              text: 'Ir al Login',
              onPress: () => router.push('/auth/login'),
            },
          ]
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
    }
  };

  const updateField = (field: keyof ProductInput, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const statuses = [
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'sold_out', label: 'Agotado' },
    { value: 'expired', label: 'Expirado' },
  ];

  if (loadingBusinesses || loadingCategories) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#B5A78E" />
        <Text className="text-[#794646] mt-4">Cargando datos...</Text>
      </View>
    );
  }

  if (businesses.length === 0) {
    return (
      <View className="flex-1 bg-white pt-12">
        <View className="flex-row items-center px-5 py-4 border-b border-gray-200 bg-white">
          <Text className="text-2xl font-bold text-[#794646] flex-1">
            Crear Producto
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="business-outline" size={80} color="#D2C0C0" />
          <Text className="text-[#794646] text-lg mt-4 text-center">
            Necesitas tener al menos un negocio registrado para crear productos
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/business/create')}
            className="bg-[#B5A78E] rounded-lg px-6 py-3 mt-6"
          >
            <Text className="text-white font-semibold">Crear mi primer negocio</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <View className="flex-1 bg-white pt-12">
        <View className="flex-row items-center px-5 py-4 border-b border-gray-200 bg-white">
          <Text className="text-2xl font-bold text-[#794646] flex-1">
            Crear Producto
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="pricetag-outline" size={80} color="#D2C0C0" />
          <Text className="text-[#794646] text-lg mt-4 text-center">
            No hay categorías disponibles. Por favor contacta al administrador.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white pt-12">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#794646" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-[#794646] flex-1">
          {isEditMode ? 'Editar Producto' : 'Crear Producto'}
        </Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Loading Product */}
        {loadingProduct && (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color="#B5A78E" />
            <Text className="text-gray-600 mt-4">Cargando producto...</Text>
          </View>
        )}
        
        {/* Error Message */}
        {error && (
          <View className="bg-red-100 border border-red-400 rounded-lg p-3 mb-4 mt-4">
            <Text className="text-red-700">{error}</Text>
          </View>
        )}

        {/* Form */}
        <View className="py-4">
          {/* Business Selection */}
          <View className="mb-4">
            <Text className="text-[#794646] font-semibold mb-2">
              Selecciona el Negocio *
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {businesses.map((business) => (
                <TouchableOpacity
                  key={business.id}
                  onPress={() => {
                    setSelectedBusiness(business.id);
                    updateField('businessId', business.id);
                  }}
                  className={`mr-2 px-4 py-3 rounded-lg ${selectedBusiness === business.id
                      ? 'bg-[#B5A78E]'
                      : 'bg-[#F5F5F5]'
                    }`}
                >
                  <Text
                    className={`${selectedBusiness === business.id
                        ? 'text-white font-semibold'
                        : 'text-[#794646]'
                      }`}
                  >
                    {business.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Category Selection */}
          <View className="mb-4">
            <Text className="text-[#794646] font-semibold mb-2">
              Categoría *
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => updateField('categoryId', category.id)}
                  className={`mr-2 px-4 py-3 rounded-lg ${formData.categoryId === category.id
                      ? 'bg-[#B5A78E]'
                      : 'bg-[#F5F5F5]'
                    }`}
                >
                  <Text
                    className={`${formData.categoryId === category.id
                        ? 'text-white font-semibold'
                        : 'text-[#794646]'
                      }`}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Name */}
          <View className="mb-4">
            <Text className="text-[#794646] font-semibold mb-2">
              Nombre del Producto *
            </Text>
            <TextInput
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
              placeholder="Ej: Pizza Margarita"
              placeholderTextColor="#79464699"
              className="bg-[#F5F5F5] rounded-lg px-4 py-3 text-[#794646]"
            />
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-[#794646] font-semibold mb-2">
              Descripción *
            </Text>
            <TextInput
              value={formData.description}
              onChangeText={(text) => updateField('description', text)}
              placeholder="Describe el producto..."
              placeholderTextColor="#79464699"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="bg-[#F5F5F5] rounded-lg px-4 py-3 text-[#794646]"
            />
          </View>

          {/* Image Selection */}
          <View className="mb-4">
            <Text className="text-[#794646] font-semibold mb-2">
              Imagen del Producto
            </Text>
            
            {/* Mostrar imagen seleccionada o imagen existente del producto */}
            {(selectedImage || (isEditMode && existingImageUrl)) && (
              <View className="mb-3 relative">
                <Image
                  source={{ 
                    uri: selectedImage 
                      ? selectedImage.uri 
                      : existingImageUrl || undefined
                  }}
                  style={{ width: '100%', height: 200, borderRadius: 8 }}
                  resizeMode="cover"
                />
                {/* Solo mostrar botón de eliminar si hay una nueva imagen seleccionada */}
                {selectedImage && (
                  <TouchableOpacity
                    onPress={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
                  >
                    <Ionicons name="close" size={20} color="white" />
                  </TouchableOpacity>
                )}
                {/* Mostrar indicador de imagen existente */}
                {!selectedImage && existingImageUrl && (
                  <View className="absolute top-2 left-2 bg-blue-500 rounded-lg px-3 py-1">
                    <Text className="text-white text-xs font-semibold">Imagen actual</Text>
                  </View>
                )}
              </View>
            )}

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={takePicture}
                className="flex-1 flex-row items-center justify-center bg-[#B5A78E] rounded-lg px-4 py-3"
              >
                <Ionicons name="camera" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">
                  {selectedImage || existingImageUrl ? 'Cambiar foto' : 'Tomar Foto'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={pickImageFromGallery}
                className="flex-1 flex-row items-center justify-center bg-[#D2C0C0] rounded-lg px-4 py-3"
              >
                <Ionicons name="images" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">
                  {selectedImage || existingImageUrl ? 'Cambiar de galería' : 'Galería'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Price */}
          <View className="mb-4">
            <Text className="text-[#794646] font-semibold mb-2">
              Precio *
            </Text>
            <TextInput
              value={formData.price > 0 ? formData.price.toString() : ''}
              onChangeText={(text) => updateField('price', parseFloat(text) || 0)}
              placeholder="0.00"
              placeholderTextColor="#79464699"
              keyboardType="decimal-pad"
              className="bg-[#F5F5F5] rounded-lg px-4 py-3 text-[#794646]"
            />
          </View>

          {/* Discounted Price */}
          <View className="mb-4">
            <Text className="text-[#794646] font-semibold mb-2">
              Precio con Descuento (opcional)
            </Text>
            <TextInput
              value={formData.discountedPrice ? formData.discountedPrice.toString() : ''}
              onChangeText={(text) => {
                const value = parseFloat(text);
                updateField('discountedPrice', isNaN(value) ? 0 : value);
              }}
              placeholder="0.00"
              placeholderTextColor="#79464699"
              keyboardType="decimal-pad"
              className="bg-[#F5F5F5] rounded-lg px-4 py-3 text-[#794646]"
            />
          </View>

          {/* Stock */}
          <View className="mb-4">
            <Text className="text-[#794646] font-semibold mb-2">
              Stock Disponible *
            </Text>
            <TextInput
              value={formData.stock > 0 ? formData.stock.toString() : ''}
              onChangeText={(text) => updateField('stock', parseInt(text) || 0)}
              placeholder="0"
              placeholderTextColor="#79464699"
              keyboardType="number-pad"
              className="bg-[#F5F5F5] rounded-lg px-4 py-3 text-[#794646]"
            />
          </View>

          {/* Status */}
          <View className="mb-4">
            <Text className="text-[#794646] font-semibold mb-2">Estado</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {statuses.map((status) => (
                <TouchableOpacity
                  key={status.value}
                  onPress={() => updateField('status', status.value)}
                  className={`mr-2 px-4 py-2 rounded-lg ${formData.status === status.value
                      ? 'bg-[#B5A78E]'
                      : 'bg-[#F5F5F5]'
                    }`}
                >
                  <Text
                    className={`${formData.status === status.value
                        ? 'text-white font-semibold'
                        : 'text-[#794646]'
                      }`}
                  >
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || loadingProduct}
            className={`bg-[#B5A78E] rounded-lg py-4 items-center mb-24 ${loading || loadingProduct ? 'opacity-50' : ''
              }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-bold">
                {isEditMode ? 'Actualizar Producto' : 'Crear Producto'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
