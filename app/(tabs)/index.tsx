import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Image, RefreshControl, Alert, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { apolloClient } from '@/lib/apollo';
import { GET_ALL_PRODUCTS_WITH_BUSINESS, GET_CATEGORIES } from '@/graphql/queries';
import { Product, Category, BusinessInfo } from '@/types/product';
import { filterProductsByDistance } from '@/utils/location';
import * as Location from 'expo-location';
import { ReservationModal } from '@/components/reservations/ReservationModal';

export default function HomeScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [businesses, setBusinesses] = useState<BusinessInfo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distanceRadius, setDistanceRadius] = useState(100); // Default: no limit
  const [showDistanceFilter, setShowDistanceFilter] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    requestLocationPermission();
    loadData();
  }, []);

  const requestLocationPermission = async () => {
    try {
      // Primero verificar el estado actual del permiso
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      
      let finalStatus = existingStatus;
      
      // Si no está otorgado, solicitar permiso
      if (existingStatus !== 'granted') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus === 'granted') {
        setLocationPermission(true);
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
      } else {
        setLocationPermission(false);
        Alert.alert(
          'Permiso denegado',
          'Para activar la ubicación, ve a Configuración > Aplicaciones > Permisos y activa el acceso a la ubicación.',
          [{ text: 'Entendido' }]
        );
      }
    } catch (error) {
      console.error('❌ Error getting location:', error);
      setLocationPermission(false);
      Alert.alert(
        'Error',
        'No se pudo obtener tu ubicación. Verifica que el GPS esté activado.'
      );
    }
  };

  const loadData = async () => {
    try {
      // Cargar categorías y productos con negocios en una sola query
      const { data, errors } = await apolloClient.query({
        query: GET_ALL_PRODUCTS_WITH_BUSINESS,
        variables: { limit: 200, offset: 0 },
        fetchPolicy: 'network-only',
      });

      if (errors) {
        console.error('❌ [HOME] GraphQL errors:', errors);
      }

      if (data?.getAllProducts) {
        setProducts(data.getAllProducts);
      }

      if (data?.getAllBusinesses) {
        setBusinesses(data.getAllBusinesses);
      }

      // Cargar categorías
      const { data: categoriesData } = await apolloClient.query({
        query: GET_CATEGORIES,
        fetchPolicy: 'cache-first',
      });

      if (categoriesData?.getCategories) {
        setCategories(categoriesData.getCategories);
      }
    } catch (error) {
      console.error('❌ [HOME] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Apply filters
  let filteredProducts = products;

  // Filter by distance if user location is available
  if (userLocation && locationPermission && distanceRadius < 100 && businesses.length > 0) {
    filteredProducts = filterProductsByDistance(
      filteredProducts,
      businesses,
      userLocation.latitude,
      userLocation.longitude,
      distanceRadius
    );
  }

  // Filter by category
  if (activeCategory) {
    filteredProducts = filteredProducts.filter(product => product.categoryId === activeCategory);
  }

  // Filter by search query
  if (searchQuery) {
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(price);
  };

  const calculateDiscount = (price: number, discountedPrice?: number) => {
    if (!discountedPrice || discountedPrice >= price) return 0;
    return Math.round(((price - discountedPrice) / price) * 100);
  };

  const cardColors = ['#A5E8621A', '#A286A336', '#BBBBBB36'];

  return (
    <SafeAreaView className="flex-1 bg-[#FFFFFF]" edges={['top']}>
      {/* Search Bar with Distance Filter Button */}
      <View className="px-5 pt-5 mb-4">
        <View className="flex-row items-center gap-2">
          {/* Search Bar */}
          <View className="flex-1 flex-row items-center bg-white border-2 border-[#D2C0C0] rounded-full px-4 py-3 shadow-sm">
            <Ionicons name="search" size={22} color="#794646" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Buscar productos..."
              placeholderTextColor="#79464699"
              className="flex-1 text-[16px] text-[#794646]"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#794646" />
              </TouchableOpacity>
            )}
          </View>

          {/* Distance Filter Button */}
          {locationPermission && (
            <TouchableOpacity
              onPress={() => setShowDistanceFilter(!showDistanceFilter)}
              className={`bg-white border-2 rounded-full p-3 shadow-sm ${
                distanceRadius < 100 ? 'border-[#B5A78E]' : 'border-[#D2C0C0]'
              }`}
            >
              <Ionicons 
                name="location" 
                size={24} 
                color={distanceRadius < 100 ? '#B5A78E' : '#794646'} 
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Distance Options Panel */}
        {locationPermission && showDistanceFilter && (
          <View className="bg-white border-2 border-[#D2C0C0] rounded-2xl mt-2 p-4 shadow-sm">
            <Text className="text-sm text-gray-600 mb-3">
              Selecciona el radio de búsqueda desde tu ubicación:
            </Text>
            
            <View className="flex-row flex-wrap">
              {[
                { value: 1, label: '1 km' },
                { value: 2, label: '2 km' },
                { value: 5, label: '5 km' },
                { value: 10, label: '10 km' },
                { value: 25, label: '25 km' },
                { value: 50, label: '50 km' },
                { value: 100, label: 'Sin límite' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setDistanceRadius(option.value)}
                  className={`mr-2 mb-2 px-4 py-2 rounded-full ${
                    distanceRadius === option.value 
                      ? 'bg-[#B5A78E]' 
                      : 'bg-[#EBE5EB]'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      distanceRadius === option.value ? 'text-white' : 'text-[#794646]'
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

      {/* Location Permission Alert */}
      {!locationPermission && (
        <View className="px-5 mb-4">
          <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="location-outline" size={20} color="#F59E0B" />
              <Text className="ml-2 text-amber-800 font-semibold">
                Ubicación desactivada
              </Text>
            </View>
            <Text className="text-amber-700 text-sm mb-3">
              Activa los permisos de ubicación para filtrar productos por cercanía.
            </Text>
            <TouchableOpacity
              onPress={requestLocationPermission}
              className="bg-[#B5A78E] py-2 px-4 rounded-full"
            >
              <Text className="text-white text-center font-semibold">
                Activar ubicación
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main Content */}
      <ScrollView 
        className="flex-1 px-5 mb-0" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#B5A78E']}
            tintColor="#B5A78E"
          />
        }
      >
        {/* Categories */}
        {categories.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            <TouchableOpacity
              onPress={() => setActiveCategory(null)}
              className={`mr-3 px-4 py-3 rounded-2xl items-center ${
                activeCategory === null ? 'bg-[#B5A78E]' : 'bg-[#EBE5EB]'
              }`}
            >
              <MaterialCommunityIcons
                name="food"
                size={28}
                color={activeCategory === null ? '#fff' : '#794646'}
              />
              <Text
                className={`text-xs font-semibold mt-1 ${
                  activeCategory === null ? 'text-white' : 'text-[#794646]'
                }`}
              >
                Todos
              </Text>
            </TouchableOpacity>
            
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setActiveCategory(cat.id)}
                className={`mr-3 px-4 py-3 rounded-2xl items-center ${
                  activeCategory === cat.id ? 'bg-[#B5A78E]' : 'bg-[#EBE5EB]'
                }`}
              >
                <MaterialCommunityIcons
                  name="food-variant"
                  size={28}
                  color={activeCategory === cat.id ? '#fff' : '#794646'}
                />
                <Text
                  className={`text-xs font-semibold mt-1 ${
                    activeCategory === cat.id ? 'text-white' : 'text-[#794646]'
                  }`}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Loading State */}
        {loading && (
          <View className="flex-1 items-center justify-center py-12">
            <ActivityIndicator size="large" color="#B5A78E" />
            <Text className="text-gray-600 mt-4">Cargando productos...</Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <View className="flex-1 items-center justify-center py-12">
            <MaterialCommunityIcons name="package-variant-closed" size={80} color="#B5A78E" />
            <Text className="text-xl font-bold text-[#794646] mt-4 text-center">
              {searchQuery ? 'No se encontraron productos' : 'No hay productos disponibles'}
            </Text>
            <Text className="text-gray-600 mt-2 text-center px-8">
              {searchQuery 
                ? 'Intenta con otra búsqueda'
                : 'No hay productos disponibles en este momento'}
            </Text>
          </View>
        )}

        {/* Products Grid */}
        {!loading && filteredProducts.length > 0 && (
          <View className="flex-row flex-wrap justify-between">
            {filteredProducts.map((product, index) => {
              const discount = calculateDiscount(product.price, product.discountedPrice);
              const business = businesses.find(b => b.id === product.businessId);
              
              return (
                <TouchableOpacity
                  key={product.id}
                  className="w-[47%] rounded-3xl overflow-hidden mb-4 shadow-md active:scale-95 border-2 border-[#E5E5E5]"
                  onPress={() => {
                    if (user?.role === 'CONSUMER') {
                      setSelectedProduct(product);
                    }
                  }}
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    elevation: 4,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                  }}
                >
                  {/* Product Image */}
                  <Pressable 
                    className="w-full h-40 bg-[#F5F5F5] items-center justify-center overflow-hidden relative"
                    onLongPress={() => {
                      if (product.imageUrl) {
                        setSelectedImage(product.imageUrl);
                      }
                    }}
                  >
                    {product.imageUrl ? (
                      <Image
                        source={{ uri: product.imageUrl }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="bg-[#EBE5EB] w-full h-full items-center justify-center">
                        <MaterialCommunityIcons
                          name="silverware-fork-knife"
                          size={48}
                          color="#B5A78E"
                        />
                      </View>
                    )}
                    
                    {/* Overlay Gradient for better text visibility */}
                    <View 
                      className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"
                      style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                    />

                    {/* Discount Badge */}
                    {discount > 0 && (
                      <View className="absolute top-3 right-3 bg-red-500 px-3 py-1.5 rounded-full shadow-lg">
                        <Text className="text-white text-xs font-bold">
                          -{discount}%
                        </Text>
                      </View>
                    )}

                    {/* Distance Badge */}
                    {product.distance !== undefined && (
                      <View className="absolute top-3 left-3 bg-white/95 px-2.5 py-1.5 rounded-full flex-row items-center shadow-md">
                        <Ionicons name="location" size={12} color="#B5A78E" />
                        <Text className="text-[#794646] text-xs font-bold ml-1">
                          {product.distance.toFixed(1)} km
                        </Text>
                      </View>
                    )}
                  </Pressable>

                  {/* Product Info */}
                  <View className="p-3">
                    {/* Product Name */}
                    <Text className="text-base font-bold text-[#794646] mb-1.5" numberOfLines={1}>
                      {product.name}
                    </Text>

                    {/* Business Name 
                    {business && (
                      <View className="flex-row items-center mb-2">
                        <Ionicons name="storefront-outline" size={14} color="#B5A78E" />
                        <Text className="text-xs text-[#B5A78E] ml-1.5 font-medium" numberOfLines={1}>
                          {business.name}
                        </Text>
                      </View>
                    )}*/}
                    
                    {/* Price Section */}
                    <View className="flex-row items-center justify-between mt-1">
                      {discount > 0 ? (
                        <View className="flex-row items-center gap-2 flex-1">
                          <Text className="text-[#B5A78E] font-bold text-lg">
                            {formatPrice(product.discountedPrice || product.price)}
                          </Text>
                          <Text className="text-gray-400 line-through text-xs">
                            {formatPrice(product.price)}
                          </Text>
                        </View>
                      ) : (
                        <Text className="text-[#794646] font-bold text-lg flex-1">
                          {formatPrice(product.price)}
                        </Text>
                      )}
                      
                      
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View className="h-4" />
      </ScrollView>

      {/* Image Viewer Modal */}
      <Modal
        visible={selectedImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <Pressable 
          className="flex-1 bg-black/90 items-center justify-center"
          onPress={() => setSelectedImage(null)}
        >
          <View className="w-full h-full items-center justify-center p-5">
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                className="w-full h-full"
                resizeMode="contain"
              />
            )}
            
            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setSelectedImage(null)}
              className="absolute top-12 right-5 bg-white/20 rounded-full p-3"
            >
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Reservation Modal */}
      {selectedProduct && (
        <ReservationModal
          visible={selectedProduct !== null}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
        />
      )}
    </SafeAreaView>
  );
}
