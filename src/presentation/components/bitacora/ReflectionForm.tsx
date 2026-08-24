// src/presentation/components/ReflectionForm.jsx

import React, { useState, useEffect, JSX } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  BackHandler,
} from 'react-native';
import { COLORS } from '../../../../constants/colors';
import IntensitySlider from './IntensitySlider';

export interface ReflectionAnswers {
  queSucedio: string;
  pensamiento: string;
  queHice: string;
  comoMeSiento: string;
}

export interface Question {
  id: keyof ReflectionAnswers;
  title: string;
  placeholder?: string;
  subtitle?: string;
  isLast?: boolean;
}

export interface ReflectionFormProps {
  /** Emoción seleccionada */
  emotion?: { id: string; label: string; color: string } | null;
  /** Nivel de energía */
  energy?: number;
  /** Función para guardar la reflexión */
  onSave: (reflection: string) => void;
  /** Función para volver atrás */
  onBack: () => void;
}

// ============================================
// COMPONENTE
// ============================================

/**
 * Formulario de reflexión en pantalla completa
 * Reutiliza el slider de energía para el nivel de intensidad
 * Soporta el botón "Atrás" nativo de Android
 */
export default function ReflectionForm({
  emotion,
  energy,
  onSave,
  onBack,
}: ReflectionFormProps): JSX.Element {
  // ============================================
  // ESTADO
  // ============================================

  const [answers, setAnswers] = useState<ReflectionAnswers>({
    queSucedio: '',
    pensamiento: '',
    queHice: '',
    comoMeSiento: '',
  });

  const [currentStep, setCurrentStep] = useState<number>(0);

  // ============================================
  // PREGUNTAS
  // ============================================

  const questions: Question[] = [
    {
      id: 'queSucedio',
      title: '¿Qué sucedió para que te sintieras de esa forma?',
      placeholder: 'Describe la situación que te llevó a sentirte así...',
    },
    {
      id: 'pensamiento',
      title: '¿Qué pensamiento vino a tu mente?',
      placeholder: 'Escribe el pensamiento que tuviste en ese momento...',
    },
    {
      id: 'queHice',
      title: '¿Qué es lo que hiciste o puedes hacer?',
      placeholder: '¿Cómo actuaste? ¿Qué podrías hacer ahora?',
    },
    {
      id: 'comoMeSiento',
      title: '¿Cómo te sientes ahora?',
      subtitle: '(Del 1 al 10, donde 1 es muy mal y 10 es muy bien)',
      isLast: true,
    },
  ];

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const isLastQuestion = currentStep === questions.length - 1;

  // ============================================
  // BOTÓN "ATRÁS" NATIVO (Android)
  // ============================================

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentStep > 0) {
        handlePrevious();
      } else {
        onBack();
      }
      return true;
    });

    return () => backHandler.remove();
  }, [currentStep]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleAnswerChange = (id: keyof ReflectionAnswers, text: string): void => {
    setAnswers((prev) => ({ ...prev, [id]: text }));
  };

  const handleNext = (): void => {
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = (): void => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSave = (): void => {
    const fullReflection = `
      ¿Qué sucedió? ${answers.queSucedio}
      ¿Qué pensamiento vino a tu mente? ${answers.pensamiento}
      ¿Qué hiciste o puedes hacer? ${answers.queHice}
      ¿Cómo te sientes ahora? ${answers.comoMeSiento}
    `.trim();
    onSave(fullReflection);
  };

  const handleSliderChange = (value: number): void => {
    setAnswers((prev) => ({
      ...prev,
      comoMeSiento: `Nivel ${value} de 10`,
    }));
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <View style={styles.container}>
      {/* Header sin botón volver */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conociendo mis emociones</Text>
        <Text style={styles.headerSubtitle}>
          Este es un ejercicio que te permitirá conocer e identificar cómo te sientes
        </Text>
      </View>

      {/* Barra de progreso */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentStep + 1} de {questions.length}
        </Text>
      </View>

      {/* Pregunta actual */}
      <ScrollView style={styles.questionContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.questionTitle}>{currentQuestion.title}</Text>
        {currentQuestion.subtitle && (
          <Text style={styles.questionSubtitle}>{currentQuestion.subtitle}</Text>
        )}

        {isLastQuestion ? (
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Nivel de bienestar</Text>
            <IntensitySlider
              value={5}
              onValueChange={handleSliderChange}
              min={1}
              max={10}
            />
            <Text style={styles.sliderNote}>
              Desliza para indicar cómo te sientes ahora
            </Text>
          </View>
        ) : (
          <TextInput
            style={styles.textInput}
            placeholder={currentQuestion.placeholder}
            placeholderTextColor="#9CA3AF"
            value={answers[currentQuestion.id]}
            onChangeText={(text) => handleAnswerChange(currentQuestion.id, text)}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        )}
      </ScrollView>

      {/* Botones */}
      <View style={styles.buttonContainer}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handlePrevious}>
            <Text style={styles.backButtonText}>Atrás</Text>
          </TouchableOpacity>
        )}

        {!isLastQuestion ? (
          <TouchableOpacity
            style={[
              styles.nextButton,
              !answers[currentQuestion.id]?.trim() && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={!answers[currentQuestion.id]?.trim()}
          >
            <Text style={styles.nextButtonText}>Siguiente</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Guardar reflexión</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
  },
  // ===== HEADER =====
  header: {
    //alignItems: 'center',
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.title_black,
    textAlign: 'left',
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray[500],
    textAlign: 'left',
    marginTop: 4,
    lineHeight: 18,
  },
  // ===== PROGRESO =====
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 5,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginRight: 12,
  },
  progressFill: {
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  // ===== PREGUNTA =====
  questionContainer: {
    flex: 1,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
  },
  questionSubtitle: {
    fontSize: 14,
    color: COLORS.gray[500],
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 15.5,
    borderWidth: 1,
    borderColor: COLORS.secondaryDark,
    minHeight: 140,
    textAlignVertical: 'top',
  },
  // ===== SLIDER =====
  sliderContainer: {
    marginTop: 8,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sliderLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 8,
  },
  sliderNote: {
    fontSize: 12,
    color: COLORS.gray[400],
    textAlign: 'center',
    marginTop: 8,
  },
  // ===== BOTONES =====
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 8,
  },
  backButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[600],
  },
  nextButton: {
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  nextButtonDisabled: {
    backgroundColor: COLORS.gray[300],
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});