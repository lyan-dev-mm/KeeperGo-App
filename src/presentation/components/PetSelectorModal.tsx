import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PetOptionEntity, isPetOptionUnlocked, getCurrentStage } from '../../domain/entities/mascota/PetOption';

interface PetSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  petOptions: PetOptionEntity[];
  isLoading: boolean;
  bestStreak: number;
  unlockedPetIds: string[];
  petGrowth: Record<string, number>;
  selectedPetId: string;
  onSelect: (petId: string) => void;
}

export function PetSelectorModal({
  visible,
  onClose,
  petOptions,
  isLoading,
  bestStreak,
  unlockedPetIds,
  petGrowth,
  selectedPetId,
  onSelect,
}: PetSelectorModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.centerWrapper} pointerEvents="box-none">
        <View style={styles.card}>
          <Text style={styles.title}>Elige tu mascota</Text>

          {isLoading ? (
            <ActivityIndicator color="#4CAF50" style={{ marginVertical: 20 }} />
          ) : petOptions.length === 0 ? (
            <Text style={styles.emptyText}>Todavía no hay mascotas configuradas.</Text>
          ) : (
            <View style={styles.grid}>
              {petOptions.map((option) => {
                const unlocked = isPetOptionUnlocked(option, bestStreak, unlockedPetIds);
                const isSelected = option.id === selectedPetId;
                const growth = petGrowth[option.id] ?? 0;
                const stage = unlocked ? getCurrentStage(option, growth) : null;

                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.petCard,
                      isSelected && styles.petCardSelected,
                      !unlocked && styles.petCardLocked,
                    ]}
                    disabled={!unlocked}
                    onPress={() => {
                      onSelect(option.id);
                      onClose();
                    }}
                  >
                    {unlocked ? (
                      stage?.imageUrl ? (
                        <Image source={{ uri: stage.imageUrl }} style={styles.petImage} resizeMode="contain" />
                      ) : (
                        <Text style={styles.petEmoji}>{stage?.emoji ?? option.emoji}</Text>
                      )
                    ) : (
                      <Ionicons name="lock-closed" size={26} color="#B0BEC5" />
                    )}

                    <Text style={[styles.petName, !unlocked && styles.petNameLocked]}>{option.name}</Text>

                    {unlocked ? (
                      <Text style={styles.stageText}>{stage?.name}</Text>
                    ) : (
                      <Text style={styles.unlockText}>{option.unlockDays} días</Text>
                    )}

                    {isSelected && unlocked && (
                      <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  centerWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 340,
  },
  title: { fontSize: 17, fontWeight: 'bold', color: 'rgba(0,0,0,0.87)', textAlign: 'center', marginBottom: 16 },
  emptyText: { fontSize: 12, color: '#9E9E9E', textAlign: 'center', marginVertical: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  petCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#F5FBF3',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 6,
  },
  petCardSelected: { borderColor: '#4CAF50' },
  petCardLocked: { backgroundColor: '#F5F5F5' },
  petEmoji: { fontSize: 28 },
  petImage: { width: 36, height: 36 },
  petName: { fontSize: 11, fontWeight: '600', color: 'rgba(0,0,0,0.8)', marginTop: 6, textAlign: 'center' },
  petNameLocked: { color: '#B0BEC5' },
  stageText: { fontSize: 9, color: '#4CAF50', marginTop: 1, textAlign: 'center' },
  unlockText: { fontSize: 9, color: '#B0BEC5', marginTop: 2 },
  selectedBadge: { position: 'absolute', top: 6, right: 6 },
  closeButton: { marginTop: 10, alignItems: 'center', paddingVertical: 10 },
  closeButtonText: { color: '#9E9E9E', fontWeight: '600', fontSize: 13 },
});