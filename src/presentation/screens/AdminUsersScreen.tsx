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
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { useAuth } from '../hooks/useAuth';
import { isAdminEmail } from '../../utils/adminUtils';
import { AdminUserSummary } from '../../domain/entities/admin/AdminUserSummary';
import { usePetOptions } from '../hooks/usePetOptions';
import { getTodayKey } from '../../utils/dateUtils';

export default function AdminUsersScreen() {
  const { user: currentAdmin } = useAuth();
  const { petOptions } = usePetOptions();
  const { users, isLoading, updateUserPet, setUserDisabled, deleteUserData } = useAdminUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<AdminUserSummary | null>(null);
  const [formStreak, setFormStreak] = useState('');
  const [formBestStreak, setFormBestStreak] = useState('');
  const [formLevel, setFormLevel] = useState('');
  const [formXP, setFormXP] = useState('');
  const [formUnlockedPets, setFormUnlockedPets] = useState<string[]>([]);
  const [formDisabled, setFormDisabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const hasPet = (u: AdminUserSummary) => u.petName !== undefined;
  const isEditingSelf = editingUser?.uid === currentAdmin?.id;

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const openEditModal = (u: AdminUserSummary) => {
    setEditingUser(u);
    setFormStreak(String(u.currentStreak ?? 0));
    setFormBestStreak(String(u.bestStreak ?? 0));
    setFormLevel(String(u.level ?? 1));
    setFormXP('0');
    setFormUnlockedPets(u.unlockedPetIds ?? []);
    setFormDisabled(u.disabled ?? false);
  };

  const closeModal = () => setEditingUser(null);

  const togglePetUnlock = (petId: string) => {
    setFormUnlockedPets((prev) =>
      prev.includes(petId) ? prev.filter((id) => id !== petId) : [...prev, petId]
    );
  };

  const parseNonNegativeInt = (value: string, fallback: number): number => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 0) return fallback;
    return parsed;
  };

  const handleSave = async () => {
    if (!editingUser) return;

    const currentStreak = parseNonNegativeInt(formStreak, editingUser.currentStreak ?? 0);
    const bestStreak = parseNonNegativeInt(formBestStreak, editingUser.bestStreak ?? 0);
    const level = Math.max(1, parseNonNegativeInt(formLevel, editingUser.level ?? 1));
    const currentXP = parseNonNegativeInt(formXP, 0);

    setIsSaving(true);
    try {
      if (hasPet(editingUser)) {
        await updateUserPet(editingUser.uid, {
          currentStreak,
          bestStreak,
          level,
          currentXP,
          lastActivityDate: getTodayKey(),
          unlockedPetIds: formUnlockedPets,
        });
      }

      if (!isEditingSelf && formDisabled !== (editingUser.disabled ?? false)) {
        await setUserDisabled(editingUser.uid, formDisabled);
      }

      closeModal();
    } catch {
      Alert.alert('Error', 'No se pudo actualizar la información de este usuario.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteData = () => {
    if (!editingUser) return;
    Alert.alert(
      'Eliminar datos del usuario',
      `Esto borrará permanentemente el perfil, la racha y la mascota de ${editingUser.email}. Su cuenta de acceso (correo/contraseña) NO se elimina — solo sus datos dentro de la app. Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar datos',
          style: 'destructive',
          onPress: async () => {
            setIsSaving(true);
            try {
              await deleteUserData(editingUser.uid);
              closeModal();
            } catch {
              Alert.alert('Error', 'No se pudieron eliminar los datos de este usuario.');
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="rgba(0,0,0,0.87)" />
        </TouchableOpacity>
        <Text style={styles.title}>Usuarios registrados</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#9E9E9E" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por correo..."
          placeholderTextColor="#9E9E9E"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#9E9E9E" />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {searchQuery.length > 0 && (
            <Text style={styles.resultsCount}>
              {filteredUsers.length} {filteredUsers.length === 1 ? 'resultado' : 'resultados'}
            </Text>
          )}

          {filteredUsers.map((u) => (
            <TouchableOpacity key={u.uid} style={styles.userCard} onPress={() => openEditModal(u)}>
              <View style={styles.userHeader}>
                <Text style={styles.userName}>{u.name || u.email}</Text>
                <View style={styles.badgeRow}>
                  {u.disabled && (
                    <View style={styles.disabledBadge}>
                      <Text style={styles.disabledBadgeText}>Deshabilitado</Text>
                    </View>
                  )}
                  {isAdminEmail(u.email) && (
                    <View style={styles.adminBadge}>
                      <Text style={styles.adminBadgeText}>Admin</Text>
                    </View>
                  )}
                </View>
              </View>
              <Text style={styles.userEmail}>{u.email}</Text>
              {hasPet(u) ? (
                <View style={styles.userStatsRow}>
                  <Text style={styles.userStat}>Mascota: {u.petName}</Text>
                  <Text style={styles.userStat}>Nivel {u.level ?? 1}</Text>
                  <Text style={styles.userStat}>Racha {u.currentStreak ?? 0}</Text>
                </View>
              ) : (
                <Text style={styles.noPetText}>Sin mascota creada todavía</Text>
              )}
              <View style={styles.editHint}>
                <Ionicons name="create-outline" size={14} color="#4CAF50" />
                <Text style={styles.editHintText}>Toca para editar</Text>
              </View>
            </TouchableOpacity>
          ))}

          {users.length === 0 && (
            <Text style={styles.emptyText}>
              No hay usuarios registrados todavía. Si tú mismo no apareces aquí, cierra sesión y
              vuelve a entrar una vez — tu perfil se creará automáticamente.
            </Text>
          )}

          {users.length > 0 && filteredUsers.length === 0 && (
            <Text style={styles.emptyText}>No se encontró ningún usuario con ese correo.</Text>
          )}
        </ScrollView>
      )}

      <Modal visible={editingUser !== null} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Editar usuario</Text>
              <Text style={styles.modalSubtitle}>{editingUser?.email}</Text>

              {isEditingSelf && (
                <View style={styles.selfWarning}>
                  <Ionicons name="information-circle-outline" size={16} color="#F57C00" />
                  <Text style={styles.selfWarningText}>
                    Estás editando tu propia cuenta — no puedes deshabilitarte ni eliminar tus
                    propios datos desde aquí.
                  </Text>
                </View>
              )}

              {editingUser && hasPet(editingUser) && (
                <>
                  <Text style={styles.fieldLabel}>Racha actual</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={formStreak}
                    onChangeText={setFormStreak}
                    keyboardType="numeric"
                    placeholder="0"
                  />

                  <Text style={styles.fieldLabel}>Mejor racha (récord)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={formBestStreak}
                    onChangeText={setFormBestStreak}
                    keyboardType="numeric"
                    placeholder="0"
                  />

                  <Text style={styles.fieldLabel}>Nivel</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={formLevel}
                    onChangeText={setFormLevel}
                    keyboardType="numeric"
                    placeholder="1"
                  />

                  <Text style={styles.fieldLabel}>XP actual (dentro del nivel)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={formXP}
                    onChangeText={setFormXP}
                    keyboardType="numeric"
                    placeholder="0"
                  />

                  <Text style={styles.sectionLabel}>Mascotas desbloqueadas manualmente</Text>
                  <Text style={styles.sectionHint}>
                    Independiente de su racha real — útil para dar una mascota como premio o para
                    pruebas.
                  </Text>
                  <View style={styles.petGrid}>
                    {petOptions.map((option) => {
                      const isChecked = formUnlockedPets.includes(option.id);
                      return (
                        <TouchableOpacity
                          key={option.id}
                          style={[styles.petChip, isChecked && styles.petChipActive]}
                          onPress={() => togglePetUnlock(option.id)}
                        >
                          <Text style={styles.petChipEmoji}>{option.emoji}</Text>
                          <Text style={[styles.petChipLabel, isChecked && styles.petChipLabelActive]}>
                            {option.name}
                          </Text>
                          {isChecked && (
                            <Ionicons name="checkmark-circle" size={14} color="#4CAF50" style={{ marginLeft: 4 }} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              <View style={styles.disabledRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionLabel}>Cuenta deshabilitada</Text>
                  <Text style={styles.sectionHint}>Bloquea su acceso a la app por completo.</Text>
                </View>
                <Switch
                  value={formDisabled}
                  onValueChange={setFormDisabled}
                  disabled={isEditingSelf}
                  trackColor={{ false: '#ccc', true: '#EF9A9A' }}
                  thumbColor={formDisabled ? '#E53935' : '#f4f3f4'}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
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

              {!isEditingSelf && (
                <TouchableOpacity
                  style={styles.deleteDataButton}
                  onPress={handleDeleteData}
                  disabled={isSaving}
                >
                  <Ionicons name="trash-outline" size={16} color="#E53935" />
                  <Text style={styles.deleteDataButtonText}>Eliminar datos del usuario</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5FBF3',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginTop: 12,
    height: 40,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: 'rgba(0,0,0,0.8)' },
  resultsCount: { fontSize: 12, color: '#9E9E9E', marginBottom: 8 },
  list: { padding: 16, paddingBottom: 60 },
  userCard: {
    backgroundColor: '#F9FBF7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  userHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  userName: { fontSize: 15, fontWeight: 'bold', color: 'rgba(0,0,0,0.87)' },
  badgeRow: { flexDirection: 'row' },
  adminBadge: { backgroundColor: '#4CAF50', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 6 },
  adminBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  disabledBadge: { backgroundColor: '#E53935', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  disabledBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  userEmail: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  userStatsRow: { flexDirection: 'row', marginTop: 8 },
  userStat: { fontSize: 12, color: '#4CAF50', fontWeight: '600', marginRight: 14 },
  noPetText: { fontSize: 12, color: '#B0BEC5', marginTop: 8, fontStyle: 'italic' },
  editHint: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  editHintText: { fontSize: 11, color: '#4CAF50', marginLeft: 4 },
  emptyText: { textAlign: 'center', color: '#9E9E9E', marginTop: 30, paddingHorizontal: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalScroll: { maxHeight: '88%' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: 'bold' },
  modalSubtitle: { fontSize: 12, color: '#9E9E9E', marginBottom: 14 },
  selfWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  selfWarningText: { flex: 1, fontSize: 11, color: '#E65100', marginLeft: 6 },
  fieldLabel: { fontSize: 12, color: '#9E9E9E', marginTop: 10, marginBottom: 4 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },
  sectionLabel: { fontSize: 13, fontWeight: 'bold', color: 'rgba(0,0,0,0.8)', marginTop: 18 },
  sectionHint: { fontSize: 11, color: '#9E9E9E', marginTop: 2, marginBottom: 10 },
  petGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  petChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  petChipActive: { backgroundColor: '#E3F2DA' },
  petChipEmoji: { fontSize: 14, marginRight: 4 },
  petChipLabel: { fontSize: 12, color: '#9E9E9E', fontWeight: '600' },
  petChipLabelActive: { color: '#2E7D32' },
  disabledRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  cancelButton: { paddingVertical: 10, paddingHorizontal: 14 },
  cancelButtonText: { color: '#9E9E9E', fontWeight: '600', fontSize: 13 },
  saveButton: { backgroundColor: '#4CAF50', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  deleteDataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 10,
  },
  deleteDataButtonText: { color: '#E53935', fontWeight: '600', fontSize: 13, marginLeft: 6 },
});