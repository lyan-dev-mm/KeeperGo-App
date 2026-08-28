
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../../constants/colors';

interface InfoFaseProps {
  fase: 'inhalar' | 'mantener' | 'exhalar';
  segundosRestantes: number;
  getFaseTexto: (fase: string) => string;
}

export default function InfoFase({
  fase,
  segundosRestantes,
  getFaseTexto,
}: InfoFaseProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.faseTexto}>{getFaseTexto(fase)}</Text>
      <Text style={styles.faseTiempo}>{segundosRestantes}s</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    alignItems: 'center',
  },
  faseTexto: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1B4D6B',
    marginBottom: 10,
  },
  faseInstruccion: {
    fontSize: 16,
    color: '#4A90D9',
    marginBottom: 4,
    fontWeight: '500',
  },
  faseTiempo: {
    fontSize: 48,
    fontWeight: '800',
    color: '#4A90D9',
  },
});