// src/presentation/components/bitacora/EmotionNoteCard.jsx

import React, { JSX } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../../../constants/colors';

const { width } = Dimensions.get('window');

// ============================================
// INTERFACES
// ============================================

export interface NoteSection {
  question: string;
  answer: string;
}

export interface EmotionNoteCardProps {
  /** Nota/reflexión del día */
  nota?: string | null;
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

const extractSections = (text: string): NoteSection[] => {
  if (!text || text.trim() === '') {
    return [];
  }

  const questionPatterns = [
    '¿Qué sucedió?',
    '¿Qué pensamiento vino a tu mente?',
    '¿Qué hiciste o puedes hacer?',
  ];

  const sections: NoteSection[] = [];

  // Dividir por saltos de línea
  const lines = text.split('\n').filter((line) => line.trim() !== '');

  // Buscar preguntas y sus respuestas
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    let isQuestion = false;
    let question = '';
    let answer = '';

    for (const pattern of questionPatterns) {
      if (line.includes(pattern)) {
        isQuestion = true;
        question = pattern;
        answer = line.replace(pattern, '').trim();
        if (!answer && i + 1 < lines.length) {
          answer = lines[i + 1].trim();
          i++;
        }
        break;
      }
    }

    if (isQuestion && answer) {
      sections.push({
        question: question,
        answer: answer || 'Sin respuesta',
      });
    }
  }

  if (sections.length === 0) {
    return [{ question: 'Nota', answer: text }];
  }

  return sections;
};

const getTagColor = (question: string): string => {
  if (question.includes('sucedió')) return '#E8F5E9';
  if (question.includes('pensamiento')) return '#E3F2FD';
  if (question.includes('hiciste')) return '#FFF3E0';
  return '#F5F5F5';
};

// ============================================
// COMPONENTE
// ============================================

export default function EmotionNoteCard({
  nota,
}: EmotionNoteCardProps): JSX.Element {
  // Si no hay nota, mostrar mensaje vacío
  if (!nota || nota.trim() === '') {
    return (
      <View style={styles.noteSection}>
        <View style={styles.noteLabelContainer}>
          <Text style={styles.noteLabel}>Sin notas</Text>
        </View>
        <View style={styles.noteTextContainer}>
          <Text style={[styles.noteText, styles.noteEmpty]}>
            No hay notas para este día
          </Text>
        </View>
      </View>
    );
  }

  const sections = extractSections(nota);

  return (
    <View style={styles.noteSection}>
      <View style={styles.noteLabelContainer}>
        <Text style={styles.noteLabel}>Reflexión del día</Text>
      </View>

      <View style={styles.noteTextContainer}>
        {sections.map((section, index) => (
          <View key={index} style={styles.sectionCard}>
            <View style={[styles.questionTag, { backgroundColor: getTagColor(section.question) }]}>
              <Text style={styles.questionTagText}>{section.question}</Text>
            </View>
            <Text style={styles.answerText}>{section.answer}</Text>
            {index < sections.length - 1 && <View style={styles.sectionDivider} />}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  noteSection: {
    width: width * 0.75,
    maxWidth: 320,
    alignSelf: 'center',
    marginTop: 8,
  },// Este no estaba
  noteText: {
    fontSize: 15,
    color: '#514343',
    lineHeight: 24,
  },
  noteLabelContainer: {
    backgroundColor: '#F5C842',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#D4A020',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  noteLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#514343',
    letterSpacing: 0.5,
  },

  noteTextContainer: {
    backgroundColor: '#fffefa',
    padding: 16,
    borderRadius: 12,
    borderTopLeftRadius: 0,
    borderWidth: 1,
    borderColor: '#D4C5A0',
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  sectionCard: {
    marginBottom: 12,
  },

  questionTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
    borderWidth: 0.5,
    borderColor: '#D4C5A0',
  },

  questionTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#514343',
    letterSpacing: 0.3,
  },

  answerText: {
    fontSize: 15,
    color: '#514343',
    lineHeight: 24,
    paddingLeft: 12,
    paddingRight: 4,
  },

  sectionDivider: {
    height: 1,
    backgroundColor: '#E5D9B8',
    marginVertical: 8,
    marginHorizontal: 4,
  },

  noteEmpty: {
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});