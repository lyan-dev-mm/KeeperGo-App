
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../../../constants/colors';

interface InstruccionesEjercicioProps {
  instrucciones: string[];
  onComenzar: () => void;
  nombre: string;
}

export default function InstruccionesEjercicio({
  instrucciones,
  onComenzar,
  nombre,
}: InstruccionesEjercicioProps) {
  return (
    <View style={styles.container}>

      {instrucciones.map((instruccion, index) => (
        <View key={index} style={styles.item}>
          <View style={styles.numeroContainer}>
            <Text style={styles.numero}>{index + 1}</Text>
          </View>
          <Text style={styles.texto}>{instruccion}</Text>
        </View>
      ))}

      <TouchableOpacity
        style={styles.boton}
        onPress={onComenzar}
        activeOpacity={0.8}
      >
        <Text style={styles.botonText}>Comenzar Ejercicio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.title_black,
    marginBottom: 20,
    textAlign: 'left',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  numeroContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  numero: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    textAlign: 'center',
  },
  texto: {
    flex: 1,
    fontSize: 15,
    color: COLORS.gray[700],
    lineHeight: 22,
  },
  boton: {
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  botonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
});