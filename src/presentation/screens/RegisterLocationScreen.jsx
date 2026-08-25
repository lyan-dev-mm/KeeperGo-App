import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
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

  const handleUseCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tu ubicación.');
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({});
      
      const newCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005, 
        longitudeDelta: 0.005,
      };

      setMarkerCoordinate(newCoords);
      
      if (mapRef.current) {
        mapRef.current.animateToRegion(newCoords, 1500);
      }
      
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error de GPS', 'Asegúrate de tener la ubicación encendida en tu celular.');
    }
  };

  const handleOtherLocation = () => {
    setModalVisible(false);
    Alert.alert('Modo Manual', 'Toca cualquier punto en el mapa para colocar tu ubicación.');
  };

  const handleMapPress = (event) => {
    if (!modalVisible) {
      setMarkerCoordinate(event.nativeEvent.coordinate);
    }
  };

  // --- NUEVA FUNCIÓN PARA GUARDAR ---
  const handleConfirmLocation = () => {
    if (markerCoordinate) {
      // Aquí es donde en el futuro enviarás las coordenadas a tu base de datos
      console.log('Coordenadas listas para guardar:', markerCoordinate);
      
      Alert.alert(
        '¡Ubicación Guardada!',
        `Latitud: ${markerCoordinate.latitude.toFixed(4)}\nLongitud: ${markerCoordinate.longitude.toFixed(4)}`,
        [{ text: 'Excelente' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      
      <MapView 
        ref={mapRef} 
        provider={PROVIDER_GOOGLE} 
        style={styles.map} 
        initialRegion={initialRegion} 
        showsUserLocation={true}
        showsMyLocationButton={true}
        onPress={handleMapPress}
      >
        {markerCoordinate && (
          <Marker 
            coordinate={markerCoordinate} 
            title="Tu ubicación elegida" 
            pinColor="red"
          />
        )}
      </MapView>

      {/* --- NUEVO BOTÓN DE CONFIRMAR --- */}
      {/* Solo se muestra si el usuario ya tiene un pin en el mapa */}
      {markerCoordinate && (
        <View style={styles.confirmContainer}>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmLocation}>
            <Text style={styles.confirmButtonText}>Confirmar Ubicación</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ubicación</Text>

            <TouchableOpacity style={styles.primaryButton} onPress={handleUseCurrentLocation}>
              <Text style={styles.buttonText}>Usar mi ubicación Actual</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleOtherLocation}>
              <Text style={styles.buttonText}>Otra</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { width: '100%', height: '100%' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#D1F5B5', padding: 25, borderRadius: 15, width: '80%', maxWidth: 350, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: '#000' },
  primaryButton: { backgroundColor: '#A3D58C', width: '100%', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  secondaryButton: { backgroundColor: '#C5E1A5', width: '100%', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  
  // --- ESTILOS DEL NUEVO BOTÓN ---
  confirmContainer: {
    position: 'absolute',
    bottom: 40, // Se separa del borde inferior
    width: '100%',
    paddingHorizontal: 20,
  },
  confirmButton: {
    backgroundColor: '#58C759', // Verde oscuro estilo Hábitos
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});