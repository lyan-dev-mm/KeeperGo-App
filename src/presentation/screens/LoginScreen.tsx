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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { Validators } from '../../utils/validators';
import { Texts } from '../../../constants/Texts';
import { Colors} from '../../../constants/colors';

export default function LoginScreen() {
  const { login, isLoading, errorMessage } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleLogin = async () => {
    const eErr = Validators.validateEmail(email);
    const pErr = Validators.validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    const success = await login(email.trim(), password.trim());
    if (success) {
      router.replace('/(tabs)/home');
    } else {
      Alert.alert('Error', errorMessage ?? 'Error inesperado');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} style={styles.scrollBackground}>
      <Image
        source={require('../../../assets/images/LogoKepperGo.jpeg')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.welcome}>Bienvenido</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {emailError && <Text style={styles.error}>{emailError}</Text>}

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#9E9E9E"
          />
        </TouchableOpacity>
      </View>
      {passwordError && <Text style={styles.error}>{passwordError}</Text>}

      <TouchableOpacity style={styles.checkboxRow} onPress={() => setRememberMe(!rememberMe)}>
        <Ionicons
          name={rememberMe ? 'checkbox' : 'square-outline'}
          size={22}
          color={Colors.primary}
        />
        <Text style={styles.checkboxLabel}>Recordarme</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        )}
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>o continuar con</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.socialRow}>
        <Ionicons name="logo-google" size={36} color="#DB4437" />
        <Ionicons name="logo-facebook" size={36} color="#4267B2" style={{ marginLeft: 20 }} />
      </View>

      <View style={styles.footerRow}>
        <Text>¿No tienes cuenta? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.link}>Regístrate</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollBackground: { backgroundColor: '#fff' },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 40 },
  logo: { width: 300, height: 300, alignSelf: 'center', marginBottom: 0 },
  welcome: { fontSize: 20, textAlign: 'center', marginTop: 10, marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#CCC', borderRadius: 8, padding: 12, marginBottom: 8 },
  error: { color: Colors.error, fontSize: 12, marginBottom: 8 },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    marginBottom: 8,
  },
  passwordInput: { flex: 1, padding: 12 },
  eyeButton: { paddingHorizontal: 12 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  checkboxLabel: { marginLeft: 8 },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  divider: { flex: 1, height: 1, backgroundColor: '#DDD' },
  dividerText: { marginHorizontal: 10, color: '#888' },
  socialRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  link: { fontWeight: 'bold', marginLeft: 4, color: Colors.primary },
});