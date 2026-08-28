import React, { useState, useEffect } from 'react';
import { Platform, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Specialist } from '../../../constants/Specialists';
import * as Location from 'expo-location';

// --------------------------------------------
// Componente web (react-leaflet)
// --------------------------------------------
const WebMap = ({ specialists, onMarkerPress, userLocation }: {
  specialists: Specialist[];
  onMarkerPress: (id: string) => void;
  userLocation: { lat: number; lng: number } | null;
}) => {
  // Importamos dinámicamente para evitar problemas en móvil
  const { MapContainer, TileLayer, Marker, Popup } = require('react-leaflet');
  const L = require('leaflet');

  // Fix para los iconos de leaflet en web
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  });

  // Centro: si tenemos ubicación, usarla; si no, usar CDMX (por defecto)
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [19.4326, -99.1332];

  return (
    <MapContainer center={center} zoom={userLocation ? 14 : 12} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>Tu ubicación</Popup>
        </Marker>
      )}
      {specialists.map((spec) => {
        // Simulamos coordenadas alrededor de la ubicación del usuario (o del centro)
        const baseLat = userLocation ? userLocation.lat : center[0];
        const baseLng = userLocation ? userLocation.lng : center[1];
        // Generamos coordenadas basadas en distancia (para demo)
        const lat = baseLat + (spec.distanceKm * 0.008) * (spec.id === '1' ? 1 : spec.id === '2' ? -1 : 0.5);
        const lng = baseLng + (spec.distanceKm * 0.012) * (spec.id === '3' ? 1 : spec.id === '4' ? -1 : -0.5);
        return (
          <Marker
            key={spec.id}
            position={[lat, lng]}
            eventHandlers={{
              click: () => onMarkerPress(spec.id),
            }}
          >
            <Popup>
              <View style={{ padding: 6 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 14 }}>{spec.name}</Text>
                <Text style={{ fontSize: 12 }}>{spec.specialty}</Text>
                <Text style={{ fontSize: 12 }}>📍 {spec.distanceKm} km</Text>
              </View>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

// --------------------------------------------
// Componente móvil (react-native-maps + expo-location)
// --------------------------------------------
const MobileMap = ({ specialists, onMarkerPress }: {
  specialists: Specialist[];
  onMarkerPress: (id: string) => void;
}) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Solicitar permisos
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permiso de ubicación denegado');
        setLoading(false);
        return;
      }

      // Obtener ubicación actual
      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(loc);
      } catch (error) {
        setErrorMsg('Error al obtener ubicación');
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
      </View>
    );
  }

  if (errorMsg || !location) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMsg || 'Ubicación no disponible'}</Text>
        <Text style={styles.errorSubtext}>Mostrando mapa con ubicación por defecto</Text>
        {/* Podríamos mostrar un mapa con coordenadas por defecto si queremos */}
      </View>
    );
  }

  // Importamos react-native-maps dinámicamente (para evitar problemas)
  const MapView = require('react-native-maps').default;
  const { Marker } = require('react-native-maps');

  // Coordenadas del usuario
  const userCoords = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        ...userCoords,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      showsUserLocation={true}
      showsMyLocationButton={true}
    >
      {specialists.map((spec) => {
        // Simulamos coordenadas alrededor de la ubicación real del usuario
        const lat = userCoords.latitude + (spec.distanceKm * 0.008) * (spec.id === '1' ? 1 : spec.id === '2' ? -1 : 0.5);
        const lng = userCoords.longitude + (spec.distanceKm * 0.012) * (spec.id === '3' ? 1 : spec.id === '4' ? -1 : -0.5);
        return (
          <Marker
            key={spec.id}
            coordinate={{ latitude: lat, longitude: lng }}
            title={spec.name}
            description={`${spec.specialty} - ${spec.distanceKm} km`}
            onPress={() => onMarkerPress(spec.id)}
          />
        );
      })}
    </MapView>
  );
};

// --------------------------------------------
// Componente principal que elige según plataforma
// --------------------------------------------
export default function MapComponent({ specialists, onMarkerPress }: {
  specialists: Specialist[];
  onMarkerPress: (id: string) => void;
}) {
  // Para web, pasamos la ubicación del usuario (si la tenemos)
  // Como en web no tenemos ubicación real, usaremos null (se centrará en CDMX)
  if (Platform.OS === 'web') {
    return <WebMap specialists={specialists} onMarkerPress={onMarkerPress} userLocation={null} />;
  }
  return <MobileMap specialists={specialists} onMarkerPress={onMarkerPress} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});