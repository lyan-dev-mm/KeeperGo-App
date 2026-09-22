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
import { useSinglePress } from '../../hooks/useSinglePress';

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
    titulo: '¡Bienvenid@ a la prueba piloto!',
    parrafo1: 'Gracias por ser parte de la prueba piloto de KeeperGo en el ITSCHI.',
    parrafo2: 'Recuerda navegar por KeeperGo todos los días.',
    boton: '¡Sigamos adelante!',
    icono: 'sparkles',
  },
  cierre: {
    titulo: '¡Último día del piloto!',
    parrafo1: 'Gracias por acompañarnos estos 5 días.',
    parrafo2: 'Es momento de contestar unas preguntas. ¡Tu opinión nos ayudará a medir el impacto de KeeperGo!',
    boton: '¡Empecemos!',
    icono: 'flag',
  },
};

export default function BienvenidaPilotoScreen({
  variante,
  onContinue,
}: BienvenidaPilotoScreenProps) {
  const content = CONTENIDO[variante];

  // FIX: doble-tap en este botón disparaba onContinue() dos veces (se veía
  // en los logs "Status guardado" repetido), y el segundo intento de
  // navegación fallaba con "GO_BACK was not handled" porque ya no había
  // pantalla a la cual volver. useSinglePress bloquea el segundo toque de
  // forma síncrona, sin importar qué tan rápido llegue.
  const [handleContinue, isContinuing] = useSinglePress(onContinue);

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
          <Image
            source={require('../../../../assets/images/logo-keeperGo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoPlaceholder}>+</Text>
          <Image
            source={require('../../../../assets/images/logo-itschi.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, isContinuing && styles.primaryButtonDisabled]}
          onPress={handleContinue}
          disabled={isContinuing}
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
  logo: {
    width: 80,
    height: 80,
  },
  logosContainer: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 32,
    alignItems: 'center',
  },
  logoPlaceholder: {
    fontSize: 30,
    fontWeight: '700',
    color: '#eebe44',
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});