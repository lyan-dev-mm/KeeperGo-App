import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminMessages } from '../hooks/useAdminMessages';
import { MessageCategory, MotivationalMessageEntity } from '../../domain/entities/mascota/MotivationalMessage';

const CATEGORY_OPTIONS: MessageCategory[] = [
  'general',
  'racha',
  'nivel',
  'actividad',
  'recompensa',
  'bienvenida',
  'logro',
];

export default function AdminMessagesScreen() {
  const { messages, isLoading, createMessage, updateMessage, toggleActive, deleteMessage } =
    useAdminMessages();
  const [filterCategory, setFilterCategory] = useState<MessageCategory | 'todas'>('todas');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMessage, setEditingMessage] = useState<MotivationalMessageEntity | null>(null);
  const [formText, setFormText] = useState('');
  const [formCategory, setFormCategory] = useState<MessageCategory>('general');
  const [isSaving, setIsSaving] = useState(false);

  const filteredMessages =
    filterCategory === 'todas' ? messages : messages.filter((m) => m.category === filterCategory);

  const openCreateModal = () => {
    setEditingMessage(null);
    setFormText('');
    setFormCategory('general');
    setModalVisible(true);
  };

  const openEditModal = (message: MotivationalMessageEntity) => {
    setEditingMessage(message);
    setFormText(message.text);
    setFormCategory(message.category);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formText.trim()) {
      Alert.alert('Error', 'El mensaje no puede estar vacío.');
      return;
    }
    setIsSaving(true);
    try {
      if (editingMessage) {
        await updateMessage(editingMessage.id, formText.trim(), formCategory);
      } else {
        await createMessage(formText.trim(), formCategory);
      }
      setModalVisible(false);
    } catch {
      Alert.alert('Error', 'No se pudo guardar el mensaje.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!editingMessage) return;
    Alert.alert('Eliminar mensaje', '¿Seguro que quieres eliminar este mensaje?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteMessage(editingMessage.id);
          setModalVisible(false);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="rgba(0,0,0,0.87)" />
        </TouchableOpacity>
        <Text style={styles.title}>Mensajes motivacionales</Text>
        <TouchableOpacity onPress={openCreateModal}>
          <Ionicons name="add-circle" size={28} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {(['todas', ...CATEGORY_OPTIONS] as const).map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, filterCategory === cat && styles.filterChipActive]}
            onPress={() => setFilterCategory(cat)}
          >
            <Text style={[styles.filterChipText, filterCategory === cat && styles.filterChipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {filteredMessages.map((message) => (
            <TouchableOpacity key={message.id} style={styles.messageCard} onPress={() => openEditModal(message)}>
              <View style={styles.messageCardHeader}>
                <Text style={styles.messageCategory}>{message.category}</Text>
                <Switch
                  value={message.active}
                  onValueChange={(value) => toggleActive(message.id, value)}
                  trackColor={{ false: '#ccc', true: '#A5D6A7' }}
                  thumbColor={message.active ? '#4CAF50' : '#f4f3f4'}
                />
              </View>
              <Text style={styles.messageText} numberOfLines={2}>
                {message.text}
              </Text>
              <Text style={styles.messageUsage}>Usado {message.usageCount} veces</Text>
            </TouchableOpacity>
          ))}
          {filteredMessages.length === 0 && (
            <Text style={styles.emptyText}>No hay mensajes en esta categoría.</Text>
          )}
        </ScrollView>
      )}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingMessage ? 'Editar mensaje' : 'Nuevo mensaje'}</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Texto del mensaje"
              value={formText}
              onChangeText={setFormText}
              multiline
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryPicker}>
              {CATEGORY_OPTIONS.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryOption, formCategory === cat && styles.categoryOptionActive]}
                  onPress={() => setFormCategory(cat)}
                >
                  <Text
                    style={[styles.categoryOptionText, formCategory === cat && styles.categoryOptionTextActive]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              {editingMessage && (
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                  <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: { fontSize: 17, fontWeight: 'bold', color: 'rgba(0,0,0,0.87)' },
  filterRow: { maxHeight: 46, paddingLeft: 16 },
  filterContent: { paddingRight: 16, alignItems: 'center' },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5FBF3',
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: '#4CAF50' },
  filterChipText: { fontSize: 12, color: '#4CAF50', fontWeight: '600' },
  filterChipTextActive: { color: '#fff' },
  list: { padding: 16, paddingBottom: 60 },
  messageCard: {
    backgroundColor: '#F9FBF7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  messageCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  messageCategory: { fontSize: 11, color: '#4CAF50', fontWeight: 'bold', textTransform: 'uppercase' },
  messageText: { fontSize: 14, color: 'rgba(0,0,0,0.8)', marginTop: 6 },
  messageUsage: { fontSize: 11, color: '#9E9E9E', marginTop: 6 },
  emptyText: { textAlign: 'center', color: '#9E9E9E', marginTop: 30 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 14 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  categoryPicker: { marginTop: 14, maxHeight: 40 },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F5FBF3',
    marginRight: 8,
  },
  categoryOptionActive: { backgroundColor: '#4CAF50' },
  categoryOptionText: { fontSize: 12, color: '#4CAF50', fontWeight: '600' },
  categoryOptionTextActive: { color: '#fff' },
  modalActions: { flexDirection: 'row', marginTop: 20, alignItems: 'center' },
  deleteButton: { marginRight: 'auto' },
  deleteButtonText: { color: '#E53935', fontWeight: '600', fontSize: 13 },
  cancelButton: { paddingVertical: 10, paddingHorizontal: 14 },
  cancelButtonText: { color: '#9E9E9E', fontWeight: '600', fontSize: 13 },
  saveButton: { backgroundColor: '#4CAF50', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
});