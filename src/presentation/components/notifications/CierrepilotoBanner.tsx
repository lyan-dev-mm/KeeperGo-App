import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../../../../constants/colors';
import { usePilotoStatus } from '../../hooks/usePilotoStatus';
import { useAuth } from '../../contexts/AuthContext';

export function CierrePilotoBanner() {
  const router = useRouter();
  const { user } = useAuth();
  const { debeMostrarBannerCierre, progreso } = usePilotoStatus(user?.id);

  if (!debeMostrarBannerCierre) return null;

  const esPrimeraVez = progreso.completados === 0;
  const faltantes = progreso.total - progreso.completados;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        if (esPrimeraVez) {
          router.push({
            pathname: '/(modals)/BienvenidaPiloto',
            params: { variante: 'cierre' },
          });
        } else {
          // Retomar el cierre en el paso pendiente
          router.push('/(modals)/CierrePiloto');
        }
      }}
      activeOpacity={0.85}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="flag" size={26} color="#FFFFFF" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.titulo}>
          {esPrimeraVez ? '¡Último día del piloto!' : 'Continúa tu cierre'}
        </Text>
        <Text style={styles.subtitulo}>
          {esPrimeraVez
            ? 'Completa tu cierre en 8 minutos.'
            : `Faltan ${faltantes} ${faltantes === 1 ? 'paso' : 'pasos'} para terminar.`}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eebe44',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    gap: 12,
    shadowColor: '#eebe44',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: { flex: 1 },
  titulo: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  subtitulo: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
  },
});