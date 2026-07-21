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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../src/presentation/hooks/useAuth';
import { Validators } from '../../src/utils/validators';
import { Texts } from '../../constants/Texts';
import { Colors } from '../../constants/Colors';

export default function LoginScreen() {
  const { login, isLoading, errorMessage } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.appName}>{Texts.appName}</Text>
      <Text style={styles.welcome}>{Texts.welcome}</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {emailError && <Text style={styles.error}>{emailError}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {passwordError && <Text style={styles.error}>{passwordError}</Text>}

      <TouchableOpacity style={styles.checkboxRow} onPress={() => setRememberMe(!rememberMe)}>
        <Ionicons
          name={rememberMe ? 'checkbox' : 'square-outline'}
          size={22}
          color={Colors.primary}
        />
        <Text style={styles.checkboxLabel}>{Texts.rememberMe}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{Texts.login}</Text>
        )}
      </TouchableOpacity>

      <View style={styles.footerRow}>
        <Text>{Texts.noAccount}</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.link}>{Texts.register}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 40 },
  appName: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  welcome: { fontSize: 20, textAlign: 'center', marginTop: 40, marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  error: { color: Colors.error, fontSize: 12, marginBottom: 8 },
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