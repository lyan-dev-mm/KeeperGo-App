import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
// Importamos el servicio seguro 
import { SecureStorageService } from './src/secureStorage';

export default function App() {

  // El useEffect se ejecuta automáticamente cuando la app se abre
  useEffect(() => {
    async function probarAlmacenamientoSeguro() {
      console.log("=== 🔐 INICIANDO PRUEBA DE ALMACENAMIENTO SEGURO ===");
      
      // 1. Intentamos guardar un token falso de prueba
      const guardadoExitoso = await SecureStorageService.setItem('user_token', 'token_secreto_keepergo_12345');
      
      if (guardadoExitoso) {
        console.log("✅ Paso 1: Datos encriptados y guardados con éxito.");
        
        // 2. Intentamos recuperarlo para verificar que funcione
        const tokenRecuperado = await SecureStorageService.getItem('user_token');
        console.log("✅ Paso 2: Token recuperado desde hardware seguro ->", tokenRecuperado);
      } else {
        console.log("❌ Error: No se pudieron guardar los datos.");
      }
      console.log("====================================================");
    }

    probarAlmacenamientoSeguro();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});