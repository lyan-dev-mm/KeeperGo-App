// src/presentation/components/survey/SurveyProgress.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../../constants/colors';

interface SurveyProgressProps {
  /** Paso actual (1-based) */
  current: number;
  /** Total de pasos */
  total: number;
  /** Etiqueta del paso actual, ej. "SUS" */
  label?: string;
}

export function SurveyProgress({ current, total, label }: SurveyProgressProps) {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepText}>
          Paso {current} de {total}
        </Text>
        {label ? <Text style={styles.labelText}>{label}</Text> : null}
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#514343',
  },
  labelText: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gray[100],
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#eebe44',
    borderRadius: 3,
  },
});