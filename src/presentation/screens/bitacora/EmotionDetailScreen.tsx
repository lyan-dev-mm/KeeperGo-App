// src/presentation/screens/bitacora/EmotionDetailScreen.tsx

import React, { JSX, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../../../constants/colors';
import { Emocion } from '../../../domain/entities/bitacora/Emocion';
import { useBitacora } from '../../hooks/useBitacora';
import { SaveRegistroData } from '../../../domain/usecases/bitacora/SaveRegistroUseCase';

// Componentes
import EmotionDetailHeader from '../../components/bitacora/EmotionDetailHeader';
import EmotionMedievalFrame from '../../components/bitacora/EmotionMedievalFrame';
import EmotionEnergyBar from '../../components/bitacora/EmotionEnergyBar';
import EmotionNoteCard from '../../components/bitacora/EmotionNoteCard';
import EmotionEditForm from '../../components/bitacora/EmotionEditForm';
import DeleteConfirmModal from '../../components/bitacora/DeleteConfirmModal';
import { EmotionItem } from '../../components/bitacora/EmotionWheel';

// ============================================
// INTERFACES
// ============================================

interface RegistroData {
  id: string;
  userId: string;
  fecha: string;
  emocion: string;
  emocionLabel?: string;
  color?: string;
  energia: number;
  energiaLabel?: string;
  nota?: string;
  sintomas?: string[];
  actividades?: string[];
  createdAt?: string;
  updatedAt?: string;
  reflection?: string;
  latitud?: number;
  longitud?: number;
}

interface EmotionData {
  id: string;
  label: string;
  color: string;
  image?: any;
  emoji?: string;
}

// ============================================
// ADAPTADORES
// ============================================

const adaptEmotionItemToEmotionData = (item: EmotionItem | null): EmotionData | null => {
  if (!item) return null;
  return {
    id: item.id,
    label: item.label,
    color: item.color,
    image: item.image,
    emoji: item.emoji,
  };
};

const adaptEmotionDataToEmotionItem = (data: EmotionData): EmotionItem => ({
  id: data.id,
  label: data.label,
  color: data.color,
  image: data.image,
  emoji: data.emoji || '😊',
});

// ============================================
// COMPONENTE
// ============================================

export default function EmotionDetailScreen(): JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams() as { registro?: string; fecha?: string };

  const { registro, fecha } = params;
  const registroObj: RegistroData | null = registro ? JSON.parse(registro) : null;
  const fechaDate: Date = fecha ? new Date(fecha) : new Date();

  const { deleteRegistro, saveRegistro } = useBitacora();

  // ============================================
  // ESTADO
  // ============================================

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionItem | null>(() => {
    const emocion = Emocion.getById(registroObj?.emocion || '');
    if (!emocion) return null;
    return {
      id: emocion.id,
      label: emocion.label,
      color: emocion.color,
      image: emocion.image,
      emoji: emocion.emoji || '😊',
    };
  });
  const [selectedEnergy, setSelectedEnergy] = useState<number>(registroObj?.energia || 5);
  const [note, setNote] = useState<string>(registroObj?.nota || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // ============================================
  // VALIDACIÓN
  // ============================================

  if (!registroObj) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No hay registro disponible</Text>
          <TouchableOpacity style={styles.errorButton} onPress={() => router.back()}>
            <Text style={styles.errorButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // FORMATO DE FECHA
  // ============================================

  const fechaFormateada = fechaDate.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // ============================================
  // HANDLERS
  // ============================================

  const handleEdit = (): void => {
    router.push({
      pathname: '/RegisterEmotion',
      params: {
        fecha: fecha,
        registro: JSON.stringify(registroObj),
      },
    });
  };

  const handleSave = async (): Promise<void> => {
    if (!selectedEmotion || !selectedEnergy) {
      Alert.alert('', 'Selecciona una emoción y nivel de energía');
      return;
    }

    // ✅ Crear objeto con el formato correcto para SaveRegistroData
    const updatedRegistro: SaveRegistroData = {
      id: registroObj.id,
      userId: registroObj.userId,
      fecha: new Date(registroObj.fecha), // ← Convertir a Date
      emocion: selectedEmotion.id,
      emocionLabel: selectedEmotion.label,
      color: selectedEmotion.color,
      energia: selectedEnergy,
      energiaLabel: selectedEnergy >= 7 ? 'Alta' : selectedEnergy >= 4 ? 'Media' : 'Baja',
      nota: note.trim(),
      sintomas: registroObj.sintomas || [],
      actividades: registroObj.actividades || [],
      reflection: registroObj.reflection || '',
      latitud: registroObj.latitud,
      longitud: registroObj.longitud,
    };

    try {
      const result = await saveRegistro(updatedRegistro);
      if (result) {
        Alert.alert('', '¡Registro actualizado!');
        router.back();
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el registro');
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!registroObj || !registroObj.id) {
      Alert.alert('Error', 'El registro no tiene un ID válido');
      console.error('❌ registro.id es undefined:', registroObj);
      return;
    }

    try {
      const result = await deleteRegistro(registroObj.id);
      if (result) {
        Alert.alert('', 'Registro eliminado');
        router.back();
      } else {
        Alert.alert('Error', 'No se pudo eliminar el registro');
      }
    } catch (error) {
      console.error('❌ Error en handleDelete:', error);
      Alert.alert('Error', 'No se pudo eliminar el registro');
    }
  };

  const handleCancelEdit = (): void => {
    setIsEditing(false);
    const emocion = Emocion.getById(registroObj?.emocion || '');
    if (emocion) {
      setSelectedEmotion({
        id: emocion.id,
        label: emocion.label,
        color: emocion.color,
        image: emocion.image,
        emoji: emocion.emoji || '😊',
      });
    }
    setSelectedEnergy(registroObj?.energia || 5);
    setNote(registroObj?.nota || '');
  };

  // ============================================
  // RENDERIZADO
  // ============================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* ✅ Header sin isEditing */}
      <EmotionDetailHeader
        title="Detalle"
        onBack={() => router.back()}
        onEdit={handleEdit}
        onDelete={() => setShowDeleteConfirm(true)}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{fechaFormateada}</Text>
        </View>

        {isEditing ? (
          // ✅ Modo edición con adaptadores
          <EmotionEditForm
            selectedEmotion={adaptEmotionItemToEmotionData(selectedEmotion)}
            onSelectEmotion={(emotion: EmotionData) => {
              setSelectedEmotion(adaptEmotionDataToEmotionItem(emotion));
            }}
            selectedEnergy={selectedEnergy}
            onSelectEnergy={setSelectedEnergy}
            note={note}
            onNoteChange={setNote}
            onCancel={() => setIsEditing(false)}
            onSave={handleSave}
            onDelete={() => setShowDeleteConfirm(true)}
          />
        ) : (
          // ✅ Modo visualización
          <>
            <EmotionMedievalFrame
              emotionId={registroObj.emocion}
              emotionLabel={registroObj.emocionLabel || registroObj.emocion}
              color={registroObj.color || '#9CA3AF'}
            />
            <EmotionEnergyBar energia={registroObj.energia} />
            <EmotionNoteCard nota={registroObj.nota || ''} />
          </>
        )}
      </ScrollView>

      <DeleteConfirmModal
        visible={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white, // '#F5F0E8'
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  dateContainer: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4C5A0',
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorButton: {
    backgroundColor: '#5AC155',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});