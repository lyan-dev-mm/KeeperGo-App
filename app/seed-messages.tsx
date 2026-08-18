import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { seedMotivationalMessagesIfNeeded } from '../src/data/seed/mascota/seedMotivationalMessages';

export default function SeedMessagesScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSeed = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const { seeded, count } = await seedMotivationalMessagesIfNeeded();
      setResult(
        seeded
          ? `✅ Se sembraron ${count} mensajes correctamente.`
          : 'ℹ️ Ya existían mensajes sembrados, no se duplicó nada.'
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo sembrar la base de datos. Revisa la consola.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sembrar mensajes motivacionales</Text>
      <Text style={styles.subtitle}>
        Pantalla temporal de uso interno. Presiona el botón una sola vez y luego bórrala del proyecto.
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleSeed} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sembrar base de datos</Text>
        )}
      </TouchableOpacity>
      {result && <Text style={styles.result}>{result}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#9E9E9E', marginBottom: 24, lineHeight: 18 },
  button: { backgroundColor: '#4CAF50', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  result: { marginTop: 20, fontSize: 14, textAlign: 'center' },
});