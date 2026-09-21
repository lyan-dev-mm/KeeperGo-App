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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminPetOptions } from '../hooks/useAdminPetOptions';
import { PetOptionEntity, PetGrowthStage } from '../../domain/entities/mascota/PetOption';

function generateStageId() {
  return `stage-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export default function AdminPetOptionsScreen() {
  const { petOptions, isLoading, isSeeding, createPetOption, updatePetOption, deletePetOption, seedDefaults } =
    useAdminPetOptions();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingOption, setEditingOption] = useState<PetOptionEntity | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmoji, setFormEmoji] = useState('');
  const [formUnlockDays, setFormUnlockDays] = useState('');
  const [formStages, setFormStages] = useState<PetGrowthStage[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [stageModalVisible, setStageModalVisible] = useState(false);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [stageName, setStageName] = useState('');
  const [stageEmoji, setStageEmoji] = useState('');
  const [stageImageUrl, setStageImageUrl] = useState('');
  const [stageMinGrowth, setStageMinGrowth] = useState('');

  const openCreateModal = () => {
    setEditingOption(null);
    setFormName('');
    setFormEmoji('');
    setFormUnlockDays('');
    setFormStages([]);
    setModalVisible(true);
  };

  const openEditModal = (option: PetOptionEntity) => {
    setEditingOption(option);
    setFormName(option.name);
    setFormEmoji(option.emoji);
    setFormUnlockDays(String(option.unlockDays));
    setFormStages(option.stages ? [...option.stages] : []);
    setModalVisible(true);
  };

  const openCreateStageModal = () => {
    setEditingStageId(null);
    setStageName('');
    setStageEmoji('');
    setStageImageUrl('');
    setStageMinGrowth('');
    setStageModalVisible(true);
  };

  const openEditStageModal = (stage: PetGrowthStage) => {
    setEditingStageId(stage.id);
    setStageName(stage.name);
    setStageEmoji(stage.emoji);
    setStageImageUrl(stage.imageUrl ?? '');
    setStageMinGrowth(String(stage.minGrowth));
    setStageModalVisible(true);
  };

  const handleSaveStage = () => {
    const minGrowthNum = parseInt(stageMinGrowth, 10);
    if (!stageName.trim()) {
      Alert.alert('Error', 'El nombre de la etapa no puede estar vacío.');
      return;
    }
    if (!stageEmoji.trim()) {
      Alert.alert('Error', 'Agrega un emoji como respaldo, aunque tengas imagen.');
      return;
    }
    if (isNaN(minGrowthNum) || minGrowthNum < 0) {
      Alert.alert('Error', 'Ingresa un número de puntos válido (0 o más).');
      return;
    }

    const imageUrl = stageImageUrl.trim().length > 0 ? stageImageUrl.trim() : null;

    if (editingStageId) {
      setFormStages((prev) =>
        prev.map((s) =>
          s.id === editingStageId
            ? { ...s, name: stageName.trim(), emoji: stageEmoji.trim(), imageUrl, minGrowth: minGrowthNum }
            : s
        )
      );
    } else {
      setFormStages((prev) => [
        ...prev,
        {
          id: generateStageId(),
          name: stageName.trim(),
          emoji: stageEmoji.trim(),
          imageUrl,
          minGrowth: minGrowthNum,
        },
      ]);
    }
    setStageModalVisible(false);
  };

  const handleDeleteStage = (stageId: string) => {
    setFormStages((prev) => prev.filter((s) => s.id !== stageId));
  };

  const handleSaveOption = async () => {
    const daysNum = parseInt(formUnlockDays, 10);
    if (!formName.trim()) {
      Alert.alert('Error', 'El nombre de la especie no puede estar vacío.');
      return;
    }
    if (!formEmoji.trim()) {
      Alert.alert('Error', 'Agrega un emoji genérico de la especie.');
      return;
    }
    if (isNaN(daysNum) || daysNum < 0) {
      Alert.alert('Error', 'Ingresa un número de días válido (0 o más).');
      return;
    }
    if (formStages.length === 0) {
      Alert.alert('Error', 'Agrega al menos una etapa de crecimiento (por ejemplo, la etapa inicial).');
      return;
    }

    const data = {
      name: formName.trim(),
      emoji: formEmoji.trim(),
      unlockDays: daysNum,
      stages: [...formStages].sort((a, b) => a.minGrowth - b.minGrowth),
    };

    setIsSaving(true);
    try {
      if (editingOption) {
        await updatePetOption(editingOption.id, data);
      } else {
        await createPetOption(data);
      }
      setModalVisible(false);
    } catch {
      Alert.alert('Error', 'No se pudo guardar la mascota.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOption = () => {
    if (!editingOption) return;
    Alert.alert('Eliminar mascota', `¿Seguro que quieres eliminar "${editingOption.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deletePetOption(editingOption.id);
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
        <Text style={styles.title}>Mascotas y sus etapas</Text>
        <TouchableOpacity onPress={openCreateModal}>
          <Ionicons name="add-circle" size={28} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {petOptions.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Todavía no hay especies configuradas. Puedes cargar las 5 de ejemplo (sapo, ballena,
                perezoso, abeja y polilla), cada una con sus propias etapas de crecimiento, o crear
                las tuyas desde cero con el botón "+".
              </Text>
              <TouchableOpacity style={styles.seedButton} onPress={seedDefaults} disabled={isSeeding}>
                {isSeeding ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.seedButtonText}>Cargar especies por defecto</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {petOptions.map((option) => (
            <TouchableOpacity key={option.id} style={styles.card} onPress={() => openEditModal(option)}>
              <Text style={styles.cardEmoji}>{option.emoji}</Text>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{option.name}</Text>
                <Text style={styles.cardUnlock}>
                  {option.unlockDays === 0 ? 'Desde el inicio' : `Se desbloquea a los ${option.unlockDays} días`}
                </Text>
                <Text style={styles.cardStagesCount}>
                  {option.stages?.length ?? 0} {option.stages?.length === 1 ? 'etapa' : 'etapas'} de crecimiento
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9E9E9E" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Modal de la especie */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{editingOption ? 'Editar mascota' : 'Nueva mascota'}</Text>

              <Text style={styles.fieldLabel}>Nombre de la especie</Text>
              <TextInput style={styles.modalInput} value={formName} onChangeText={setFormName} placeholder="Ej. Sapo" />

              <Text style={styles.fieldLabel}>Emoji genérico (listas y selector)</Text>
              <TextInput style={styles.modalInput} value={formEmoji} onChangeText={setFormEmoji} placeholder="Ej. 🐸" />

              <Text style={styles.fieldLabel}>Días de racha para empezar a criarla (0 = desde el inicio)</Text>
              <TextInput
                style={styles.modalInput}
                value={formUnlockDays}
                onChangeText={setFormUnlockDays}
                keyboardType="numeric"
                placeholder="Ej. 15"
              />

              <View style={styles.stagesHeader}>
                <Text style={styles.sectionLabel}>Etapas de crecimiento</Text>
                <TouchableOpacity onPress={openCreateStageModal}>
                  <Ionicons name="add-circle-outline" size={22} color="#4CAF50" />
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionHint}>
                Ordénalas por puntos necesarios — de la etapa inicial (0 puntos) a la adulta.
              </Text>

              {formStages.length === 0 && (
                <Text style={styles.noStagesText}>Todavía no agregaste ninguna etapa.</Text>
              )}

              {[...formStages]
                .sort((a, b) => a.minGrowth - b.minGrowth)
                .map((stage) => (
                  <TouchableOpacity key={stage.id} style={styles.stageRow} onPress={() => openEditStageModal(stage)}>
                    {stage.imageUrl ? (
                      <Image source={{ uri: stage.imageUrl }} style={styles.stageRowImage} resizeMode="contain" />
                    ) : (
                      <Text style={styles.stageRowEmoji}>{stage.emoji}</Text>
                    )}
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.stageRowName}>{stage.name}</Text>
                      <Text style={styles.stageRowMinGrowth}>{stage.minGrowth} pts necesarios</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteStage(stage.id)}>
                      <Ionicons name="trash-outline" size={18} color="#E53935" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}

              <View style={styles.modalActions}>
                {editingOption && (
                  <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteOption}>
                    <Text style={styles.deleteButtonText}>Eliminar especie</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveOption} disabled={isSaving}>
                  {isSaving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Guardar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Sub-modal de una etapa individual */}
      <Modal
        visible={stageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStageModalVisible(false)}
      >
        <View style={styles.stageModalOverlay}>
          <View style={styles.stageModalCard}>
            <Text style={styles.modalTitle}>{editingStageId ? 'Editar etapa' : 'Nueva etapa'}</Text>

            <Text style={styles.fieldLabel}>Nombre de la etapa</Text>
            <TextInput style={styles.modalInput} value={stageName} onChangeText={setStageName} placeholder="Ej. Renacuajo" />

            <Text style={styles.fieldLabel}>Emoji (respaldo si no hay imagen)</Text>
            <TextInput style={styles.modalInput} value={stageEmoji} onChangeText={setStageEmoji} placeholder="Ej. 🐸" />

            <Text style={styles.fieldLabel}>URL de la imagen (opcional)</Text>
            <TextInput
              style={styles.modalInput}
              value={stageImageUrl}
              onChangeText={setStageImageUrl}
              placeholder="https://..."
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.fieldLabel}>Puntos de alimento necesarios para llegar aquí</Text>
            <TextInput
              style={styles.modalInput}
              value={stageMinGrowth}
              onChangeText={setStageMinGrowth}
              keyboardType="numeric"
              placeholder="Ej. 0 para la etapa inicial"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setStageModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveStage}>
                <Text style={styles.saveButtonText}>Guardar etapa</Text>
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
  cardEmoji: { fontSize: 32, width: 44, textAlign: 'center' },
  cardInfo: { flex: 1, marginLeft: 10 },
  cardName: { fontSize: 15, fontWeight: 'bold', color: 'rgba(0,0,0,0.87)' },
  cardUnlock: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  cardStagesCount: { fontSize: 11, color: '#4CAF50', fontWeight: '600', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalScroll: { maxHeight: '90%' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 4 },
  fieldLabel: { fontSize: 12, color: '#9E9E9E', marginTop: 10, marginBottom: 4 },
  modalInput: { borderWidth: 1, borderColor: '#CCC', borderRadius: 10, padding: 12, fontSize: 14 },
  stagesHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 },
  sectionLabel: { fontSize: 13, fontWeight: 'bold', color: 'rgba(0,0,0,0.8)' },
  sectionHint: { fontSize: 11, color: '#9E9E9E', marginTop: 2, marginBottom: 10 },
  noStagesText: { fontSize: 12, color: '#B0BEC5', fontStyle: 'italic', marginBottom: 10 },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  stageRowEmoji: { fontSize: 22, width: 32, textAlign: 'center' },
  stageRowImage: { width: 28, height: 28 },
  stageRowName: { fontSize: 13, fontWeight: '600', color: 'rgba(0,0,0,0.8)' },
  stageRowMinGrowth: { fontSize: 11, color: '#9E9E9E', marginTop: 1 },
  modalActions: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  deleteButton: { marginRight: 'auto' },
  deleteButtonText: { color: '#E53935', fontWeight: '600', fontSize: 13 },
  cancelButton: { paddingVertical: 10, paddingHorizontal: 14 },
  cancelButtonText: { color: '#9E9E9E', fontWeight: '600', fontSize: 13 },
  saveButton: { backgroundColor: '#4CAF50', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  stageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  stageModalCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '100%', maxWidth: 340 },
});