
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../../constants/colors';

interface ProgresoFaseProps {
  faseActual: number;
  totalFases: number;
  cicloCompletado: number;
  progreso: number; // 0 a 1
  color: string;
}

export default function ProgresoFase({
  faseActual,
  totalFases,
  cicloCompletado,
  progreso,
  color,
}: ProgresoFaseProps) {
  return (
    <View style={styles.container}>
      <View style={styles.barra}>
        <View
          style={[
            styles.barraFill,
            {
              width: `${Math.min(progreso * 100, 100)}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
      <Text style={styles.texto}>
        Fase {faseActual + 1} de {totalFases} · Ciclo {cicloCompletado + 1}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '82%',
    marginTop: 20,
  },
  barra: {
    height: 6,
    backgroundColor: '#E8ECF0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  barraFill: {
    height: '100%',
    borderRadius: 3,
  },
  texto: {
    fontSize: 13,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginBottom: 10, 
  },
});