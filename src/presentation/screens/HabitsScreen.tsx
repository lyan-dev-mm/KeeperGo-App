import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useHabits, Habit } from '../contexts/HabitsContext';
import EditFieldModal from '../components/EditFieldModal';

function showComingSoon() {
  Alert.alert('Próximamente', 'Estamos trabajando en esto, pronto estará disponible.');
}

export default function HabitsScreen() {
  const { user } = useAuth();
  const { habits, addHabit, renameHabit, deleteHabits } = useHabits();
  const [renameTarget, setRenameTarget] = useState<Habit | null>(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Estados para el Modal de crear hábito
  const [isCreating, setIsCreating] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');

  const fullName = user?.name ?? '';
  const firstName = fullName.split(' ')[0] || user?.email?.split('@')[0] || 'Usuario';

  const goToHabitDetail = (habitId: string) => {
    router.push({ pathname: '/(tabs)/habit-detail', params: { id: habitId } });
  };

  const handleCreateHabit = () => {
    setNewHabitTitle('');
    setIsCreating(true);
  };

  const confirmCreateHabit = () => {
    if (newHabitTitle.trim()) {
      const newId = addHabit(newHabitTitle.trim());
      setIsCreating(false);
      goToHabitDetail(newId);
    }
  };

  const handleSaveRename = (newTitle: string) => {
    if (renameTarget && newTitle.trim()) {
      renameHabit(renameTarget.id, newTitle.trim());
    }
  };

  const toggleDeleteMode = () => {
    setDeleteMode((prev) => !prev);
    setSelectedIds(new Set());
  };

  const toggleSelected = (habitId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(habitId)) {
        next.delete(habitId);
      } else {
        next.add(habitId);
      }
      return next;
    });
  };

  const handleConfirmDelete = () => {
    if (selectedIds.size === 0) return;
    Alert.alert(
      'Eliminar hábitos',
      `¿Seguro que quieres eliminar ${selectedIds.size} hábito${selectedIds.size > 1 ? 's' : ''}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteHabits(Array.from(selectedIds));
            setDeleteMode(false);
            setSelectedIds(new Set());
          },
        },
      ]
    );
  };

  const handleHabitCardPress = (habitId: string) => {
    if (deleteMode) {
      toggleSelected(habitId);
    } else {
      goToHabitDetail(habitId);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Hábitos saludables</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/(tabs)/search-community')}
          >
            <Ionicons name="search-outline" size={24} color="#4A3E38" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={showComingSoon}>
            <Ionicons name="notifications-outline" size={24} color="#4A4A4A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.greetingCard}>
          <Text style={styles.greetingTitle}>Hola, {firstName}!</Text>
          <View style={styles.phrasePill}>
            <Text style={styles.phraseText}>construir un hábito no es solo constancia...</Text>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Mis hábitos</Text>
          <TouchableOpacity
            onPress={toggleDeleteMode}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={deleteMode ? 'close' : 'trash-outline'}
              size={20}
              color={deleteMode ? '#FF6B6B' : '#A0A0A0'}
            />
          </TouchableOpacity>
        </View>

        {habits.map((habit) => {
          const isSelected = selectedIds.has(habit.id);
          return (
            <View key={habit.id} style={styles.habitCard}>
              <TouchableOpacity
                style={styles.habitCardBody}
                onPress={() => handleHabitCardPress(habit.id)}
                activeOpacity={0.7}
              >
                {deleteMode && (
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    color={isSelected ? '#FF6B6B' : '#C7C7C7'}
                    style={styles.selectIcon}
                  />
                )}
                <View style={[styles.iconContainer, { backgroundColor: habit.color }]}>
                  <Ionicons name={habit.icon as any} size={20} color="#FFFFFF" />
                </View>
                <View style={styles.habitTextContainer}>
                  <Text style={styles.habitTitle}>{habit.title}</Text>
                  <Text style={styles.habitSubtitle} numberOfLines={1}>
                    {habit.semilla || 'Toca para configurar este hábito.'}
                  </Text>
                </View>
              </TouchableOpacity>

              {!deleteMode && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setRenameTarget(habit)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="pencil" size={16} color="#A0A0A0" />
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {deleteMode ? (
          <View style={styles.deleteActionsRow}>
            <TouchableOpacity style={styles.cancelDeleteButton} onPress={toggleDeleteMode}>
              <Text style={styles.cancelDeleteText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmDeleteButton,
                selectedIds.size === 0 && styles.confirmDeleteButtonDisabled,
              ]}
              onPress={handleConfirmDelete}
              disabled={selectedIds.size === 0}
            >
              <Ionicons name="trash-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.confirmDeleteText}>
                Eliminar{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.newHabitContainer}>
            <TouchableOpacity style={styles.newHabitButton} onPress={handleCreateHabit}>
              <Text style={styles.newHabitText}>Nuevo hábito</Text>
              <Ionicons name="add" size={18} color="#FFFFFF" style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fabContainer} onPress={() => router.push('/kii-chat')}>
        <FontAwesome5 name="robot" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal para crear un nuevo hábito con nombre */}
      <Modal
        visible={isCreating}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCreating(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuevo hábito</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej. Meditar, Leer, Ejercicio..."
              value={newHabitTitle}
              onChangeText={setNewHabitTitle}
              autoFocus={true}
            />
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.cancelModalButton} onPress={() => setIsCreating(false)}>
                <Text style={styles.cancelModalText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmModalButton} onPress={confirmCreateHabit}>
                <Text style={styles.confirmModalText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <EditFieldModal
        visible={!!renameTarget}
        label="Nombre del hábito"
        placeholder="Ej. Hacer ejercicio"
        initialValue={renameTarget ? renameTarget.title : ''}
        onClose={() => setRenameTarget(null)}
        onSave={handleSaveRename}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A3E38',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  greetingCard: {
    backgroundColor: '#D1F5C0',
    borderRadius: 20,
    padding: 20,
    marginTop: 5,
    marginBottom: 25,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  phrasePill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
  },
  phraseText: {
    color: '#333333',
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  habitCard: {
    backgroundColor: '#FFF8DD',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 15,
  },
  habitCardBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  habitTextContainer: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  habitSubtitle: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  editButton: {
    paddingLeft: 10,
    paddingVertical: 4,
  },
  selectIcon: {
    marginRight: 12,
  },
  deleteActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 5,
  },
  cancelDeleteButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  cancelDeleteText: {
    color: '#8A8A8A',
    fontWeight: '600',
    fontSize: 13,
  },
  confirmDeleteButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  confirmDeleteButtonDisabled: {
    backgroundColor: '#F3B8B8',
  },
  confirmDeleteText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  newHabitContainer: {
    alignItems: 'flex-end',
    marginTop: 5,
  },
  newHabitButton: {
    backgroundColor: '#98F59C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  newHabitText: {
    color: '#555555',
    fontWeight: '600',
    fontSize: 13,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#58C759',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  // --- ESTILOS DEL MODAL DE CREAR HÁBITO ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1A1A1A',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
    color: '#1A1A1A',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelModalButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  cancelModalText: {
    color: '#888',
    fontWeight: '600',
  },
  confirmModalButton: {
    backgroundColor: '#58C759',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  confirmModalText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});