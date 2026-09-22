import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/colors';
import { SUS_QUESTIONS } from '../../../../constants/susQuestions';
import { SUS_CONFIG } from '../../../../constants/surveyConfig';
import { useAuth } from '../../contexts/AuthContext';
import { useSUSStore } from '../../store/susStore';
import { SurveyLayout } from '../../components/survey/SurveyLayout';
import { LikertScale, LikertOption } from '../../components/survey/LinkertScale';

const ACCENT = '#eebe44';
const CARD_ANSWERED_BG = '#FFF8E1'; // ← si quieres el más fuerte: '#fcecbb'

const OPCIONES: LikertOption[] = [
  { value: 1, label: SUS_CONFIG.ESCALA_LABELS[1] },
  { value: 2, label: SUS_CONFIG.ESCALA_LABELS[2] },
  { value: 3, label: SUS_CONFIG.ESCALA_LABELS[3] },
  { value: 4, label: SUS_CONFIG.ESCALA_LABELS[4] },
  { value: 5, label: SUS_CONFIG.ESCALA_LABELS[5] },
];

interface SUSScreenProps {
  onComplete?: () => void;
}

export default function SUSScreen({ onComplete }: SUSScreenProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { saveResponse, isLoading } = useSUSStore();

  const [respuestas, setRespuestas] = useState<(number | null)[]>(
    Array(SUS_CONFIG.TOTAL_ITEMS).fill(null)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRespuesta = (index: number, value: number) => {
    const nuevas = [...respuestas];
    nuevas[index] = value;
    setRespuestas(nuevas);
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

    setIsSubmitting(true);
    try {
      const result = await saveResponse({
        emailInstitucional: user.email ?? '',
        respuestas,
      });

      if (result) {
        if (onComplete) {
          onComplete();
        } else {
          Alert.alert(
            '¡Gracias!',
            `Tu puntuación SUS es ${result.puntuacion.toFixed(1)}/100.`,
            [{ text: 'Continuar', onPress: () => router.replace('/(tabs)/home') }]
          );
        }
      } else {
        Alert.alert('Error', 'No se pudieron guardar tus respuestas.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalRespondidas = respuestas.filter((r) => r !== null).length;
  const todasRespondidas = totalRespondidas === SUS_CONFIG.TOTAL_ITEMS;

  return (
    <SurveyLayout
      title={SUS_CONFIG.TITULO}
      subtitle={SUS_CONFIG.SUBTITULO}
      onClose={() => router.back()}
      primaryAction={{
        label: todasRespondidas
          ? 'Finalizar'
          : `Faltan ${SUS_CONFIG.TOTAL_ITEMS - totalRespondidas}`,
        onPress: handleFinalizar,
        disabled: !todasRespondidas,
        loading: isSubmitting,
        icon: todasRespondidas ? 'checkmark-circle' : undefined,
      }}
    >
      {/* Instrucciones */}
      <View style={styles.instructionsContainer}>
        <View style={styles.instructionsHeader}>
          <Ionicons name="information-circle" size={20} color={ACCENT} />
          <Text style={styles.instructionsTitle}>Instrucciones</Text>
        </View>
        <Text style={styles.instructionsText}>{SUS_CONFIG.INSTRUCCIONES}</Text>
      </View>

      {/* Lista de ítems */}
      {SUS_QUESTIONS.map((pregunta, index) => {
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
            {/* Fila 1: número + pregunta */}
            <View style={styles.preguntaHeader}>
              <View
                style={[
                  styles.preguntaNumero,
                  estaRespondida && styles.preguntaNumeroRespondida,
                ]}
              >
                <Text
                  style={[
                    styles.preguntaNumeroText,
                    estaRespondida && styles.preguntaNumeroTextRespondida,
                  ]}
                >
                  {pregunta.numero}
                </Text>
              </View>
              <Text style={styles.preguntaTexto}>{pregunta.afirmacion}</Text>
            </View>

            {/* Filas siguientes: opciones verticales */}
            <LikertScale
              options={OPCIONES}
              selected={respuestaActual}
              onSelect={(value) => handleRespuesta(index, value)}
              variant="list"
              accentColor={ACCENT}
            />
          </View>
        );
      })}
    </SurveyLayout>
  );
}

const styles = StyleSheet.create({
  instructionsContainer: {
    backgroundColor: '#fcecbb',
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#514343',
  },
  instructionsText: {
    fontSize: 13,
    color: '#514343',
    lineHeight: 19,
  },

  // ─── Card de pregunta ──────────────────────────────────────
  preguntaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    gap: 14,
  },
  preguntaCardRespondida: {
    backgroundColor: CARD_ANSWERED_BG, // ← amarillo tenue
  },

  preguntaHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  preguntaNumeroRespondida: {
    backgroundColor: ACCENT,
  },
  preguntaNumeroText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray[500],
  },
  preguntaNumeroTextRespondida: {
    color: '#FFFFFF',
  },
  preguntaTexto: {
    flex: 1,
    fontSize: 14,
    color: '#514343',
    lineHeight: 20,
    fontWeight: '600',
    paddingTop: 6,
  },
});