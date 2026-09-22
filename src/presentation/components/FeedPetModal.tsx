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
  Alert,
} from 'react-native';
import {
  PetOptionEntity,
  isPetOptionUnlocked,
  getCurrentStage,
  getNextStage,
} from '../../domain/entities/mascota/PetOption';

interface FeedPetModalProps {
  visible: boolean;
  onClose: () => void;
  petOptions: PetOptionEntity[];
  isLoading: boolean;
  bestStreak: number;
  unlockedPetIds: string[];
  petGrowth: Record<string, number>;
  feedingPoints: number;
  onFeed: (petOptionId: string) => Promise<void>;
}

export function FeedPetModal({
  visible,
  onClose,
  petOptions,
  isLoading,
  bestStreak,
  unlockedPetIds,
  petGrowth,
  feedingPoints,
  onFeed,
}: FeedPetModalProps) {
  const unlockedOptions = petOptions.filter((o) => isPetOptionUnlocked(o, bestStreak, unlockedPetIds));

  const handleFeed = async (option: PetOptionEntity) => {
    const pointsUsed = feedingPoints;
    try {
      await onFeed(option.id);
      Alert.alert('¡Alimentado!', `Le diste ${pointsUsed} puntos de alimento a ${option.name}.`);
    } catch (e) {
      Alert.alert('No se pudo alimentar', (e as Error).message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.centerWrapper} pointerEvents="box-none">
        <View style={styles.card}>
          <Text style={styles.title}>Alimentar mascota</Text>
          <Text style={styles.pointsText}>
            Tienes <Text style={styles.pointsNumber}>{feedingPoints}</Text> puntos de alimento disponibles
          </Text>

          {isLoading ? (
            <ActivityIndicator color="#4CAF50" style={{ marginVertical: 20 }} />
          ) : unlockedOptions.length === 0 ? (
            <Text style={styles.emptyText}>Todavía no tienes ninguna mascota desbloqueada.</Text>
          ) : (
            <View style={styles.list}>
              {unlockedOptions.map((option) => {
                const growth = petGrowth[option.id] ?? 0;
                const stage = getCurrentStage(option, growth);
                const next = getNextStage(option, growth);

                return (
                  <View key={option.id} style={styles.row}>
                    {stage.imageUrl ? (
                      <Image source={{ uri: stage.imageUrl }} style={styles.rowImage} resizeMode="contain" />
                    ) : (
                      <Text style={styles.rowEmoji}>{stage.emoji}</Text>
                    )}
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowName}>{option.name}</Text>
                      <Text style={styles.rowStage}>{stage.name}</Text>
                      <Text style={styles.rowNext}>
                        {next
                          ? `Faltan ${next.minGrowth - growth} pts para "${next.name}"`
                          : 'Etapa máxima alcanzada'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.feedButton, feedingPoints <= 0 && styles.feedButtonDisabled]}
                      onPress={() => handleFeed(option)}
                      disabled={feedingPoints <= 0}
                    >
                      <Text style={styles.feedButtonText}>Alimentar</Text>
                    </TouchableOpacity>
                  </View>
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
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '100%', maxWidth: 360, maxHeight: '80%' },
  title: { fontSize: 17, fontWeight: 'bold', color: 'rgba(0,0,0,0.87)', textAlign: 'center' },
  pointsText: { fontSize: 12, color: '#9E9E9E', textAlign: 'center', marginTop: 6, marginBottom: 14 },
  pointsNumber: { fontWeight: 'bold', color: '#4CAF50' },
  emptyText: { fontSize: 12, color: '#9E9E9E', textAlign: 'center', marginVertical: 20 },
  list: { marginBottom: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FBF7',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  rowEmoji: { fontSize: 30, width: 40, textAlign: 'center' },
  rowImage: { width: 36, height: 36 },
  rowInfo: { flex: 1, marginLeft: 10 },
  rowName: { fontSize: 13, fontWeight: 'bold', color: 'rgba(0,0,0,0.87)' },
  rowStage: { fontSize: 11, color: '#4CAF50', fontWeight: '600', marginTop: 1 },
  rowNext: { fontSize: 10, color: '#9E9E9E', marginTop: 2 },
  feedButton: { backgroundColor: '#4CAF50', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
  feedButtonDisabled: { backgroundColor: '#CCC' },
  feedButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 11 },
  closeButton: { marginTop: 6, alignItems: 'center', paddingVertical: 10 },
  closeButtonText: { color: '#9E9E9E', fontWeight: '600', fontSize: 13 },
});