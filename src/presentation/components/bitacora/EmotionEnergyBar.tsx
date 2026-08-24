// src/presentation/components/bitacora/EmotionEnergyBar.jsx

import React, { JSX } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS, ENERGY_COLORS } from '../../../../constants/colors';

const { width } = Dimensions.get('window');

export interface EmotionEnergyBarProps {
  /** Nivel de energía (1-10) */
  energia: number;
}

export default function EmotionEnergyBar({
   energia,
  }: EmotionEnergyBarProps): JSX.Element {
  const getEnergyColor = (value: number): string => {
    if (value >= 8) return ENERGY_COLORS.high;
    if (value >= 4) return ENERGY_COLORS.medium;
    return ENERGY_COLORS.low;
  };

  const getEnergyLabel = (value: number): string => {
    if (value >= 8) return 'Alta';
    if (value >= 4) return 'Media';
    return 'Baja';
  };

  const barColor = getEnergyColor(energia);

  return (
    <View style={styles.energyContainer}>
      <View style={styles.energyHeader}>
        <Text style={styles.energyTitle}>⚡ Energía</Text>
        <Text style={[styles.energyLevelText, { color: barColor }]}>
          {energia}/10 · {getEnergyLabel(energia)}
        </Text>
      </View>

      <View style={styles.energyBarContainer}>
        <View 
          style={[
            styles.energyBar, 
            { 
              width: `${(energia / 10) * 100}%`,
              backgroundColor: barColor 
            }
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  energyContainer: {
    width: width * 0.75,
    maxWidth: 320,
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginBottom: 12,
  },

  energyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  energyTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.gray[500],
  },

  energyLevelText: {
    fontSize: 14,
    fontWeight: '600',
  },

  energyBarContainer: {
    height: 6,
    backgroundColor: COLORS.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
  },

  energyBar: {
    height: '100%',
    borderRadius: 3,
  },
});