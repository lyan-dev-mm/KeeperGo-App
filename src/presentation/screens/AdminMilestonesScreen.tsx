import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminMilestones } from '../hooks/useAdminMilestones';
import { MilestoneEntity } from '../../domain/entities/mascota/Milestone';

export default function AdminMilestonesScreen() {
  const {
    milestones,
    isLoading,
    isSeeding,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    seedDefaults,
  } = useAdminMilestones();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<MilestoneEntity | null>(null);
  const [formDays, setFormDays] = useState('');
  const [formLabel, setFormLabel] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const openCreateModal = () => {
    setEditingMilestone(null);
    setFormDays('');
    setFormLabel('');
    setModalVisible(true);
  };

  const openEditModal = (m: MilestoneEntity) => {
    setEditingMilestone(m);
    setFormDays(String(m.days));
    setFormLabel(m.label);
    setModalVisible(true);
  };

  const handleSave = async () => {
    const daysNum = parseInt(formDays, 10);
    if (isNaN(daysNum) || daysNum <= 0) {
      Alert.alert('Error', 'Ingresa un número de días válido (mayor a 0).');
      return;
    }
    if (!formLabel.trim()) {
      Alert.alert('Error', 'El nombre de la recompensa no puede estar vacío.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingMilestone) {
        await updateMilestone(editingMilestone.id, daysNum, formLabel.trim());
      } else {
        await createMilestone(daysNum, formLabel.trim());
      }
      setModalVisible(false);
    } catch {
      Alert.alert('Error', 'No se pudo guardar la recompensa.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!editingMilestone) return;
    Alert.alert('Eliminar recompensa', `¿Seguro que quieres eliminar "${editingMilestone.label}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteMilestone(editingMilestone.id);
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
        <Text style={styles.title}>Hitos y recompensas</Text>
        <TouchableOpacity onPress={openCreateModal}>
          <Ionicons name="add-circle" size={28} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {milestones.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Todavía no hay hitos configurados. Puedes cargar los 6 que usaba la app antes (3, 7,
                15, 30, 60 y 100 días) o crear los tuyos desde cero con el botón "+".
              </Text>
              <TouchableOpacity style={styles.seedButton} onPress={seedDefaults} disabled={isSeeding}>
                {isSeeding ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.seedButtonText}>Cargar hitos por defecto</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {milestones.map((m) => (
            <TouchableOpacity key={m.id} style={styles.card} onPress={() => openEditModal(m)}>
              <View style={styles.cardDaysBadge}>
                <Text style={styles.cardDaysText}>{m.days}</Text>
                <Text style={styles.cardDaysLabel}>días</Text>
              </View>
              <Text style={styles.cardLabel}>{m.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#9E9E9E" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingMilestone ? 'Editar hito' : 'Nuevo hito'}</Text>

            <Text style={styles.fieldLabel}>Días de racha necesarios</Text>
            <TextInput
              style={styles.modalInput}
              value={formDays}
              onChangeText={setFormDays}
              keyboardType="numeric"
              placeholder="Ej. 7"
            />

            <Text style={styles.fieldLabel}>Nombre de la recompensa</Text>
            <TextInput
              style={styles.modalInput}
              value={formLabel}
              onChangeText={setFormLabel}
              placeholder="Ej. Una semana completa"
            />

            <View style={styles.modalActions}>
              {editingMilestone && (
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
  list: { padding: 16, paddingBottom: 60 },
  emptyContainer: { alignItems: 'center', paddingVertical: 20 },
  emptyText: { fontSize: 13, color: '#9E9E9E', textAlign: 'center', marginBottom: 16, lineHeight: 19 },
  seedButton: { backgroundColor: '#4CAF50', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20 },
  seedButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FBF7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  cardDaysBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E3F2DA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardDaysText: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32' },
  cardDaysLabel: { fontSize: 9, color: '#4CAF50' },
  cardLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: 'rgba(0,0,0,0.8)' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 14 },
  fieldLabel: { fontSize: 12, color: '#9E9E9E', marginTop: 10, marginBottom: 4 },
  modalInput: { borderWidth: 1, borderColor: '#CCC', borderRadius: 10, padding: 12, fontSize: 14 },
  modalActions: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  deleteButton: { marginRight: 'auto' },
  deleteButtonText: { color: '#E53935', fontWeight: '600', fontSize: 13 },
  cancelButton: { paddingVertical: 10, paddingHorizontal: 14 },
  cancelButtonText: { color: '#9E9E9E', fontWeight: '600', fontSize: 13 },
  saveButton: { backgroundColor: '#4CAF50', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
});