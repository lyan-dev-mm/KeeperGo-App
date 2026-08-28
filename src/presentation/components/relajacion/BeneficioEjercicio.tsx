
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../../constants/colors';

interface BeneficiosEjercicioProps {
  beneficios: string[];
}

export default function BeneficiosEjercicio({ beneficios }: BeneficiosEjercicioProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>✨ Beneficios</Text>
      {beneficios.map((beneficio, index) => (
        <View key={index} style={styles.item}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.texto}>{beneficio}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    marginTop: 25,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B4D6B',
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bullet: {
    fontSize: 16,
    color: '#2ECC71',
    marginRight: 10,
  },
  texto: {
    fontSize: 14,
    color: COLORS.gray[600],
    flex: 1,
    lineHeight: 20,
  },
});