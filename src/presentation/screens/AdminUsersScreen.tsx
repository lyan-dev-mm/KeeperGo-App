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
import { useAdminUsers } from '../hooks/useAdminUsers';
import { isAdminEmail } from '../../utils/adminUtils';
import { AdminUserSummary } from '../../domain/entities/admin/AdminUserSummary';

export default function AdminUsersScreen() {
  const { users, isLoading, updateUserPet } = useAdminUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<AdminUserSummary | null>(null);
  const [formStreak, setFormStreak] = useState('');
  const [formBestStreak, setFormBestStreak] = useState('');
  const [formLevel, setFormLevel] = useState('');
  const [formXP, setFormXP] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const hasPet = (u: AdminUserSummary) => u.petName !== undefined;

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const openEditModal = (u: AdminUserSummary) => {
    if (!hasPet(u)) {
      Alert.alert(
        'Sin mascota creada',
        `${u.email} todavía no ha abierto la pantalla de Mascota Virtual, así que no tiene datos de racha que editar.`
      );
      return;
    }
    setEditingUser(u);
    setFormStreak(String(u.currentStreak ?? 0));
    setFormBestStreak(String(u.bestStreak ?? 0));
    setFormLevel(String(u.level ?? 1));
    setFormXP('0');
  };

  const closeModal = () => setEditingUser(null);

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
      await updateUserPet(editingUser.uid, { currentStreak, bestStreak, level, currentXP });
      closeModal();
    } catch {
      Alert.alert('Error', 'No se pudo actualizar la racha de este usuario.');
    } finally {
      setIsSaving(false);
    }
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
                {isAdminEmail(u.email) && (
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminBadgeText}>Admin</Text>
                  </View>
                )}
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
              {hasPet(u) && (
                <View style={styles.editHint}>
                  <Ionicons name="create-outline" size={14} color="#4CAF50" />
                  <Text style={styles.editHintText}>Toca para editar</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}

          {users.length === 0 && (
            <Text style={styles.emptyText}>
              No hay usuarios registrados todavía (solo aparecen cuentas creadas después de este cambio).
            </Text>
          )}

          {users.length > 0 && filteredUsers.length === 0 && (
            <Text style={styles.emptyText}>No se encontró ningún usuario con ese correo.</Text>
          )}
        </ScrollView>
      )}

      <Modal visible={editingUser !== null} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar racha</Text>
            <Text style={styles.modalSubtitle}>{editingUser?.email}</Text>

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
  adminBadge: { backgroundColor: '#4CAF50', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  adminBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  userEmail: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  userStatsRow: { flexDirection: 'row', marginTop: 8 },
  userStat: { fontSize: 12, color: '#4CAF50', fontWeight: '600', marginRight: 14 },
  noPetText: { fontSize: 12, color: '#B0BEC5', marginTop: 8, fontStyle: 'italic' },
  editHint: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  editHintText: { fontSize: 11, color: '#4CAF50', marginLeft: 4 },
  emptyText: { textAlign: 'center', color: '#9E9E9E', marginTop: 30, paddingHorizontal: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: 'bold' },
  modalSubtitle: { fontSize: 12, color: '#9E9E9E', marginBottom: 14 },
  fieldLabel: { fontSize: 12, color: '#9E9E9E', marginTop: 10, marginBottom: 4 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  cancelButton: { paddingVertical: 10, paddingHorizontal: 14 },
  cancelButtonText: { color: '#9E9E9E', fontWeight: '600', fontSize: 13 },
  saveButton: { backgroundColor: '#4CAF50', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
});