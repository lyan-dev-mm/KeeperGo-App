import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/colors';
import { DASS21_QUESTIONS } from '../../../../constants/dass21Questions';
import { useDASS21Store } from '../../store/dass21Store';
import { useAuth } from '../../contexts/AuthContext';
import { DASS21Tipo } from '../../../domain/entities/dass21/DASS21Response';
import { useDASS21Status } from '../../hooks/useDASS21Status';

const OPCIONES = [
  { valor: 0, label: 'No me ha ocurrido' },
  { valor: 1, label: 'Me ha ocurrido un poco, o durante parte del tiempo' },
  { valor: 2, label: 'Me ha ocurrido bastante, o durante una buena parte del tiempo' },
  { valor: 3, label: 'Me ha ocurrido mucho, o la mayor parte del tiempo' },
];

interface DASS21ScreenProps {
  tipoOverride?: 'inicial' | 'final';
  onComplete?: () => void;
}

export default function DASS21Screen({ tipoOverride, onComplete }: DASS21ScreenProps = {}) {
  const params = useLocalSearchParams<{ tipo?: string }>();
  const tipo: DASS21Tipo = tipoOverride ?? ((params.tipo as DASS21Tipo) || 'inicial');
  const router = useRouter();

  const { user } = useAuth();
  const { saveResponse, isLoading } = useDASS21Store();
  const { estado, isLoading: statusLoading } = useDASS21Status(user?.id);

  const [respuestas, setRespuestas] = useState<(number | null)[]>(
    Array(21).fill(null)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completadoEnEstaSesion, setCompletadoEnEstaSesion] = useState(false);

  // ─── Guard: solo se evalúa UNA VEZ al montar, cuando ya cargó el status ──
  const guardEvaluado = useRef(false);

  useEffect(() => {
    // No evaluar hasta que el status haya cargado
    if (statusLoading) return;
    // Solo evaluar UNA vez
    if (guardEvaluado.current) return;
    // Si ya completamos en esta sesión, no hacer nada
    if (completadoEnEstaSesion) return;

    guardEvaluado.current = true;

    const yaCompletado =
      (tipo === 'inicial' &&
        (estado === 'inicial_completado' ||
          estado === 'listo_final' ||
          estado === 'final_completado')) ||
      (tipo === 'final' && estado === 'final_completado');

    if (yaCompletado) {
      Alert.alert('Ya completado', 'Ya respondiste este cuestionario.', [
        { text: 'Volver', onPress: () => router.back() },
      ]);
    }
  }, [statusLoading, estado, tipo, router, completadoEnEstaSesion]);

  const handleRespuesta = (preguntaIndex: number, valor: number) => {
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[preguntaIndex] = valor;
    setRespuestas(nuevasRespuestas);
  };

  const handleFinalizar = async () => {
    if (isSubmitting || isLoading) return;
    if (!user) {
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    if (!respuestas.every((r): r is number => r !== null)) {
      const faltan = respuestas.filter((r) => r === null).length;
      Alert.alert('Cuestionario incompleto', `Faltan ${faltan} preguntas.`);
      return;
    }

    // 🔑 Marcar el guard ANTES de guardar, para que ningún re-render lo dispare
    guardEvaluado.current = true;
    setCompletadoEnEstaSesion(true);
    setIsSubmitting(true);

    try {
      const result = await saveResponse({
        emailInstitucional: user.email ?? '',
        tipo,
        respuestas,
      });

      if (result) {
        if (tipo === 'inicial') {
          router.replace({
            pathname: '/(modals)/Autopercepcion',
            params: { tipo: 'pretest' },
          });
        } else {
          if (onComplete) {
            onComplete();
          } else {
            Alert.alert(
              '¡Gracias!',
              'Tus respuestas finales han sido guardadas.',
              [{ text: 'Continuar', onPress: () => router.replace('/(tabs)/home') }]
            );
          }
        }
      } else {
        Alert.alert('Error', 'No se pudieron guardar tus respuestas');
      }
    } catch (error) {
      console.error('[DASS21] Error al finalizar:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const todasRespondidas = respuestas.every((r) => r !== null);
  const totalRespondidas = respuestas.filter((r) => r !== null).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="close" size={24} color={COLORS.primaryDark} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>DASS-21</Text>
          <Text style={styles.headerSubtitle}>
            {tipo === 'inicial' ? 'Cuestionario inicial' : 'Cuestionario final'}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.instructionsContainer}>
          <View style={styles.instructionsHeader}>
            <Ionicons name="information-circle" size={20} color={COLORS.primaryDark} />
            <Text style={styles.instructionsTitle}>Instrucciones</Text>
          </View>
          <Text style={styles.instructionsText}>
            Lee cada afirmación y selecciona el número que indique en qué grado te ha
            ocurrido durante la última semana.
          </Text>

          <View style={styles.leyendaContainer}>
            {OPCIONES.map((opcion) => (
              <View key={opcion.valor} style={styles.leyendaItem}>
                <View style={styles.leyendaBadge}>
                  <Text style={styles.leyendaBadgeText}>{opcion.valor}</Text>
                </View>
                <Text style={styles.leyendaText}>
                  {opcion.valor === 0 ? 'No' :
                   opcion.valor === 1 ? 'Poco' :
                   opcion.valor === 2 ? 'Bastante' : 'Mucho'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.preguntasContainer}>
          {DASS21_QUESTIONS.map((pregunta, index) => {
            const respuestaActual = respuestas[index];
            const estaRespondida = respuestaActual !== null;

            return (
              <View
                key={pregunta.numero}
                style={[
                  styles.preguntaCard,
                  estaRespondida && styles.preguntaCardRespondida,
                ]}
              >
                <View style={styles.preguntaHeader}>
                  <View style={[
                    styles.preguntaNumero,
                    estaRespondida && styles.preguntaNumeroRespondida,
                  ]}>
                    <Text style={[
                      styles.preguntaNumeroText,
                      estaRespondida && styles.preguntaNumeroTextRespondida,
                    ]}>
                      {pregunta.numero}
                    </Text>
                  </View>
                  <Text style={styles.preguntaTexto}>
                    {pregunta.afirmacion}
                  </Text>
                </View>

                <View style={styles.opcionesContainer}>
                  {OPCIONES.map((opcion) => {
                    const isSelected = respuestaActual === opcion.valor;

                    return (
                      <TouchableOpacity
                        key={opcion.valor}
                        style={[
                          styles.opcionButton,
                          isSelected && styles.opcionButtonSelected,
                        ]}
                        onPress={() => handleRespuesta(index, opcion.valor)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.opcionText,
                          isSelected && styles.opcionTextSelected,
                        ]}>
                          {opcion.valor}
                        </Text>
                        <Text style={[
                          styles.opcionLabel,
                          isSelected && styles.opcionLabelSelected,
                        ]}>
                          {opcion.valor === 0 ? 'No' :
                           opcion.valor === 1 ? 'Poco' :
                           opcion.valor === 2 ? 'Bastante' : 'Mucho'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.finishButton,
            (!todasRespondidas || isLoading || isSubmitting) && styles.finishButtonDisabled,
          ]}
          onPress={handleFinalizar}
          disabled={!todasRespondidas || isLoading || isSubmitting}
        >
          {isLoading || isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons
                name={todasRespondidas ? 'checkmark-circle' : 'alert-circle'}
                size={22}
                color={todasRespondidas ? '#FFFFFF' : COLORS.gray[500]}
              />
              <Text
                style={[
                  styles.finishButtonText,
                  !todasRespondidas && styles.finishButtonTextDisabled,
                ]}
              >
                {todasRespondidas
                  ? 'Finalizar cuestionario'
                  : `Faltan ${21 - totalRespondidas} preguntas`}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  backButton: { padding: 8 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.title_black },
  headerSubtitle: { fontSize: 12, color: COLORS.gray[500], marginTop: 2 },
  content: { paddingHorizontal: 16, paddingBottom: 20 },
  instructionsContainer: {
    backgroundColor: COLORS.secondary,
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  instructionsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  instructionsTitle: { fontSize: 15, fontWeight: '700', color: COLORS.title_black },
  instructionsText: { fontSize: 13, color: COLORS.gray[700], lineHeight: 19, marginBottom: 14 },
  leyendaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  leyendaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 10,
  },
  leyendaBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  leyendaBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  leyendaText: { fontSize: 11, color: COLORS.gray[700], fontWeight: '600' },
  preguntasContainer: { gap: 16 },
  preguntaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  preguntaCardRespondida: {
    borderColor: COLORS.primaryDark,
    backgroundColor: '#F9FFF8',
  },
  preguntaHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
  },
  preguntaNumero: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  preguntaNumeroRespondida: { backgroundColor: COLORS.primaryDark },
  preguntaNumeroText: { fontSize: 13, fontWeight: '700', color: COLORS.gray[500] },
  preguntaNumeroTextRespondida: { color: '#FFFFFF' },
  preguntaTexto: {
    flex: 1,
    fontSize: 14,
    color: COLORS.title_black,
    lineHeight: 20,
    fontWeight: '500',
    paddingTop: 6,
  },
  opcionesContainer: { flexDirection: 'row', gap: 8 },
  opcionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.gray[200],
    backgroundColor: '#FFFFFF',
    gap: 2,
  },
  opcionButtonSelected: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  opcionText: { fontSize: 18, fontWeight: '700', color: COLORS.gray[500] },
  opcionTextSelected: { color: '#FFFFFF' },
  opcionLabel: { fontSize: 10, color: COLORS.gray[400], fontWeight: '500' },
  opcionLabelSelected: { color: '#FFFFFF' },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    backgroundColor: COLORS.white,
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  finishButtonDisabled: {
    backgroundColor: COLORS.gray[200],
    shadowOpacity: 0,
    elevation: 0,
  },
  finishButtonText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  finishButtonTextDisabled: { color: COLORS.gray[500] },
});