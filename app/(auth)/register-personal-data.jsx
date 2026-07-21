import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SecureStorageService } from '../../src/infrastructure/storage/secureStorage';

export default function RegisterPersonalData() {
  const router = useRouter();

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [edad, setEdad] = useState('');

  // Estados de error
  const [errores, setErrores] = useState({});

  const validarFormulario = () => {
    let erroresActivos = {};

    if (!nombre.trim()) {
      erroresActivos.nombre = 'El nombre es obligatorio';
    } else if (nombre.trim().length < 2) {
      erroresActivos.nombre = 'Mínimo 2 caracteres';
    }

    if (!apellidos.trim()) {
      erroresActivos.apellidos = 'Los apellidos son obligatorios';
    } else if (apellidos.trim().length < 2) {
      erroresActivos.apellidos = 'Mínimo 2 caracteres';
    }

    const edadNum = parseInt(edad, 10);
    if (!edad.trim()) {
      erroresActivos.edad = 'La edad es obligatoria';
    } else if (isNaN(edadNum)) {
      erroresActivos.edad = 'Introduce una edad válida';
    } else if (edadNum < 13) {
      erroresActivos.edad = 'Debes tener al menos 13 años';
    }

    setErrores(erroresActivos);
    return Object.keys(erroresActivos).length === 0;
  };

  const handleContinuar = async () => {
    if (validarFormulario()) {
      try {
        const datosPersonales = {
          nombre: nombre.trim(),
          apellidos: apellidos.trim(),
          edad: parseInt(edad, 10)
        };

        await SecureStorageService.setItem('user_personal_data', JSON.stringify(datosPersonales));

        Alert.alert("Éxito", "Datos personales guardados correctamente.");

      } catch (error) {
        Alert.alert("Error", "No se pudieron guardar los datos.");
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.mainBackground}>
      <View style={styles.cardContainer}>
        <Text style={styles.title}>Datos personales</Text>

        {/* Campo: Nombre */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errores.nombre && styles.inputError]}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Nombre completo"
            placeholderTextColor="#999"
          />
          {errores.nombre && <Text style={styles.errorText}>{errores.nombre}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errores.apellidos && styles.inputError]}
            value={apellidos}
            onChangeText={setApellidos}
            placeholder="Apellidos"
            placeholderTextColor="#999"
          />
          {errores.apellidos && <Text style={styles.errorText}>{errores.apellidos}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errores.edad && styles.inputError]}
            value={edad}
            onChangeText={setEdad}
            keyboardType="numeric"
            placeholder="Edad"
            placeholderTextColor="#999"
          />
          {errores.edad && <Text style={styles.errorText}>{errores.edad}</Text>}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleContinuar}>
          <Text style={styles.buttonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainBackground: {
    backgroundColor: '#e2f0d9', // Fondo
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 28,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  inputContainer: {
    marginBottom: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#333',
  },
  inputError: {
    borderColor: '#ff4d4d',
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: 12,
    marginTop: 4,
    paddingLeft: 4,
  },
  button: {
    backgroundColor: '#94b094', // Color de los botones de registro/crear cuenta
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 14,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});