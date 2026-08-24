// src/presentation/components/bitacora/EmotionEditForm.jsx

import React, { JSX } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity 
} from 'react-native';
import EmotionWheel from './EmotionWheel';
import IntensitySlider from './IntensitySlider';
import { COLORS } from '../../../../constants/colors';
import { EmotionData } from './ConfirmationPanel';

export interface EmotionEditFormProps {
  selectedEmotion: EmotionData | null;
  onSelectEmotion: (emotion: EmotionData) => void;
  selectedEnergy: number;
  onSelectEnergy: (value: number) => void;
  note: string;
  onNoteChange: (text: string) => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete?: () => void;
}

export default function EmotionEditForm({
  selectedEmotion,
  onSelectEmotion,
  selectedEnergy,
  onSelectEnergy,
  note,
  onNoteChange,
  onCancel,
  onSave,
  onDelete,
}: EmotionEditFormProps): JSX.Element {
  return (
    <View style={styles.editingContainer}>
      <Text style={styles.editLabel}>Selecciona una emoción</Text>
      <EmotionWheel
        selectedEmotion={selectedEmotion}
        onSelectEmotion={onSelectEmotion}
      />

      <Text style={styles.editLabel}>Nivel de energía</Text>
      <IntensitySlider
        value={selectedEnergy}
        onValueChange={onSelectEnergy}
        min={1}
        max={10}
      />

      <Text style={styles.editLabel}>Nota</Text>
      <TextInput
        style={styles.noteInput}
        value={note}
        onChangeText={onNoteChange}
        placeholder="Escribe tu reflexión..."
        placeholderTextColor={COLORS.gray[400]}
        multiline
        numberOfLines={4}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.cancelButton]} 
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.saveButton]} 
          onPress={onSave}
        >
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>
      </View>

      {onDelete && (
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={onDelete}
      >
      <Text style={styles.deleteButtonText}>🗑️ Eliminar registro</Text>
      </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  editingContainer: {
    width: '100%',
    alignItems: 'center',
  },
  editLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#514343',
    marginTop: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  noteInput: {
    width: '100%',
    backgroundColor: '#FFF6DA',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#D4C5A0',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    backgroundColor: '#5AC155',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    width: '100%',
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '500',
  },
});