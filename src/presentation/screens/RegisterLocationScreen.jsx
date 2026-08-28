import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { router } from 'expo-router';

export default function RegisterLocation() {
  const [modalVisible, setModalVisible] = useState(true);
  const [markerCoordinate, setMarkerCoordinate] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const mapRef = useRef(null);

  const initialRegion = {
    latitude: 19.4326018,
    longitude: -99.1332049,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Función para mostrar el tooltip (mensaje superior) temporalmente
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => setShowTooltip(false), 5000); // Se quita solo a los 5 segundos
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

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
    // Ya no usamos Alert, simplemente mostramos el mensaje contextual arriba
    setShowTooltip(true); 
  };

  const handleMapPress = (event) => {
    if (!modalVisible) {
      setMarkerCoordinate(event.nativeEvent.coordinate);
      setShowTooltip(false); // Ocultamos el tooltip en cuanto coloca el pin
    }
  };

  const handleConfirmLocation = () => {
    if (markerCoordinate) {
      console.log('Coordenadas guardadas:', markerCoordinate);
      
      Alert.alert(
        '¡Ubicación Guardada!',
        'Tu ubicación se ha registrado correctamente. Ya puedes encontrar apoyo cerca de ti.',
        [
          { 
            text: 'Ir al Inicio', 
            onPress: () => router.replace('/(tabs)/home') 
          }
        ]
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
        showsCompass={true}
        toolbarEnabled={false} // Quitamos el botón de Google Maps para que se vea más limpio (puedes ponerlo en true si lo quieres)
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

      {/* --- MENSAJE CONTEXTUAL (TOOLTIP) EN LA PARTE SUPERIOR --- */}
      {showTooltip && !markerCoordinate && (
        <View style={styles.tooltipContainer}>
          <Text style={styles.tooltipText}>
            👆 Toca cualquier punto del mapa para colocar tu ubicación
          </Text>
        </View>
      )}

      {/* --- BOTÓN DE CONFIRMAR --- */}
      {markerCoordinate && (
        <View style={styles.confirmContainer}>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmLocation}>
            <Text style={styles.confirmButtonText}>Confirmar Ubicación</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* --- MODAL DE OPCIONES (LIMPIO Y MODERNO) --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Icono decorativo */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📍</Text>
            </View>
            
            <Text style={styles.modalTitle}>¿Cómo quieres ubicarte?</Text>
            <Text style={styles.modalSubtitle}>
              Selecciona una opción para personalizar tu experiencia.
            </Text>

            <TouchableOpacity style={styles.primaryButton} onPress={handleUseCurrentLocation}>
              <Text style={styles.buttonTextPrimary}>Usar mi ubicación Actual</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleOtherLocation}>
              <Text style={styles.buttonTextSecondary}>Elegir en el mapa</Text>
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
  
  // --- ESTILOS DEL MENSAJE SUPERIOR (TOOLTIP) ---
  tooltipContainer: {
    position: 'absolute',
    top: 60, // Aparece arriba, debajo de la barra de estado
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    zIndex: 10, // Asegura que esté por encima del mapa
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  // --- ESTILOS DEL MODAL ---
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fondo oscuro elegante
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    backgroundColor: '#FFFFFF', // Fondo blanco limpio (ya no verde)
    padding: 25, 
    borderRadius: 24, 
    width: '85%', 
    maxWidth: 350, 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 15, 
    elevation: 10 
  },
  iconContainer: {
    width: 70,
    height: 70,
    backgroundColor: '#E8F5E9', // Fondo verde muy suave para el icono
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  icon: {
    fontSize: 32,
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 8, 
    color: '#1A1A1A',
    textAlign: 'center'
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  primaryButton: { 
    backgroundColor: '#58C759', 
    width: '100%', 
    padding: 16, 
    borderRadius: 14, 
    alignItems: 'center', 
    marginBottom: 12 
  },
  buttonTextPrimary: { 
    color: '#FFFFFF', 
    fontWeight: 'bold', 
    fontSize: 15 
  },
  secondaryButton: { 
    backgroundColor: '#F5F5F5', // Fondo gris muy suave
    width: '100%', 
    padding: 16, 
    borderRadius: 14, 
    alignItems: 'center', 
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  buttonTextSecondary: { 
    color: '#333333', 
    fontWeight: '600', 
    fontSize: 15 
  },
  
  // --- ESTILOS DEL BOTÓN DE CONFIRMAR ---
  confirmContainer: {
    position: 'absolute',
    bottom: 40, // Lo bajamos un poco porque ya no hay un modal encima
    width: '100%',
    paddingHorizontal: 25,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#58C759',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});