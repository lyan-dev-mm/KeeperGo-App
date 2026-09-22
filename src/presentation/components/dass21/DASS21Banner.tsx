// src/presentation/components/dass21/DASS21Banner.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../../../../constants/colors';

interface DASS21BannerProps {
  /** Tipo de DASS-21 pendiente */
  tipo: 'inicial' | 'final';
  /** Días restantes (solo para el final) */
  diasRestantes?: number | null;
  /** Callback opcional al presionar */
  onPress?: () => void;
}

export function DASS21Banner({ tipo, diasRestantes, onPress }: DASS21BannerProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push({
        pathname: '/(modals)/DASS21',
        params: { tipo },
      });
    }
  };

  const esInicial = tipo === 'inicial';

  return (
    <TouchableOpacity
      style={[styles.container, esInicial ? styles.containerInicial : styles.containerFinal]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, esInicial ? styles.iconInicial : styles.iconFinal]}>
        <Ionicons 
          name={esInicial ? 'clipboard-outline' : 'time-outline'} 
          size={24} 
          color="#FFFFFF" 
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.titulo}>
          {esInicial 
            ? '¡Completa tu cuestionario inicial!' 
            : '¡Es hora de tu cuestionario final!'}
        </Text>
        <Text style={styles.subtitulo}>
          {esInicial
            ? 'Ayúdanos a conocer cómo te sientes. Solo toma 5 minutos.'
            : `Han pasado 5 días. Completa el cuestionario final.`}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={24} color={COLORS.primaryDark} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginVertical: 8,
    borderWidth: 1.5,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  containerInicial: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  containerFinal: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInicial: {
    backgroundColor: '#4CAF50',
  },
  iconFinal: {
    backgroundColor: '#FF9800',
  },
  textContainer: {
    flex: 1,
  },
  titulo: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.title_black,
    marginBottom: 3,
  },
  subtitulo: {
    fontSize: 12,
    color: COLORS.gray[600],
    lineHeight: 16,
  },
});