// src/presentation/screens/feedback/FeedbackScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/colors';
import { MODULOS_OPCIONES, ModuloId } from '../../../../constants/feedbackQuestions';
import { FEEDBACK_CONFIG } from '../../../../constants/surveyConfig';
import { useAuth } from '../../contexts/AuthContext';
import { useFeedbackStore } from '../../store/feedbackStore';
import { SurveyLayout } from '../../components/survey/SurveyLayout';
import { RatingCircles, RatingCircleOption } from '../../components/survey/RatingCircles';

const ACCENT = '#eebe44';
const CARD_ANSWERED_BG = '#FFF8E1';

const NPS_COLORS = ['#D32F2F', '#FFA726', '#FFC107', '#81C784', '#2E7D32'];

const NPS_OPTIONS: RatingCircleOption[] = NPS_COLORS.map((color, i) => ({
  value: i + 1,
  color,
}));

interface FeedbackScreenProps {
  onComplete?: () => void;
}

export default function FeedbackScreen({ onComplete }: FeedbackScreenProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { saveResponse, isLoading } = useFeedbackStore();

  const [nps, setNps] = useState<number | null>(null);
  const [moduloFavorito, setModuloFavorito] = useState<ModuloId | null>(null);
  const [moduloMasUtil, setModuloMasUtil] = useState<ModuloId | null>(null);
  const [mascotaMotivadora, setMascotaMotivadora] = useState<boolean | null>(null);
  const [comentario, setComentario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todasObligatorias =
    nps !== null &&
    moduloFavorito !== null &&
    moduloMasUtil !== null &&
    mascotaMotivadora !== null;

  const handleFinalizar = async () => {
    if (isSubmitting || isLoading) return;

    if (!user) {
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    if (!todasObligatorias) {
      Alert.alert('Incompleto', 'Por favor responde todas las preguntas obligatorias.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await saveResponse({
        emailInstitucional: user.email ?? '',
        nps: nps!,
        moduloFavorito: moduloFavorito!,
        moduloMasUtil: moduloMasUtil!,
        mascotaMotivadora: mascotaMotivadora!,
        comentarioMejora: comentario.trim() || null,
      });

      if (result) {
        if (onComplete) {
          onComplete();
        } else {
          Alert.alert('¡Gracias!', 'Tu opinión nos ayuda a mejorar.', [
            { text: 'Continuar', onPress: () => router.replace('/(tabs)/home') },
          ]);
        }
      } else {
        Alert.alert('Error', 'No se pudieron guardar tus respuestas.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SurveyLayout
      title={FEEDBACK_CONFIG.TITULO}
      subtitle={FEEDBACK_CONFIG.SUBTITULO}
      onClose={() => router.back()}
      primaryAction={{
        label: todasObligatorias ? 'Finalizar' : 'Completa las preguntas',
        onPress: handleFinalizar,
        disabled: !todasObligatorias,
        loading: isSubmitting,
        icon: todasObligatorias ? 'checkmark-circle' : undefined,
      }}
    >
      {/* ─── Pregunta 1: NPS con 5 círculos ──────────────────── */}
      <View style={[styles.card, nps !== null && styles.cardAnswered]}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardNumero, nps !== null && styles.cardNumeroAnswered]}>
            <Text style={[styles.cardNumeroText, nps !== null && styles.cardNumeroTextAnswered]}>
              1
            </Text>
          </View>
          <Text style={styles.cardPregunta}>
            ¿Qué tan probable es que recomiendes Keeper Go a un amigo?
          </Text>
        </View>

        <RatingCircles
          options={NPS_OPTIONS}
          selected={nps}
          onSelect={setNps}
          leftLabel="Nada probable"
          rightLabel="Muy probable"
        />
      </View>

      {/* ─── Pregunta 2: Módulo favorito ──────────────────────── */}
      <RadioCard
        numero={2}
        pregunta="¿Qué módulo te gustó más?"
        opciones={MODULOS_OPCIONES}
        seleccionado={moduloFavorito}
        onSelect={setModuloFavorito}
      />

      {/* ─── Pregunta 3: Módulo más útil ──────────────────────── */}
      <RadioCard
        numero={3}
        pregunta="¿Qué módulo te resultó más útil?"
        opciones={MODULOS_OPCIONES}
        seleccionado={moduloMasUtil}
        onSelect={setModuloMasUtil}
      />

      {/* ─── Pregunta 4: Mascota con 2 círculos con label ─────── */}
      <View style={[styles.card, mascotaMotivadora !== null && styles.cardAnswered]}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.cardNumero,
              mascotaMotivadora !== null && styles.cardNumeroAnswered,
            ]}
          >
            <Text
              style={[
                styles.cardNumeroText,
                mascotaMotivadora !== null && styles.cardNumeroTextAnswered,
              ]}
            >
              4
            </Text>
          </View>
          <Text style={styles.cardPregunta}>
            ¿La mascota virtual te motivó a usar la app?
          </Text>
        </View>

        <View style={styles.siNoContainer}>
          <RatingCircles
            options={[
              { value: 1, color: '#3cc243', label: 'Sí' },
              { value: 0, color: '#e95252', label: 'No' },
            ]}
            selected={mascotaMotivadora === null ? null : mascotaMotivadora ? 1 : 0}
            onSelect={(value) => setMascotaMotivadora(value === 1)}
          />
        </View>
      </View>

      {/* ─── Pregunta 5: Texto libre (opcional) ───────────────── */}
      <View style={[styles.card, comentario.trim().length > 0 && styles.cardAnswered]}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.cardNumero,
              comentario.trim().length > 0 && styles.cardNumeroAnswered,
            ]}
          >
            <Text
              style={[
                styles.cardNumeroText,
                comentario.trim().length > 0 && styles.cardNumeroTextAnswered,
              ]}
            >
              5
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardPregunta}>¿Qué mejorarías de la app?</Text>
            <Text style={styles.cardHint}>Opcional</Text>
          </View>
        </View>

        <View style={styles.textAreaWrapper}>
          <TextInput
            style={styles.textArea}
            placeholder="Escribe tus comentarios aquí..."
            placeholderTextColor={COLORS.gray[400]}
            multiline
            numberOfLines={4}
            value={comentario}
            onChangeText={setComentario}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCounterOverlay}>{comentario.length}/500</Text>
        </View>
      </View>
    </SurveyLayout>
  );
}

