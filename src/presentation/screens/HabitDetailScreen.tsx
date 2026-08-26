import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useHabits, WEEK_DAY_LABELS } from '../contexts/HabitsContext';
import EditFieldModal from '../components/EditFieldModal';

function showComingSoon() {
  Alert.alert('Próximamente', 'Estamos trabajando en esto, pronto estará disponible.');
}

type EditingField = 'objetivo' | 'semilla' | 'actividad' | null;

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getHabitById, updateHabitField, addActivity, toggleActivity, deleteActivity, todayIndex } =
    useHabits();
  const habit = getHabitById(id);

  const [editingField, setEditingField] = useState<EditingField>(null);

  if (!habit) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>No se encontró este hábito.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.notFoundButton}>
            <Text style={styles.notFoundButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSaveEdit = (value: string) => {
    if (editingField === 'objetivo') updateHabitField(habit.id, 'objetivo', value);
    if (editingField === 'semilla') updateHabitField(habit.id, 'semilla', value);
  };

  const fieldConfig: Record<'objetivo' | 'semilla', { label: string; placeholder: string; multiline: boolean }> = {
    objetivo: {
      label: 'Objetivo',
      placeholder: 'Ej. Lograr leer por lo menos 3 libros al año.',
      multiline: true,
    },
    semilla: {
      label: 'Semilla por día',
      placeholder: 'Ej. Leer por lo menos 30 minutos por día',
      multiline: false,
    },
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#4A3E38" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hábitos saludables</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/(tabs)/search-community')}
          >
            <Ionicons name="search-outline" size={22} color="#4A3E38" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={showComingSoon}>
            <Ionicons name="notifications-outline" size={22} color="#4A4A4A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* --- TARJETA LILA: NOMBRE, OBJETIVO, SEMILLA --- */}
        <View style={styles.headerCard}>
          <Text style={styles.habitTitle}>{habit.title}</Text>

          <Text style={styles.fieldLabel}>Objetivo</Text>
          <TouchableOpacity onPress={() => setEditingField('objetivo')} activeOpacity={0.7}>
            <View style={styles.editableRow}>
              <Text style={styles.fieldValue}>{habit.objetivo || 'Toca para definir tu objetivo'}</Text>
              <Ionicons name="pencil" size={14} color="#7A6FA0" style={styles.fieldPencil} />
            </View>
          </TouchableOpacity>

          <Text style={styles.fieldLabel}>Semilla por dia</Text>
          <TouchableOpacity onPress={() => setEditingField('semilla')} activeOpacity={0.7}>
            <View style={styles.editableRow}>
              <Text style={styles.fieldValue}>{habit.semilla || 'Toca para definir tu semilla diaria'}</Text>
              <Ionicons name="pencil" size={14} color="#7A6FA0" style={styles.fieldPencil} />
            </View>
          </TouchableOpacity>
        </View>

        {/* --- PROGRESO --- */}
        <Text style={styles.sectionTitle}>Progreso</Text>
        <View style={styles.progressRow}>
          {habit.progress.map((done, index) => {
            // Un día futuro nunca puede mostrar palomita, sin importar
            // lo que diga la data (por ejemplo, si cambia la semana).
            const isFuture = index > todayIndex;
            const isDone = done && !isFuture;
            return (
              <View key={index} style={styles.progressDayColumn}>
                <View
                  style={[
                    styles.progressCircle,
                    isDone ? styles.progressCircleDone : styles.progressCirclePending,
                    index === todayIndex && styles.progressCircleToday,
                  ]}
                >
                  {isDone && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                </View>
                <Text style={styles.progressDayLabel}>{WEEK_DAY_LABELS[index]}</Text>
              </View>
            );
          })}
        </View>

        {/* --- COMUNIDAD --- */}
        <Text style={styles.sectionTitle}>Comunidad</Text>
        <View style={styles.communityBox}>
          <Text style={styles.communityPlaceholder}>Aquí aparecerán tus comunidades</Text>
          <View style={styles.communityIcon}>
            <Ionicons name="earth-outline" size={26} color="#58C759" />
          </View>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => router.push('/(tabs)/search-community')}
          >
            <Text style={styles.searchButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {/* --- ACTIVIDADES --- */}
        <Text style={styles.sectionTitle}>Actividades</Text>

        {habit.activities.length === 0 ? (
          <Text style={styles.emptyActivitiesText}>Aún no creas ninguna tarea.</Text>
        ) : (
          <View style={styles.activitiesList}>
            {habit.activities.map((activity) => (
              <View key={activity.id} style={styles.activityRow}>
                <TouchableOpacity
                  onPress={() => toggleActivity(habit.id, activity.id)}
                  style={styles.activityCheckbox}
                >
                  <Ionicons
                    name={activity.done ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    color={activity.done ? '#58C759' : '#C7C7C7'}
                  />
                </TouchableOpacity>
                <Text style={[styles.activityText, activity.done && styles.activityTextDone]}>
                  {activity.text}
                </Text>
                <TouchableOpacity
                  onPress={() => deleteActivity(habit.id, activity.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={16} color="#C7C7C7" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.addActivityButton}
          onPress={() => setEditingField('actividad')}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={18} color="#58C759" />
          <Text style={styles.addActivityButtonText}>Agregar actividad</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity style={styles.fabContainer} onPress={() => router.push('/kii-chat')}>
        <FontAwesome5 name="robot" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <EditFieldModal
        visible={editingField === 'objetivo' || editingField === 'semilla'}
        label={editingField && editingField !== 'actividad' ? fieldConfig[editingField].label : ''}
        placeholder={editingField && editingField !== 'actividad' ? fieldConfig[editingField].placeholder : ''}
        initialValue={editingField === 'objetivo' ? habit.objetivo : editingField === 'semilla' ? habit.semilla : ''}
        multiline={editingField && editingField !== 'actividad' ? fieldConfig[editingField].multiline : false}
        onClose={() => setEditingField(null)}
        onSave={handleSaveEdit}
      />

      <EditFieldModal
        visible={editingField === 'actividad'}
        label="Nueva actividad"
        placeholder="Ej. Leer el capítulo 3"
        initialValue=""
        onClose={() => setEditingField(null)}
        onSave={(value) => addActivity(habit.id, value)}
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
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 15,
    paddingBottom: 15,
  },
  backButton: {
    marginRight: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
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
  headerCard: {
    backgroundColor: '#E3DBF7',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
  },
  habitTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginBottom: 4,
    marginTop: 8,
  },
  editableRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  fieldValue: {
    flex: 1,
    fontSize: 13,
    color: '#333333',
    lineHeight: 18,
  },
  fieldPencil: {
    marginLeft: 8,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 15,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  progressDayColumn: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressCircleDone: {
    backgroundColor: '#58C759',
  },
  progressCirclePending: {
    backgroundColor: '#FFF3D6',
  },
  progressCircleToday: {
    borderWidth: 2,
    borderColor: '#4A3E38',
  },
  progressDayLabel: {
    fontSize: 11,
    color: '#A0A0A0',
  },
  communityBox: {
    backgroundColor: '#F4F4F4',
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 25,
  },
  communityPlaceholder: {
    fontSize: 13,
    color: '#9A9A9A',
    marginBottom: 14,
  },
  communityIcon: {
    marginBottom: 14,
  },
  searchButton: {
    backgroundColor: '#98F59C',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 22,
  },
  searchButtonText: {
    color: '#4A4A4A',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyActivitiesText: {
    fontSize: 13,
    color: '#A0A0A0',
    marginBottom: 15,
  },
  activitiesList: {
    marginBottom: 10,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  activityCheckbox: {
    marginRight: 10,
  },
  activityText: {
    flex: 1,
    fontSize: 13,
    color: '#1A1A1A',
  },
  activityTextDone: {
    textDecorationLine: 'line-through',
    color: '#A0A0A0',
  },
  addActivityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#58C759',
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 5,
  },
  addActivityButtonText: {
    color: '#58C759',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 6,
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
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 15,
    color: '#4A4A4A',
    marginBottom: 15,
  },
  notFoundButton: {
    backgroundColor: '#58C759',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  notFoundButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});