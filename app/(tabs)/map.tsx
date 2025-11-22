import React, { useEffect, useState, useRef } from "react";
import { Platform, StyleSheet, View, ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, Keyboard } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { apolloClient } from '@/lib/apollo';
import { GET_ALL_BUSINESSES } from '@/graphql/queries';
import { Business, SearchedLocation } from '@/services/businessService';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function MapScreen() {
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedLocation, setSearchedLocation] = useState<SearchedLocation | null>(null);
  const [userLocationContext, setUserLocationContext] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const mapViewRef = useRef<MapView>(null);
  const { user } = useAuth();
  const router = useRouter();

  // Función para navegar a los productos de un negocio
  const handleBusinessPress = (businessId: number) => {
    // Solo permitir navegación para usuarios CONSUMER
    if (user?.role === 'CONSUMER') {
      router.push(`/products/list?businessId=${businessId}`);
    }
  };

  // Función para cargar los negocios
  const loadBusinesses = async () => {
    setLoadingBusinesses(true);
    try {
      const { data, errors } = await apolloClient.query({
        query: GET_ALL_BUSINESSES,
        fetchPolicy: 'cache-first', // Usa cache primero para carga rápida
      });

      if (errors && errors.length > 0) {
        console.error('GraphQL Errors:', errors);
        return;
      }

      if (data && data.getAllBusinesses) {
        // Filtrar negocios que tengan coordenadas válidas
        const validBusinesses = data.getAllBusinesses.filter(
          (business: Business) => 
            business.latitude !== undefined && 
            business.longitude !== undefined &&
            business.latitude !== 0 && 
            business.longitude !== 0
        );
        setBusinesses(validBusinesses);
      }
    } catch (error: any) {
      console.error('❌ Error loading businesses:', error.message);
    } finally {
      setLoadingBusinesses(false);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  const getFoodTypeIcon = (foodType: string) => {
    const icons: { [key: string]: any } = {
      Restaurante: 'silverware-fork-knife',
      Cafetería: 'coffee',
      Bar: 'glass-cocktail',
      'Comida Rápida': 'hamburger',
      Panadería: 'baguette',
      Otro: 'store',
    };
    return icons[foodType] || 'store';
  };

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setHasPermission(false);
          setLoading(false);
          return;
        }
        setHasPermission(true);

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Platform.OS === "android" ? Location.Accuracy.Balanced : Location.Accuracy.High,
        });

        const nextRegion: Region = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        };
        setInitialRegion(nextRegion);

        // 2. Obtener contexto de ubicación actual
        const addresses = await Location.reverseGeocodeAsync(loc.coords);
        if (addresses.length > 0) {
          const { city, country } = addresses[0];
          if (city && country) {
            setUserLocationContext(`${city}, ${country}`);
          }
        }

      } catch (e: any) {
        Alert.alert("Error de Ubicación", e?.message ?? "No se pudo obtener la ubicación.");
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("Búsqueda vacía", "Por favor ingrese una dirección o lugar.");
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    try {
      // 3. Añadir contexto a la búsqueda si está disponible
      const fullSearchQuery = userLocationContext 
        ? `${searchQuery}, ${userLocationContext}` 
        : searchQuery;

      const geocodedLocations = await Location.geocodeAsync(fullSearchQuery);
      if (geocodedLocations.length > 0) {
        const { latitude, longitude } = geocodedLocations[0];

        // Usar reverseGeocodeAsync para obtener detalles de la dirección
        const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
        let address = searchQuery; // Fallback a la búsqueda original

        if (addresses.length > 0) {
            const locationDetails = addresses[0];
            // Construir la dirección de forma segura con los datos disponibles
            const addressParts = [
              locationDetails.name,
              locationDetails.street,
              locationDetails.city,
              locationDetails.region,
              locationDetails.country,
            ].filter(Boolean); // Filtra los valores nulos, undefined o vacíos
            
            if (addressParts.length > 0) {
              address = addressParts.join(', ');
            }
        }

        setSearchedLocation({ latitude, longitude, address });

        mapViewRef.current?.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }, 1000);

      } else {
        Alert.alert("Sin resultados", `No se pudo encontrar "${searchQuery}" cerca de ti. Intenta ser más específico.`);
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      Alert.alert("Error de Búsqueda", "Ocurrió un error al buscar la ubicación.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !initialRegion) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Cargando mapa...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>
          Debe permitir el acceso a la ubicación para usar esta función.
        </Text>
        <Text style={styles.permissionSubText}>
          Por favor, habilite los permisos en la configuración de su dispositivo.
        </Text>
      </View>
    );
  }

  if (!initialRegion) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Obteniendo ubicación...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapViewRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {initialRegion && (
          <Marker
            coordinate={{ latitude: initialRegion.latitude, longitude: initialRegion.longitude }}
            title="Estás aquí"
            pinColor="#794646"
          />
        )}
        {searchedLocation && (
          <Marker
            coordinate={{ latitude: searchedLocation.latitude, longitude: searchedLocation.longitude }}
            title={searchQuery}
            description={searchedLocation.address}
            pinColor="#B5A78E"
          />
        )}
        {businesses.map((business) => (
          <Marker
            key={business.id}
            coordinate={{ 
              latitude: business.latitude!, 
              longitude: business.longitude! 
            }}
            title={business.name}
            description={business.address}
          >
            <View style={styles.customMarker}>
              <MaterialCommunityIcons
                name={getFoodTypeIcon(business.foodType || 'Otro')}
                size={24}
                color="#FFFFFF"
              />
            </View>
            <Callout tooltip onPress={() => handleBusinessPress(business.id)}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{business.name}</Text>
                {business.foodType && (
                  <Text style={styles.calloutFoodType}>{business.foodType}</Text>
                )}
                {business.description && (
                  <Text style={styles.calloutDescription} numberOfLines={2}>
                    {business.description}
                  </Text>
                )}
                <Text style={styles.calloutAddress}>{business.address}</Text>
                {user?.role === 'CONSUMER' && (
                  <View style={styles.calloutButtonContainer}>
                    <View style={styles.calloutButton}>
                      <Ionicons name="restaurant" size={16} color="#FFFFFF" />
                      <Text style={styles.calloutButtonText}>Ver Productos</Text>
                    </View>
                  </View>
                )}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar una dirección..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          placeholderTextColor="#79464699"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>
      {(loading || loadingBusinesses) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#794646" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: '#F6FDF0' },
  permissionText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#794646',
  },
  permissionSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  searchContainer: {
    position: 'absolute',
    top: 60,
    left: 15,
    right: 15,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: '#D2C0C0',
  },
  searchInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#794646',
  },
  searchButton: {
    width: 50,
    height: 50,
    backgroundColor: '#794646',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 11,
    borderBottomRightRadius: 11,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customMarker: {
    backgroundColor: '#B5A78E',
    borderRadius: 25,
    padding: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  calloutContainer: {
    padding: 10,
    minWidth: 200,
    maxWidth: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D2C0C0',
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#794646',
    marginBottom: 4,
  },
  calloutFoodType: {
    fontSize: 12,
    color: '#B5A78E',
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  calloutAddress: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  calloutButtonContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  calloutButton: {
    backgroundColor: '#794646',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  calloutButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
