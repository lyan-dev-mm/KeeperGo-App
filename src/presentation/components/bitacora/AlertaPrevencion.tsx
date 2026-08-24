
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../../constants/colors';

export type NivelAlerta = 'bajo' | 'medio' | 'alto';

export interface Alerta {
  tipo: string;
  nivel: NivelAlerta;
  mensaje: string;
  sugerencia: string;
  timestamp: string;
}

interface AlertaPrevencionProps {
  alerta: Alerta;
}

export default function AlertaPrevencion({ alerta } : AlertaPrevencionProps) {
  const getColor = (nivel: NivelAlerta) => {
    switch(nivel) {
      case 'bajo': return '#A0ED85';   // Verde Keeper Go
      case 'medio': return '#FCD34D';  // Amarillo suave
      case 'alto': return '#F59E0B';   // Naranja cálido
      default: return COLORS.gray[300];
    }
  };

  const getNivelTexto = (nivel: NivelAlerta) => {
    switch(nivel) {
      case 'bajo': return 'Seguimiento';
      case 'medio': return 'Acompañamiento';
      case 'alto': return 'Atención';
      default: return 'Información';
    }
  };

  return (
    <View style={[styles.container, { borderLeftColor: getColor(alerta.nivel) }]}>
      <View style={styles.header}>
        <Text style={[styles.nivel, { color: getColor(alerta.nivel) }]}>
          {getNivelTexto(alerta.nivel)}
        </Text>
      </View>

      <Text style={styles.mensaje}>{alerta.mensaje}</Text>

      {alerta.sugerencia && (
        <View style={styles.sugerenciaContainer}>
          <Text style={styles.sugerencia}>{alerta.sugerencia}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginVertical: 6,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  nivel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  mensaje: {
    fontSize: 14,
    color: COLORS.gray[700],
    lineHeight: 20,
    marginBottom: 8,
  },
  sugerenciaContainer: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
  },
  sugerencia: {
    fontSize: 13,
    color: COLORS.gray[600],
    lineHeight: 18,
  },
});