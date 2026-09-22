// src/presentation/screens/autopercepcion/AutopercepcionScreen.tsx

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/colors';
import {
  AUTOPERCEPCION_QUESTIONS,
  AutopercepcionTipo,
  getAutopercepcionQuestions,
} from '../../../../constants/autopercepcionQuestions';
import { AUTOPERCEPCION_CONFIG } from '../../../../constants/surveyConfig';
import { useAuth } from '../../contexts/AuthContext';
import { useAutopercepcionStore } from '../../store/autopercepcionStore';
import { SurveyLayout } from '../../components/survey/SurveyLayout';
import { LikertScale, LikertOption } from '../../components/survey/LinkertScale';

const ACCENT = '#4CAF50'; // verde suave para autopercepción
const CARD_ANSWERED_BG = '#fbfef7';

const OPCIONES: LikertOption[] = [
  { value: 1, label: AUTOPERCEPCION_CONFIG.ESCALA_LABELS[1] },
  { value: 2, label: AUTOPERCEPCION_CONFIG.ESCALA_LABELS[2] },
  { value: 3, label: AUTOPERCEPCION_CONFIG.ESCALA_LABELS[3] },
  { value: 4, label: AUTOPERCEPCION_CONFIG.ESCALA_LABELS[4] },
  { value: 5, label: AUTOPERCEPCION_CONFIG.ESCALA_LABELS[5] },
];

interface AutopercepcionScreenProps {
   tipoOverride?: 'pretest' | 'postest';
  onComplete?: () => void;
}

export default function AutopercepcionScreen({ tipoOverride, onComplete }: AutopercepcionScreenProps = {}) {
  const params = useLocalSearchParams<{ tipo?: string }>();
  const tipo: AutopercepcionTipo = tipoOverride ?? ((params.tipo as AutopercepcionTipo) || 'pretest');
  
  const router = useRouter();
  const { user } = useAuth();
  const { saveResponse, isLoading } = useAutopercepcionStore();

  const preguntas = useMemo(() => getAutopercepcionQuestions(tipo), [tipo]);

  const [respuestas, setRespuestas] = useState<(number | null)[]>(
    Array(preguntas.length).fill(null)
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
        tipo,
        respuestas,
      });

      if (result) {
        if (onComplete) {
          onComplete();
        } else {
          Alert.alert(
            '¡Gracias!',
            tipo === 'pretest'
              ? 'Tus respuestas han sido guardadas.'
              : `Índice de productividad: ${result.indiceProductividad.toFixed(2)}/5`,
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
  const todasRespondidas = totalRespondidas === preguntas.length;

  return (
    <SurveyLayout
      title={AUTOPERCEPCION_CONFIG.TITULO}
      subtitle={
        tipo === 'pretest'
          ? 'Antes de comenzar el piloto'
          : 'Al cierre del piloto'
      }
      onClose={() => router.back()}
      primaryAction={{
        label: todasRespondidas
          ? 'Finalizar'
          : `Faltan ${preguntas.length - totalRespondidas}`,
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
        <Text style={styles.instructionsText}>
          {AUTOPERCEPCION_CONFIG.INSTRUCCIONES}
        </Text>
      </View>

      {/* Lista de ítems */}
      {preguntas.map((pregunta, index) => {
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
    backgroundColor: '#E8F5E9',
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
    color: COLORS.primaryDark,   // ← antes era '#2E7D32'
  },
  instructionsText: {
    fontSize: 13,
    color: '#2E7D32',
    lineHeight: 19,
  },
  preguntaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    gap: 14,
    borderWidth: 1.5,
    borderColor: COLORS.gray[200],
    // Sombra sutil
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  preguntaCardRespondida: {
    borderColor: ACCENT,
    backgroundColor: CARD_ANSWERED_BG,
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