// ─── Subcomponente: card de radio ─────────────────────────────
interface RadioCardProps {
  numero: number;
  pregunta: string;
  opciones: readonly { id: string; label: string }[];
  seleccionado: string | null;
  onSelect: (id: any) => void;
}

function RadioCard({ numero, pregunta, opciones, seleccionado, onSelect }: RadioCardProps) {
  const answered = seleccionado !== null;

  return (
    <View style={[styles.card, answered && styles.cardAnswered]}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardNumero, answered && styles.cardNumeroAnswered]}>
          <Text style={[styles.cardNumeroText, answered && styles.cardNumeroTextAnswered]}>
            {numero}
          </Text>
        </View>
        <Text style={styles.cardPregunta}>{pregunta}</Text>
      </View>

      <View style={styles.radioList}>
        {opciones.map((opcion) => {
          const isSelected = seleccionado === opcion.id;
          return (
            <TouchableOpacity
              key={opcion.id}
              style={[styles.radioOption, isSelected && styles.radioOptionSelected]}
              onPress={() => onSelect(opcion.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                {isSelected ? <View style={styles.radioDot} /> : null}
              </View>
              <Text style={[styles.radioLabel, isSelected && styles.radioLabelSelected]}>
                {opcion.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ─── Card general ─────────────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    gap: 14,
    // Sombra muy suave, casi imperceptible
    shadowColor: '#fbf9f9',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardAnswered: {
    // Sin borde amarillo, solo fondo tenue
    backgroundColor: CARD_ANSWERED_BG,
    borderColor: COLORS.gray[200], // borde se mantiene igual
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardNumero: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardNumeroAnswered: {
    backgroundColor: ACCENT,
  },
  cardNumeroText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray[500],
  },
  cardNumeroTextAnswered: {
    color: '#FFFFFF',
  },
  cardPregunta: {
    flex: 1,
    fontSize: 14,
    color: '#514343',
    lineHeight: 20,
    fontWeight: '600',
    paddingTop: 6,
  },
  cardHint: {
    fontSize: 11,
    color: COLORS.gray[500],
    marginTop: 2,
    fontWeight: '500',
  },

  // ─── Radio (preguntas 2 y 3) ──────────────────────────────
  radioList: {
    gap: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.gray[200],
    backgroundColor: '#FFFFFF',
  },
  radioOptionSelected: {
    borderColor: ACCENT,
    backgroundColor: '#FFFDF5',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioCircleSelected: {
    borderColor: ACCENT,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ACCENT,
  },
  radioLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  radioLabelSelected: {
    color: '#514343',
    fontWeight: '700',
  },

  // ─── Sí/No container (pregunta 4) ─────────────────────────
  siNoContainer: {
    // Centra los 2 círculos horizontalmente con espacio razonable
    paddingHorizontal: 24,
  },

  // ─── Texto libre (pregunta 5) ─────────────────────────────
  textAreaWrapper: {
    position: 'relative',
  },
  textArea: {
    minHeight: 100,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.gray[200],
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 28,
    fontSize: 14,
    color: '#514343',
    fontWeight: '500',
  },
  charCounterOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 11,
    color: COLORS.gray[400],
    fontWeight: '500',
  },
});