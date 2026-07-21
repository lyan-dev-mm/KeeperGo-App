import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../src/presentation/hooks/useAuth';
import { Validators } from '../../src/utils/validators';
import { Colors } from '../../constants/Colors';

export default function RegisterScreen() {
  const { register, isLoading, errorMessage } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const handleRegister = async () => {
    const nameErr = name.trim().length < 2 ? 'Ingresa al menos 2 caracteres' : null;
    const emailErr = Validators.validateEmail(email);
    const passErr = Validators.validatePassword(password);
    const confirmErr = Validators.validateConfirmPassword(confirm, password);
    setErrors({ name: nameErr, email: emailErr, password: passErr, confirm: confirmErr });

    if (nameErr || emailErr || passErr || confirmErr) return;

    if (!acceptTerms) {
      Alert.alert('Error', 'Debes aceptar los Términos y Condiciones');
      return;
    }

    const success = await register(email.trim(), password.trim(), name.trim());
    if (success) {
      Alert.alert('Registro exitoso', 'Inicia sesión.');
      router.replace('/(auth)/login');
    } else {
      Alert.alert('Error', errorMessage ?? 'Error inesperado');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Crear cuenta</Text>

      <TextInput style={styles.input} placeholder="Nombre completo" value={name} onChangeText={setName} />
      {errors.name && <Text style={styles.error}>{errors.name}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Text style={styles.helper}>
        Debe tener 8 caracteres mínimo, una mayúscula, un número y un carácter especial.
      </Text>
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
      />
      {errors.confirm && <Text style={styles.error}>{errors.confirm}</Text>}

      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text>{birthDate ? birthDate.toLocaleDateString() : 'Fecha de nacimiento (opcional)'}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={birthDate ?? new Date(2000, 0, 1)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={(_, date) => {
            setShowDatePicker(false);
            if (date) setBirthDate(date);
          }}
        />
      )}

      <TouchableOpacity style={styles.checkboxRow} onPress={() => setAcceptTerms(!acceptTerms)}>
        <Ionicons
          name={acceptTerms ? 'checkbox' : 'square-outline'}
          size={22}
          color={Colors.primary}
        />
        <Text style={styles.checkboxText}>
          Acepto los{' '}
          <Text
            style={styles.link}
            onPress={() =>
              router.push({ pathname: '/terms', params: { title: 'Términos y Condiciones' } })
            }
          >
            Términos y Condiciones
          </Text>{' '}
          y las{' '}
          <Text
            style={styles.link}
            onPress={() =>
              router.push({ pathname: '/terms', params: { title: 'Políticas de Privacidad' } })
            }
          >
            Políticas de privacidad
          </Text>
          .
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Regístrate</Text>
        )}
      </TouchableOpacity>

      <View style={styles.footerRow}>
        <Text>¿Ya tienes cuenta? </Text>
        <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.link}>Inicia sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 30 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
    justifyContent: 'center',
  },
  helper: { fontSize: 12, color: '#888', marginBottom: 4 },
  error: { color: Colors.error, fontSize: 12, marginBottom: 8 },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 16 },
  checkboxText: { flex: 1, marginLeft: 8, fontSize: 14 },
  link: { color: Colors.primary, fontWeight: 'bold', textDecorationLine: 'underline' },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
});
