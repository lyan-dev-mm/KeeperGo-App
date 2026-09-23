
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/colors';

interface ControlRespiracionProps {
  isActive: boolean;
  onPausar: () => void;
  onReanudar: () => void;
  onFinalizar?: () => void;
}

export default function ControlRespiracion({
  isActive,
  onPausar,
  onReanudar,
  onFinalizar,
}: ControlRespiracionProps) {
  return (
    <View style={styles.container}>
      {/* Botón Pausar/Reanudar */}
      {isActive ? (
        <TouchableOpacity 
          style={[styles.button, styles.pausarButton]} 
          onPress={onPausar}
          activeOpacity={0.7}
        >
          <Ionicons name="pause-circle" size={28} color="#FFFFFF" />
          <Text style={styles.buttonText}>Pausar</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={[styles.button, styles.reanudarButton]} 
          onPress={onReanudar}
          activeOpacity={0.7}
        >
          <Ionicons name="play-circle" size={28} color="#FFFFFF" />
          <Text style={styles.buttonText}>Reanudar</Text>
        </TouchableOpacity>
      )}

      {onFinalizar && (
        <TouchableOpacity 
          style={[styles.button, styles.finalizarButton]} 
          onPress={onFinalizar}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark-circle" size={28} color="#FFFFFF" />
          <Text style={styles.buttonText}>Finalizar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  pausarButton: {
    backgroundColor: COLORS.blue_second,
    shadowColor: COLORS.blue_second,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  reanudarButton: {
    backgroundColor: COLORS.blue,
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  finalizarButton: {
    backgroundColor: COLORS.blue_dark,
    shadowColor: COLORS.blue_dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 10,
  },
});