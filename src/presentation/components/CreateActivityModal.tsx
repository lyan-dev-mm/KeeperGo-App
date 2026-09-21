import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';

interface CreateActivityModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { title: string; description: string; startDate: Date; endDate: Date }) => void;
}

// Formato simple AAAA-MM-DD para no depender de una librería de calendario.
function parseDate(text: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text.trim());
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date;
}

export default function CreateActivityModal({ visible, onClose, onSave }: CreateActivityModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startText, setStartText] = useState('');
  const [endText, setEndText] = useState('');

  const reset = () => {
    setTitle('');
    setDescription('');
    setStartText('');
    setEndText('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Falta el título', 'Ponle un nombre al reto.');
      return;
    }
    const startDate = parseDate(startText);
    const endDate = parseDate(endText);
    if (!startDate || !endDate) {
      Alert.alert('Fechas inválidas', 'Escribe las fechas en formato AAAA-MM-DD, por ejemplo 2026-09-20.');
      return;
    }
    onSave({ title: title.trim(), description: description.trim(), startDate, endDate });
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.centerWrapper}
        pointerEvents="box-none"
      >
        <View style={styles.card}>
          <Text style={styles.label}>Nuevo reto</Text>

          <Text style={styles.fieldLabel}>Título</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Ej. Reto de lectura de marzo"
            placeholderTextColor="#B0B0B0"
            autoFocus
          />

          <Text style={styles.fieldLabel}>Descripción (opcional)</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={description}
            onChangeText={setDescription}
            placeholder="¿En qué consiste el reto?"
            placeholderTextColor="#B0B0B0"
            multiline
          />

          <View style={styles.datesRow}>
            <View style={styles.dateField}>
              <Text style={styles.fieldLabel}>Inicio</Text>
              <TextInput
                style={styles.input}
                value={startText}
                onChangeText={setStartText}
                placeholder="2026-09-20"
                placeholderTextColor="#B0B0B0"
              />
            </View>
            <View style={styles.dateField}>
              <Text style={styles.fieldLabel}>Fin</Text>
              <TextInput
                style={styles.input}
                value={endText}
                onChangeText={setEndText}
                placeholder="2026-09-27"
                placeholderTextColor="#B0B0B0"
              />
            </View>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>Crear reto</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  centerWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  card: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#4A4A4A', marginBottom: 6, marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  inputMultiline: { minHeight: 60, textAlignVertical: 'top' },
  datesRow: { flexDirection: 'row', marginTop: 4 },
  dateField: { flex: 1, marginRight: 10 },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  cancelButton: { paddingVertical: 10, paddingHorizontal: 16, marginRight: 8 },
  cancelText: { color: '#8A8A8A', fontWeight: '600', fontSize: 13 },
  saveButton: { backgroundColor: '#58C759', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 20 },
  saveText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});