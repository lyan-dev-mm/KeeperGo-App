import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RachaScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="trophy-outline" size={80} color="#fff" />
      <Text style={styles.title}>¡Mantén tu racha!</Text>
      <Text style={styles.subtitle}>Aquí irá el registro de tu racha de días.</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D4ECCC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: 20 },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 16, textAlign: 'center', marginTop: 10 },
  button: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 40,
    paddingVertical: 16,
    marginTop: 30,
  },
  buttonText: { color: '#2196F3', fontWeight: 'bold' },
});