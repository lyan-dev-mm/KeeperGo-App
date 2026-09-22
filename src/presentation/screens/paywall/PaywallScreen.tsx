// src/presentation/screens/paywall/PaywallScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/colors';
import {
  PAYWALL_CONFIG,
  FuncionalidadPremiumId,
  IntencionPago,
} from '../../../../constants/paywallQuestions';
import { useAuth } from '../../contexts/AuthContext';
import { usePaywallStore } from '../../store/paywallStore';
import { SurveyLayout } from '../../components/survey/SurveyLayout';
import { RatingCircles } from '../../components/survey/RatingCircles';

const ACCENT = '#eebe44';
const CARD_ANSWERED_BG = '#FFF8E1';

interface PaywallScreenProps {
  onComplete?: () => void;
}

export default function PaywallScreen({ onComplete }: PaywallScreenProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { saveResponse, isLoading } = usePaywallStore();

  const [intencionPago, setIntencionPago] = useState<IntencionPago | null>(null);
  const [pagariaPrecio, setPagariaPrecio] = useState<boolean | null>(null);
  const [funcionalidad, setFuncionalidad] = useState<FuncionalidadPremiumId | null>(null);
  const [intencionInstitucional, setIntencionInstitucional] = useState<IntencionPago | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todasRespondidas =
    intencionPago !== null &&
    pagariaPrecio !== null &&
    funcionalidad !== null &&
    intencionInstitucional !== null;

  const handleFinalizar = async () => {
    if (isSubmitting || isLoading) return;

    if (!user) {
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    if (!todasRespondidas) {
      Alert.alert('Incompleto', 'Por favor responde todas las preguntas.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await saveResponse({
        emailInstitucional: user.email ?? '',
        intencionPago: intencionPago!,
        pagariaPrecioActual: pagariaPrecio!,
        funcionalidadPremium: funcionalidad!,
        intencionInstitucional: intencionInstitucional!,
      });

      if (result) {
        if (onComplete) {
          onComplete();
        } else {
          Alert.alert('¡Gracias!', 'Tu opinión nos ayuda a definir el futuro de Keeper Go.', [
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
      title={PAYWALL_CONFIG.TITULO}
      subtitle={PAYWALL_CONFIG.SUBTITULO}
      onClose={() => router.back()}
      primaryAction={{
        label: todasRespondidas ? 'Finalizar' : 'Completa las preguntas',
        onPress: handleFinalizar,
        disabled: !todasRespondidas,
        loading: isSubmitting,
        icon: todasRespondidas ? 'checkmark-circle' : undefined,
      }}
    >
      {/* ─── Pregunta 1: Intención de pago ────────────────────── */}
      <View style={[styles.card, intencionPago !== null && styles.cardAnswered]}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardNumero, intencionPago !== null && styles.cardNumeroAnswered]}>
            <Text style={[styles.cardNumeroText, intencionPago !== null && styles.cardNumeroTextAnswered]}>
              1
            </Text>
          </View>
          <Text style={styles.cardPregunta}>
            ¿Pagarías por Keeper Go después del piloto?
          </Text>
        </View>

        <RatingCircles
          options={[
            { value: 1, color: '#3cc243', label: 'Sí' },
            { value: 2, color: '#FFA726', label: 'Tal vez' },
            { value: 3, color: '#D32F2F', label: 'No' },
          ]}
          selected={
            intencionPago === null
              ? null
              : intencionPago === 'si'
              ? 1
              : intencionPago === 'tal_vez'
              ? 2
              : 3
          }
          onSelect={(value) => {
            setIntencionPago(value === 1 ? 'si' : value === 2 ? 'tal_vez' : 'no');
          }}
        />
      </View>

      {/* ─── Pregunta 2: Precio $129 ─────────────────────────── */}
      <View style={[styles.card, pagariaPrecio !== null && styles.cardAnswered]}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardNumero, pagariaPrecio !== null && styles.cardNumeroAnswered]}>
            <Text style={[styles.cardNumeroText, pagariaPrecio !== null && styles.cardNumeroTextAnswered]}>
              2
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardPregunta}>
              Si Keeper Go costara{' '}
              <Text style={styles.priceHighlight}>
                ${PAYWALL_CONFIG.PRECIO_MENSUAL_MXN} MXN
              </Text>{' '}
              al mes, ¿la pagarías?
            </Text>
          </View>
        </View>

        <RatingCircles
          options={[
            { value: 1, color: '#3cc243', label: 'Sí' },
            { value: 0, color: '#e95252', label: 'No' },
          ]}
          selected={pagariaPrecio === null ? null : pagariaPrecio ? 1 : 0}
          onSelect={(value) => setPagariaPrecio(value === 1)}
        />
      </View>

      {/* ─── Pregunta 3: Funcionalidad premium ────────────────── */}
      <View style={[styles.card, funcionalidad !== null && styles.cardAnswered]}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardNumero, funcionalidad !== null && styles.cardNumeroAnswered]}>
            <Text style={[styles.cardNumeroText, funcionalidad !== null && styles.cardNumeroTextAnswered]}>
              3
            </Text>
          </View>
          <Text style={styles.cardPregunta}>
            ¿Qué funcionalidad premium te motivaría más a pagar?
          </Text>
        </View>

        <View style={styles.radioList}>
          {PAYWALL_CONFIG.FUNCIONALIDADES_PREMIUM.map((opcion) => {
            const isSelected = funcionalidad === opcion.id;
            return (
              <TouchableOpacity
                key={opcion.id}
                style={[styles.radioOption, isSelected && styles.radioOptionSelected]}
                onPress={() => setFuncionalidad(opcion.id)}
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

      {/* ─── Pregunta 4: B2B2C (universidad paga) ─────────────── */}
      <View style={[styles.card, intencionInstitucional !== null && styles.cardAnswered]}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardNumero, intencionInstitucional !== null && styles.cardNumeroAnswered]}>
            <Text style={[styles.cardNumeroText, intencionInstitucional !== null && styles.cardNumeroTextAnswered]}>
              4
            </Text>
          </View>
          <Text style={styles.cardPregunta}>
            Si tu universidad te diera acceso gratis a Keeper Go, ¿la usarías?
          </Text>
        </View>

        <RatingCircles
          options={[
            { value: 1, color: '#3cc243', label: 'Sí' },
            { value: 2, color: '#FFA726', label: 'Tal vez' },
            { value: 3, color: '#D32F2F', label: 'No' },
          ]}
          selected={
            intencionInstitucional === null
              ? null
              : intencionInstitucional === 'si'
              ? 1
              : intencionInstitucional === 'tal_vez'
              ? 2
              : 3
          }
          onSelect={(value) => {
            setIntencionInstitucional(value === 1 ? 'si' : value === 2 ? 'tal_vez' : 'no');
          }}
        />
      </View>
    </SurveyLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.gray[200],
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardAnswered: {
    borderColor: '#f6d276',       // ← borde dorado de contraste
    borderWidth: 2,                // ← un poco más grueso al responder
    backgroundColor: '#FFF8E1',    // ← fondo amarillo tenue
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
    backgroundColor: '#eebe44',
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

  // ─── Radio ────────────────────────────────────────────────
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
    borderColor: '#eebe44',
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
    borderColor: '#eebe44',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#eebe44',
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

  // ─── Texto libre ──────────────────────────────────────────
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
  priceHighlight: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },

});