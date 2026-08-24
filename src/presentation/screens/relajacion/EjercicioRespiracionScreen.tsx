
import React, { useState, useEffect, useRef, useCallback, JSX } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Vibration,
  Dimensions,
  StatusBar,
  ScrollView,
  Easing,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../../../constants/colors';
import { useRelajacionStore } from '../../store/relajacionStore';

import BolitaRespiracion from '../../components/relajacion/BolitaRespiracion';
import InfoFase from '../../components/relajacion/InfoBase';
import ProgresoFase from '../../components/relajacion/ProgresoFase';
import ControlRespiracion from '../../components/relajacion/ControlRespiracion';
import InstruccionesEjercicio from '../../components/relajacion/InstruccionesEjercicio';
import BeneficiosEjercicio from '../../components/relajacion/BeneficioEjercicio';

const { width } = Dimensions.get('window');

export default function EjercicioRespiracionScreen(): JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams();
  const ejercicioId = params.ejercicioId as string;

  const { getEjercicioPorId, iniciarEjercicio, completarEjercicio } =
    useRelajacionStore();
  const ejercicio = getEjercicioPorId(ejercicioId);

  // Estados
  const [isActive, setIsActive] = useState(false);
  const [faseActual, setFaseActual] = useState(0);
  const [segundosRestantes, setSegundosRestantes] = useState(0);
  const [duracionFaseActual, setDuracionFaseActual] = useState(0);
  const [cicloCompletado, setCicloCompletado] = useState(0);
  const [showInstrucciones, setShowInstrucciones] = useState(true);

  // Animaciones
  const animatedScale = useRef(new Animated.Value(0)).current;
  const animatedGlow = useRef(new Animated.Value(0)).current;
  const animacionRef = useRef<Animated.CompositeAnimation | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getFaseTexto = (fase: string): string => {
    const map: Record<string, string> = {
      inhalar: 'Inhala',
      mantener: 'Mantén',
      exhalar: 'Exhala',
    };
    return map[fase] || '';
  };

  const getFaseColor = (fase: string): string => {
    const map: Record<string, string> = {
      inhalar: COLORS.primary,
      mantener: COLORS.primary,
      exhalar: COLORS.primary,
    };
    return map[fase] || '#4A90D9';
  };

  const iniciarAnimacionFase = useCallback(
    (duracion: number, tipoFase: string) => {
      if (animacionRef.current) animacionRef.current.stop();

      animatedScale.setValue(0);
      animatedGlow.setValue(0);

      const duracionMs = duracion * 1000;

      const scaleAnim = Animated.timing(animatedScale, {
        toValue: 1,
        duration: duracionMs,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      });

      const glowAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedGlow, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animatedGlow, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      if (tipoFase === 'mantener') {
        animacionRef.current = glowAnim;
        glowAnim.start();
      } else {
        animacionRef.current = Animated.parallel([scaleAnim, glowAnim]);
        animacionRef.current.start();
      }
    },
    [animatedScale, animatedGlow]
  );

  const cambiarFase = useCallback(() => {
    if (!ejercicio) return;

    const nextFase = faseActual + 1;
    if (nextFase >= ejercicio.fases.length) {
      setCicloCompletado((c) => c + 1);
      setFaseActual(0);
      const primeraFase = ejercicio.fases[0];
      if (primeraFase) {
        setSegundosRestantes(primeraFase.duracion);
        setDuracionFaseActual(primeraFase.duracion);
        iniciarAnimacionFase(primeraFase.duracion, primeraFase.tipo);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Vibration.vibrate(200);
      return;
    }

    setFaseActual(nextFase);
    const siguienteFase = ejercicio.fases[nextFase];
    if (siguienteFase) {
      setSegundosRestantes(siguienteFase.duracion);
      setDuracionFaseActual(siguienteFase.duracion);
      iniciarAnimacionFase(siguienteFase.duracion, siguienteFase.tipo);
    }
  }, [ejercicio, faseActual, iniciarAnimacionFase]);

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    let tiempoRestante = segundosRestantes;
    intervalRef.current = setInterval(() => {
      tiempoRestante -= 0.1;
      setSegundosRestantes(Math.ceil(Math.max(0, tiempoRestante)));
      if (tiempoRestante <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        cambiarFase();
      }
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, segundosRestantes, cambiarFase]);

  useEffect(() => {
    if (ejercicio) {
      iniciarEjercicio(ejercicio.id);
      const primeraFase = ejercicio.fases[0];
      if (primeraFase) {
        setSegundosRestantes(primeraFase.duracion);
        setDuracionFaseActual(primeraFase.duracion);
      }
    }
  }, [ejercicio]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animacionRef.current) animacionRef.current.stop();
    };
  }, []);

  const iniciarEjercicioHandler = () => {
    setIsActive(true);
    setShowInstrucciones(false);
    const primeraFase = ejercicio?.fases[0];
    if (primeraFase) {
      iniciarAnimacionFase(primeraFase.duracion, primeraFase.tipo);
    }
  };

  const pausarEjercicio = () => {
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (animacionRef.current) animacionRef.current.stop();
  };

  const reanudarEjercicio = () => {
    setIsActive(true);
    const faseData = ejercicio?.fases[faseActual];
    if (faseData) {
      iniciarAnimacionFase(segundosRestantes, faseData.tipo);
    }
  };

  const finalizarEjercicio = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (animacionRef.current) animacionRef.current.stop();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Vibration.vibrate([200, 100, 200]);
    await completarEjercicio(5, 'Sesión completada exitosamente');
    router.back();
  };

  if (!ejercicio) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Ejercicio no encontrado</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.errorButton}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const faseActualData = ejercicio.fases[faseActual];
  const tamañoBolita = Math.min(width * 0.45, 220);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Respiración guiada
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {showInstrucciones ? (
          <InstruccionesEjercicio
            instrucciones={ejercicio.instrucciones}
            onComenzar={iniciarEjercicioHandler}
            nombre={ejercicio.nombre}
          />
        ) : (
          <>

          <InfoFase
              fase={faseActualData.tipo}
              segundosRestantes={segundosRestantes}
              getFaseTexto={getFaseTexto}
            />

            <View style={styles.bolitaWrapper}>
              <BolitaRespiracion
                fase={faseActualData.tipo}
                color={getFaseColor(faseActualData.tipo)}
                tamañoMaximo={tamañoBolita}
                animatedScale={animatedScale}
                animatedGlow={animatedGlow}
              />
            </View>

            <ProgresoFase
              faseActual={faseActual}
              totalFases={ejercicio.fases.length}
              cicloCompletado={cicloCompletado}
              progreso={
                duracionFaseActual > 0
                  ? (duracionFaseActual - segundosRestantes) / duracionFaseActual
                  : 0
              }
              color={getFaseColor(faseActualData.tipo)}
            />

            <ControlRespiracion
              isActive={isActive}
              onPausar={pausarEjercicio}
              onReanudar={reanudarEjercicio}
            />

            <TouchableOpacity
              style={styles.finalizarButton}
              onPress={finalizarEjercicio}
            >
              <Text style={styles.finalizarButtonText}>Finalizar Sesión</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#F44336',
    marginBottom: 16,
  },
  errorButton: {
    fontSize: 16,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
    borderBottomColor: COLORS.gray[200],
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: 8,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 40,
    color: COLORS.primaryDark,
    fontWeight: '300',
    lineHeight: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.title_black,
    marginLeft: 20,
    flex: 1,
    textAlign: 'left',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  bolitaWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 45,
    marginBottom: 45,
  },
  finalizarButton: {
    backgroundColor: COLORS.primaryDark,
    padding: 16,
    borderRadius: 12,
    width: 300,
    alignItems: 'center',
    marginTop: 100,
  },
  finalizarButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});