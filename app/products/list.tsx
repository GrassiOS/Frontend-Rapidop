import React, { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useProduct } from "@/hooks/useProduct";
import { useBusiness } from "@/hooks/useBusiness";
import { Product } from "@/services/productService";
import { Business } from "@/services/businessService";
import { useAuth } from "@/contexts/AuthContext";
import { apolloClient } from "@/lib/apollo";
import { GET_BUSINESS_BY_ID } from "@/graphql/queries";
import { ReservationModal } from "@/components/reservations/ReservationModal";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
} from "react-native";

export default function ProductListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getProductsByBusiness, deleteProduct, loading, error } = useProduct();
  const { getBusinesses } = useBusiness();
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isConsumerView, setIsConsumerView] = useState(false);
  const [reservationModalVisible, setReservationModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (user) {
      loadBusinesses();
    }
  }, [user?.role, params.businessId]);

  useEffect(() => {
    if (selectedBusiness) {
      loadProducts();
    }
  }, [selectedBusiness]);

  const loadBusinesses = async () => {
    setLoadingBusinesses(true);
    try {
      // Si viene un businessId en los params y es usuario CONSUMER, cargar solo ese negocio
      if (params.businessId && user?.role === "CONSUMER") {
        setIsConsumerView(true);
        const businessId = parseInt(params.businessId as string);

        try {
          const { data } = await apolloClient.query({
            query: GET_BUSINESS_BY_ID,
            variables: { businessId },
            fetchPolicy: "network-only",
          });

          if (data?.getBusiness) {
            setBusinesses([data.getBusiness]);
            setSelectedBusiness(businessId);
          } else {
          }
        } catch (err) {
          Alert.alert("Error", "No se pudo cargar la información del negocio");
        }
      } else {
        // Para usuarios BUSINESS, cargar sus negocios
        setIsConsumerView(false);
        const data = await getBusinesses();
        setBusinesses(data);

        // Si viene un businessId en los params, seleccionarlo
        if (params.businessId) {
          const businessId = parseInt(params.businessId as string);
          setSelectedBusiness(businessId);
        } else if (data.length === 1) {
          // Si solo tiene un negocio, seleccionarlo automáticamente
          setSelectedBusiness(data[0].id);
        } else if (data.length > 0) {
          // Seleccionar el primer negocio por defecto
          setSelectedBusiness(data[0].id);
        }
      }
    } catch (err) {
      console.error("❌ Error loading businesses:", err);
      Alert.alert("Error", "No se pudieron cargar los negocios");
    } finally {
      setLoadingBusinesses(false);
    }
  };

  const loadProducts = async () => {
    if (!selectedBusiness) {
      return;
    }

    setLoadingProducts(true);
    try {
      const data = await getProductsByBusiness(selectedBusiness);
      setProducts(data);
    } catch (err) {

        Alert.alert("Error", "No se pudieron cargar los productos");
    } finally {
      setLoadingProducts(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleDelete = (id: number, name: string, businessId: number) => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de eliminar "${name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const success = await deleteProduct(id, businessId);
            if (success) {
              Alert.alert("Éxito", "Producto eliminado correctamente");
              loadProducts();
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "out_of_stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "Activo";
      case "inactive":
        return "Inactivo";
      case "out_of_stock":
        return "Sin stock";
      default:
        return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  const calculateDiscount = (price: number, discountedPrice?: number) => {
    if (!discountedPrice || discountedPrice >= price) return 0;
    return Math.round(((price - discountedPrice) / price) * 100);
  };

  const handleReserveProduct = (product: Product) => {
    setSelectedProduct(product);
    setReservationModalVisible(true);
  };

  const handleCloseReservationModal = () => {
    setReservationModalVisible(false);
    setSelectedProduct(null);
  };

  if (loadingBusinesses) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#B5A78E" />
        <Text className="text-[#794646] mt-4">
          {isConsumerView ? "Cargando información..." : "Cargando negocios..."}
        </Text>
      </View>
    );
  }

  if (businesses.length === 0 && !isConsumerView) {
    return (
      <View className="flex-1 bg-white pt-12">
        {/* Header */}
        <View className="flex-row items-center px-5 py-4 border-b border-gray-200 bg-white">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#794646" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-[#794646] flex-1">
            Mis Productos
          </Text>
        </View>

        {/* Empty State */}
        <View className="flex-1 items-center justify-center px-8">
          <MaterialCommunityIcons name="store-off" size={80} color="#B5A78E" />
          <Text className="text-xl font-bold text-[#794646] mt-4 text-center">
            No tienes negocios registrados
          </Text>
          <Text className="text-gray-600 mt-2 text-center">
            Primero debes crear un negocio para poder agregar productos.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/business/create")}
            className="bg-[#B5A78E] px-8 py-4 rounded-full mt-6"
          >
            <Text className="text-white font-bold text-center">
              Crear Negocio
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white pt-12">
      {/* Header */}
      <View className="bg-white px-5 py-4 border-b border-gray-200">
        <View className="flex-row items-center mb-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#794646" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-[#794646] flex-1">
            {isConsumerView ? "Productos Disponibles" : "Mis Productos"}
          </Text>
          {!isConsumerView && (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/products/create",
                  params: { businessId: selectedBusiness },
                })
              }
            >
              <Ionicons name="add-circle" size={32} color="#B5A78E" />
            </TouchableOpacity>
          )}
        </View>
        {isConsumerView && selectedBusiness && businesses.length > 0 && (
          <View className="bg-[#F5F5F5] rounded-lg p-3">
            <Text className="text-lg font-bold text-[#794646]">
              {businesses[0].name}
            </Text>
            {businesses[0].description && (
              <Text className="text-sm text-gray-600 mt-1">
                {businesses[0].description}
              </Text>
            )}
            {businesses[0].address && (
              <View className="flex-row items-center mt-1">
                <Ionicons name="location" size={14} color="#B5A78E" />
                <Text className="text-xs text-gray-500 ml-1">
                  {businesses[0].address}
                </Text>
              </View>
            )}
          </View>
        )}
        {!isConsumerView && (
          <>
            <Text className="text-base text-[#794646] mb-2">
              Seleccione un negocio:
            </Text>
            {/* Business Selector */}
            {businesses.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mt-2"
              >
                {businesses.map((business) => (
                  <TouchableOpacity
                    key={business.id}
                    onPress={() => setSelectedBusiness(business.id)}
                    className={`mr-2 px-4 py-2 rounded-full ${
                      selectedBusiness === business.id
                        ? "bg-[#B5A78E]"
                        : "bg-[#F5F5F5]"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        selectedBusiness === business.id
                          ? "text-white"
                          : "text-[#794646]"
                      }`}
                    >
                      {business.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <View className="bg-red-100 border border-red-400 rounded-lg p-3 mx-5 mt-4">
          <Text className="text-red-700">{error}</Text>
        </View>
      )}

      {/* Products List */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#B5A78E"]}
            tintColor="#B5A78E"
          />
        }
      >
        {loadingProducts && !refreshing && products.length === 0 ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color="#B5A78E" />
            <Text className="text-gray-600 mt-4">Cargando productos...</Text>
          </View>
        ) : products.length === 0 ? (
          // Empty State
          <View className="items-center justify-center px-8 py-12">
            <MaterialCommunityIcons
              name="package-variant"
              size={80}
              color="#B5A78E"
            />
            <Text className="text-xl font-bold text-[#794646] mt-4 text-center">
              {isConsumerView
                ? "No hay productos disponibles"
                : "No hay productos aún"}
            </Text>
            <Text className="text-gray-600 mt-2 text-center">
              {isConsumerView
                ? "Este negocio aún no ha agregado productos."
                : "Comienza agregando tu primer producto para este negocio."}
            </Text>
            {!isConsumerView && (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/products/create",
                    params: { businessId: selectedBusiness },
                  })
                }
                className="bg-[#B5A78E] px-8 py-4 rounded-full mt-6"
              >
                <Text className="text-white font-bold text-center">
                  Agregar Producto
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          // Products Grid
          <View className="p-4">
            {products.map((product) => {
              const discount = calculateDiscount(
                product.price,
                product.discountedPrice
              );
              const isExpired =
                product.expiresAt && new Date(product.expiresAt) < new Date();

              return (
                <TouchableOpacity
                  key={product.id}
                  className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm border border-[#D2C0C0]"
                  activeOpacity={0.7}
                >
                  <View className="flex-row">
                    {/* Product Image */}
                    <View className="w-28 h-28 bg-[#F5F5F5] relative m-3 rounded-xl overflow-hidden">
                      {product.imageUrl ? (
                        <Image
                          source={{ uri: product.imageUrl }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-full h-full items-center justify-center">
                          <MaterialCommunityIcons
                            name="image-off"
                            size={40}
                            color="#B5A78E"
                          />
                        </View>
                      )}

                      {/* Discount Badge */}
                      {discount > 0 && !isExpired && (
                        <View className="absolute top-2 right-2 bg-red-500 px-2 py-1 rounded-full shadow-sm">
                          <Text className="text-white text-xs font-bold">
                            -{discount}%
                          </Text>
                        </View>
                      )}

                      {/* Stock Badge */}
                      {product.stock === 0 && (
                        <View className="absolute top-2 right-2 bg-red-500 px-2 py-1 rounded-full shadow-sm">
                          <Text className="text-white text-xs font-bold">
                            Sin stock
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Product Info */}
                    <View className="flex-1 p-3 pt-4">
                      <View className="flex-row items-start justify-between mb-1">
                        <Text
                          className="text-lg font-bold text-[#794646] flex-1"
                          numberOfLines={1}
                        >
                          {product.name}
                        </Text>

                        {/* Status Badge */}
                        <View
                          className={`px-2 py-1 rounded-full ml-2 ${getStatusColor(
                            product.status
                          )}`}
                        >
                          <Text className="text-xs font-semibold">
                            {getStatusText(product.status)}
                          </Text>
                        </View>
                      </View>

                      <Text
                        className="text-gray-600 text-sm mb-2"
                        numberOfLines={2}
                      >
                        {product.description}
                      </Text>

                      {/* Price */}
                      <View className="flex-row items-center mb-2">
                        {discount > 0 && !isExpired ? (
                          <>
                            <Text className="text-[#B5A78E] font-bold text-lg">
                              {formatPrice(
                                product.discountedPrice || product.price
                              )}
                            </Text>
                            <Text className="text-gray-400 line-through text-sm ml-2">
                              {formatPrice(product.price)}
                            </Text>
                          </>
                        ) : (
                          <Text className="text-[#794646] font-bold text-lg">
                            {formatPrice(product.price)}
                          </Text>
                        )}
                      </View>

                      {/* Stock & Actions */}
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <MaterialCommunityIcons
                            name="package-variant"
                            size={16}
                            color="#666"
                          />
                          <Text className="text-gray-600 text-sm ml-1">
                            Disponibilidad {product.stock}
                          </Text>
                        </View>

                        {/* Action Buttons - Para CONSUMER: Botón de reserva */}
                        {isConsumerView && product.stock > 0 && !isExpired ? (
                          <TouchableOpacity
                            onPress={() => handleReserveProduct(product)}
                            className="bg-[#794646] px-4 py-2 rounded-full flex-row items-center"
                          >
                            <Ionicons
                              name="calendar-outline"
                              size={16}
                              color="#fff"
                            />
                            <Text className="text-white text-sm font-semibold ml-1">
                              Reservar
                            </Text>
                          </TouchableOpacity>
                        ) : null}

                        {/* Action Buttons - Solo para BUSINESS */}
                        {!isConsumerView && (
                          <View className="flex-row">
                            <TouchableOpacity
                              onPress={() =>
                                router.push({
                                  pathname: "/products/create",
                                  params: {
                                    productId: product.id,
                                    businessId: product.businessId,
                                  },
                                })
                              }
                              className="bg-blue-100 p-2 rounded-full mr-2"
                            >
                              <Ionicons
                                name="pencil"
                                size={16}
                                color="#0066CC"
                              />
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() =>
                                handleDelete(
                                  product.id,
                                  product.name,
                                  product.businessId
                                )
                              }
                              className="bg-red-100 p-2 rounded-full"
                            >
                              <Ionicons
                                name="trash"
                                size={16}
                                color="#DC2626"
                              />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>

                      {/* Expiration Warning */}
                      {product.expiresAt && (
                        <View className="mt-2 flex-row items-center">
                          <Ionicons
                            name={isExpired ? "alert-circle" : "time-outline"}
                            size={14}
                            color={isExpired ? "#DC2626" : "#F59E0B"}
                          />
                          <Text
                            className={`text-xs ml-1 ${
                              isExpired ? "text-red-600" : "text-amber-600"
                            }`}
                          >
                            {isExpired
                              ? "Expirado"
                              : `Vence: ${new Date(
                                  product.expiresAt
                                ).toLocaleDateString()}`}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Spacing at bottom */}
        <View className="h-8" />
      </ScrollView>

      {/* Reservation Modal */}
      {selectedProduct && (
        <ReservationModal
          visible={reservationModalVisible}
          onClose={handleCloseReservationModal}
          product={selectedProduct}
        />
      )}
    </View>
  );
}
