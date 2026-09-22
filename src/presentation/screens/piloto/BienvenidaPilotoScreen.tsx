// src/presentation/screens/piloto/BienvenidaPilotoScreen.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/colors';

export type BienvenidaVariante = 'inicio' | 'cierre';

interface BienvenidaPilotoScreenProps {
  variante: BienvenidaVariante;
  onContinue: () => void;
}

const CONTENIDO: Record<BienvenidaVariante, {
  titulo: string;
  parrafo1: string;
  parrafo2: string;
  boton: string;
  icono: keyof typeof Ionicons.glyphMap;
}> = {
  inicio: {
    titulo: '¡Bienvenido/a al piloto!',
    parrafo1: 'Gracias por ser parte de la prueba piloto de Keeper Go en el ITSCHI.',
    parrafo2: 'Prueba los módulos todos los días. Recuerda ser amable contigo.',
    boton: '¡Sigamos adelante!',
    icono: 'sparkles',
  },
  cierre: {
    titulo: '¡Último día del piloto!',
    parrafo1: 'Gracias por acompañarnos estos 5 días.',
    parrafo2: 'Solo faltan unos minutos para completar tu cierre. Tu opinión nos ayuda a mejorar Keeper Go.',
    boton: '¡Empecemos!',
    icono: 'flag',
  },
};

export default function BienvenidaPilotoScreen({
  variante,
  onContinue,
}: BienvenidaPilotoScreenProps) {
  const content = CONTENIDO[variante];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name={content.icono} size={40} color="#eebe44" />
        </View>

        <Text style={styles.titulo}>{content.titulo}</Text>

        <Text style={styles.parrafo}>{content.parrafo1}</Text>
        <Text style={styles.parrafo}>{content.parrafo2}</Text>

        <View style={styles.logosContainer}>
          <Text style={styles.logoPlaceholder}>[Logo ITSCHI]</Text>
          <Text style={styles.logoPlaceholder}>[Logo Keeper Go]</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryText}>{content.boton}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fcecbb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#514343',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  parrafo: {
    fontSize: 15,
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  logosContainer: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 32,
    alignItems: 'center',
  },
  logoPlaceholder: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray[400],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 8,
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
  primaryText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});