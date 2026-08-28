import React, {
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Platform,
} from 'react-native';

import * as Location from 'expo-location';

export default function RegisterLocation() {
  const [modalVisible, setModalVisible] = useState(true);
  const [markerCoordinate, setMarkerCoordinate] = useState(null);
  
  const mapRef = useRef(null);

  const initialRegion = {
    latitude: 19.4326018,
    longitude: -99.1332049,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // =====================================================
  // USAR UBICACIÓN ACTUAL
  // =====================================================

  const handleUseCurrentLocation = async () => {
    try {
      // -------------------------------------------------
      // WEB
      // -------------------------------------------------

      if (Platform.OS === 'web') {
        if (!navigator.geolocation) {
          Alert.alert(
            'Ubicación no disponible',
            'Tu navegador no permite obtener la ubicación.'
          );

          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newCoords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            };

            setMarkerCoordinate(newCoords);

            if (mapRef.current) {
              mapRef.current.animateToRegion(
                newCoords,
                1500
              );
            }

            setModalVisible(false);
          },
          (error) => {
            console.log(
              'Error de geolocalización Web:',
              error
            );

            Alert.alert(
              'Permiso de ubicación',
              'Debes permitir el acceso a tu ubicación desde el navegador.'
            );
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );

        return;
      }

      // -------------------------------------------------
      // ANDROID / IOS
      // -------------------------------------------------

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permiso necesario',
          'Necesitamos acceso a tu ubicación.'
        );

        return;
      }

      const location =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      const newCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      setMarkerCoordinate(newCoords);

      if (mapRef.current) {
        mapRef.current.animateToRegion(
          newCoords,
          1500
        );
      }

      setModalVisible(false);
    } catch (error) {
      console.error(
        'Error obteniendo ubicación:',
        error
      );

      Alert.alert(
        'Error de ubicación',
        'No fue posible obtener tu ubicación. Asegúrate de tener activado el GPS o los permisos de ubicación.'
      );
    }
  };

  // =====================================================
  // OTRA UBICACIÓN
  // =====================================================

  const handleOtherLocation = () => {
    setModalVisible(false);

    Alert.alert(
      'Modo Manual',
      'Toca cualquier punto en el mapa para colocar tu ubicación.'
    );
  };

  // =====================================================
  // TOCAR MAPA
  // =====================================================

  const handleMapPress = (coordinate) => {
    if (modalVisible) {
      return;
    }

    let newCoordinate;

    // -----------------------------------------------
    // WEB
    // -----------------------------------------------

    if (Platform.OS === 'web') {
      newCoordinate = {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
    }

    // -----------------------------------------------
    // ANDROID / IOS
    // -----------------------------------------------

    else {
      newCoordinate = {
        latitude:
          coordinate.nativeEvent.coordinate.latitude,

        longitude:
          coordinate.nativeEvent.coordinate.longitude,

        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
    }

    setMarkerCoordinate(newCoordinate);
  };

  // --- NUEVA FUNCIÓN PARA GUARDAR ---
  const handleConfirmLocation = () => {
    if (!markerCoordinate) {
      Alert.alert(
        '¡Ubicación Guardada!',
        `Latitud: ${markerCoordinate.latitude.toFixed(4)}\nLongitud: ${markerCoordinate.longitude.toFixed(4)}`,
        [{ text: 'Excelente' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* MAPA */}

      <LocationMap
        ref={mapRef}
        initialRegion={initialRegion}
        markerCoordinate={markerCoordinate}
        onMapPress={handleMapPress}
      />

      {/* BOTÓN CONFIRMAR */}

      {markerCoordinate && (
        <View style={styles.confirmContainer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmLocation}
          >
            <Text style={styles.confirmButtonText}>
              Confirmar Ubicación
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MODAL INICIAL */}

      {/* --- MODAL DE OPCIONES (LIMPIO Y MODERNO) --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Ubicación
            </Text>

            {/* UBICACIÓN ACTUAL */}

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleUseCurrentLocation}
            >
              <Text style={styles.buttonText}>
                Usar mi ubicación Actual
              </Text>
            </TouchableOpacity>

            {/* UBICACIÓN MANUAL */}

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleOtherLocation}
            >
              <Text style={styles.buttonText}>
                Otra
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// =======================================================
// ESTILOS
// =======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: '#D1F5B5',
    padding: 25,
    borderRadius: 15,
    width: '80%',
    maxWidth: 350,
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,

    elevation: 5,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },

  primaryButton: {
    backgroundColor: '#A3D58C',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },

  secondaryButton: {
    backgroundColor: '#C5E1A5',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },

  confirmContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    paddingHorizontal: 25,
    alignItems: 'center',
  },

  confirmButton: {
    backgroundColor: '#58C759',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.3,
    shadowRadius: 4,

    elevation: 5,
  },

  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});