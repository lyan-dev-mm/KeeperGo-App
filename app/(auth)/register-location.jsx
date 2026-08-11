import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';

export default function RegisterLocation() {
  const [modalVisible, setModalVisible] = useState(true);

  // Función para pedir permiso y obtener la ubicación
  const handleUseCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permiso necesario',
        'Necesitamos acceso a tu ubicación para recomendarte especialistas cercanos. Puedes activarlo en la configuración de tu teléfono.',
        [{ text: 'Entendido' }]
      );
      return;
    }

    // 2. Si nos dan permiso, leemos el GPS
    try {
      let location = await Location.getCurrentPositionAsync({});
      console.log('¡Éxito! Coordenadas exactas:', location.coords);
      
      Alert.alert('¡Ubicación leída!');
      
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error de GPS', 'No pudimos leer tu ubicación. Asegúrate de tener el GPS encendido.');
    }
  };

  const handleOtherLocation = () => {
    // Si elige "Otra", solo ocultamos el modal para dejarlo mover el mapa libremente
    setModalVisible(false);
    console.log('El usuario eligió seleccionar su ubicación manualmente.');
  };

  return (
    <View style={styles.container}>
      
      {/* El Mapa de fondo (ocupará toda la pantalla) */}
      <MapView style={styles.map} />

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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Fondo oscuro semitransparente
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#D1F5B5', // Verde brillante de tu imagen
    padding: 25,
    borderRadius: 15,
    width: '80%',
    maxWidth: 350,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
});