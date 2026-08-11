import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Importamos tus dos pantallas
import AskLocation from './app/(auth)/ask-location';
import RegisterLocation from './app/(auth)/register-location';

export default function App() {
  // Estado para controlar qué pantalla se muestra
  const [currentScreen, setCurrentScreen] = useState('askLocation');

  return (
    <View style={styles.container}>
      {/* Lógica de navegación simple */}
      {currentScreen === 'askLocation' ? (
        <AskLocation 
          onAccept={() => setCurrentScreen('registerLocation')} 
          onDecline={() => console.log('Aquí irá la siguiente pantalla del equipo')} 
        />
      ) : (
        <RegisterLocation />
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});