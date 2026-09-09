import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { Colors } from '../../../constants/colors';

const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyEmailScreen() {
  const { user, sendVerificationEmail, refreshUser, logout } = useAuth();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const goToNextScreen = () => {
    if (next === 'ask-location') {
      router.replace('/ask-location');
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const handleCheckVerification = async () => {
    setIsChecking(true);
    try {
      const result = await refreshUser();
      if (result?.emailVerified) {
        goToNextScreen();
      } else {
        Alert.alert(
          'Todavía no verificado',
          'No detectamos la verificación todavía. Revisa tu bandeja de entrada (y spam) y confirma que hayas tocado el enlace.'
        );
      }
    } catch {
      Alert.alert('Error', 'No se pudo comprobar el estado de tu correo. Intenta de nuevo.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await sendVerificationEmail();
      setCooldown(RESEND_COOLDOWN_SECONDS);
      Alert.alert('Correo enviado', 'Te enviamos un nuevo correo de verificación.');
    } catch {
      Alert.alert('Error', 'No se pudo reenviar el correo. Intenta de nuevo en un momento.');
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/home');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="mail-outline" size={40} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Verifica tu correo</Text>
        <Text style={styles.description}>
          Enviamos un enlace de verificación a{'\n'}
          <Text style={styles.emailText}>{user?.email}</Text>
          {'\n\n'}Revisa en Spam ábrelo y confirma tu correo para poder usar KeeperGo.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleCheckVerification}
          disabled={isChecking}
        >
          {isChecking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Ya verifiqué mi correo</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleResend}
          disabled={isResending || cooldown > 0}
        >
          {isResending ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <Text style={styles.secondaryButtonText}>
              {cooldown > 0 ? `Reenviar correo (${cooldown}s)` : 'Reenviar correo de verificación'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Usar otra cuenta / Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F8ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: 'rgba(0,0,0,0.87)', marginBottom: 12 },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 30,
  },
  emailText: { fontWeight: 'bold', color: 'rgba(0,0,0,0.8)' },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
  },
  primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  secondaryButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  secondaryButtonText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  logoutButton: { marginTop: 24 },
  logoutText: { color: '#9E9E9E', fontSize: 13, textDecorationLine: 'underline' },
});