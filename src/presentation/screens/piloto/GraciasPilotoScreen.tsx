// src/presentation/screens/piloto/GraciasPilotoScreen.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/colors';
import { useDASS21Store } from '../../store/dass21Store';
import { useSinglePress } from '../../hooks/useSinglePress';

export default function GraciasPilotoScreen() {
  const router = useRouter();
  const { responses } = useDASS21Store();

  const inicial = responses.find((r) => r.tipo === 'inicial');
  const final = responses.find((r) => r.tipo === 'final');

  const mostrarResumen = inicial && final;

  // Mismo patrón que en BienvenidaPilotoScreen: evita que un doble-tap
  // dispare dos navegaciones (router.replace) en quick succession.
  const [handleVolver, isNavigating] = useSinglePress(() => {
    router.replace('/(tabs)/home');
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="heart" size={48} color="#eebe44" />
        </View>

        <Text style={styles.titulo}>¡Gracias por participar!</Text>

        <Text style={styles.parrafo}>
          Tu participación en la prueba piloto de Keeper Go nos ayuda a construir una
          herramienta de acompañamiento en salud mental más humana y accesible.
        </Text>

        {mostrarResumen ? (
          <View style={styles.resumenCard}>
            <Text style={styles.resumenTitulo}>Tu progreso en el piloto</Text>
            <View style={styles.resumenRow}>
              <View style={styles.resumenItem}>
                <Text style={styles.resumenLabel}>Día 1</Text>
                <Text style={styles.resumenValor}>{inicial!.puntuacionTotal}</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={COLORS.gray[400]} />
              <View style={styles.resumenItem}>
                <Text style={styles.resumenLabel}>Día 5</Text>
                <Text style={[
                  styles.resumenValor,
                  final!.puntuacionTotal < inicial!.puntuacionTotal && styles.resumenMejora,
                ]}>
                  {final!.puntuacionTotal}
                </Text>
              </View>
            </View>
            <Text style={styles.resumenNota}>
              {final!.puntuacionTotal < inicial!.puntuacionTotal
                ? 'Tu bienestar mejoró durante el piloto. ¡Sigue así!'
                : final!.puntuacionTotal === inicial!.puntuacionTotal
                ? 'Tu bienestar se mantuvo estable. ¡Buen trabajo!'
                : 'El camino del bienestar tiene altibajos. Tu participación cuenta.'}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, isNavigating && styles.primaryButtonDisabled]}
          onPress={handleVolver}
          disabled={isNavigating}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryText}>Volver al inicio</Text>
          <Ionicons name="home" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF5' },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fcecbb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  titulo: {
    fontSize: 26,
    fontWeight: '800',
    color: '#514343',
    textAlign: 'center',
  },
  parrafo: {
    fontSize: 15,
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
    paddingHorizontal: 12,
  },
  resumenCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#eebe44',
    marginTop: 16,
    gap: 12,
  },
  resumenTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#514343',
    textAlign: 'center',
  },
  resumenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  resumenItem: {
    alignItems: 'center',
    gap: 4,
  },
  resumenLabel: {
    fontSize: 12,
    color: COLORS.gray[500],
    fontWeight: '600',
  },
  resumenValor: {
    fontSize: 32,
    fontWeight: '800',
    color: '#514343',
  },
  resumenMejora: {
    color: '#2E7D32',
  },
  resumenNota: {
    fontSize: 12,
    color: COLORS.gray[600],
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eebe44',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#eebe44',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});