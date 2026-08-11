import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, Alert } from 'react-native';

export default function AskLocation({ onAccept, onDecline }) {

  const handleAccept = () => {
    if (onAccept) {
      onAccept();
    } else if (Platform.OS === 'web') {
      window.alert('Navegando a: Formulario de ubicación');
    } else {
      Alert.alert('Acción', 'Navegando al formulario de ubicación...');
    }
  };

  const handleDecline = () => {
    if (onDecline) {
      onDecline();
    } else if (Platform.OS === 'web') {
      window.alert('Omitiendo ubicación...');
    } else {
      Alert.alert('Acción', 'Omitiendo ubicación...');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📍</Text>
          </View>

          <Text style={styles.title}>Encuentra apoyo cerca de ti</Text>
          
          <Text style={styles.description}>
            Con el objetivo de brindarte una experiencia más personalizada, te invitamos a proporcionarnos tu ubicación. Esta información será utilizada de manera confidencial y exclusiva para recomendarte psicólogos y especialistas cercanos a tu zona, en caso de que lo solicites.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleAccept}>
              <Text style={styles.buttonText}>Sí, compartir mi ubicación</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleDecline}>
              <Text style={styles.buttonText}>Por el momento no</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#DDEED2', 
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15, 
  },
  card: {
    backgroundColor: '#D1F5B5',
    paddingVertical: 22,   
    paddingHorizontal: 20,
    borderRadius: 15,
    width: '92%',           
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,       
  },
  icon: {
    fontSize: 24,
  },
  title: {
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#1A1A1A',
  },
  description: {
    fontSize: 13.5,
    textAlign: 'center',
    color: '#333333',
    lineHeight: 19,
    marginBottom: 20,       
  },
  buttonContainer: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#A3D58C',
    paddingVertical: 13,    
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  secondaryButton: {
    backgroundColor: '#A3D58C', 
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
    opacity: 0.85,
  },
  buttonText: {
    color: '#1A1A1A',
    fontWeight: 'bold',
    fontSize: 14.5,
  },
});