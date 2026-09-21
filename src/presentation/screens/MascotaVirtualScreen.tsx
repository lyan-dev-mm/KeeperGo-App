import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePet } from '../hooks/usePet';
import { usePetReactions } from '../hooks/usePetReactions';
import { useDailyMessage } from '../hooks/useDailyMessage';
import { usePetActivity } from '../contexts/PetActivityContext';
import { usePetOptions } from '../hooks/usePetOptions';
import { PetNameEditor } from '../components/PetNameEditor';
import { MotivationalBanner } from '../components/MotivationalBanner';
import { WeeklyStreakRow } from '../components/WeeklyStreakRow';
import { LevelProgressBar } from '../components/LevelProgressBar';
import { RewardsCarousel } from '../components/RewardsCarousel';
import { InteractivePet } from '../components/InteractivePet';
import { PetSelectorModal } from '../components/PetSelectorModal';
import { FeedPetModal } from '../components/FeedPetModal';
import { getXpRequiredForLevel } from '../../utils/xpUtils';
import { delay } from '../../utils/asyncUtils';
import { getCurrentStage } from '../../domain/entities/mascota/PetOption';

const DEFAULT_SPEECH = '¡Lo estás haciendo genial! Cada día te acercas más a tus metas.';

export default function MascotaVirtualScreen() {
  const { pet, isLoading, error, updateName, selectPet, feedPet } = usePet();
  const { message } = useDailyMessage();
  const { petRef, reactionMessage, triggerEvent } = usePetReactions();
  const { consumePendingResult } = usePetActivity();
  const { petOptions, isLoading: optionsLoading } = usePetOptions();
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [feedVisible, setFeedVisible] = useState(false);

  useEffect(() => {
    if (!pet) return;

    const pending = consumePendingResult();

    (async () => {
      if (pending) {
        await triggerEvent('ACTIVIDAD_COMPLETADA');
        if (pending.streakIncreased) {
          await delay(700);
          await triggerEvent('RACHA_AUMENTADA');
        }
        if (pending.unlockedMilestone) {
          await delay(700);
          await triggerEvent('RECOMPENSA_DESBLOQUEADA');
        }
        if (pending.leveledUp) {
          await delay(700);
          await triggerEvent('NUEVO_NIVEL');
        }
      } else {
        await triggerEvent('BIENVENIDA');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pet?.id]);

  if (isLoading || !pet) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    );
  }

  const xpRequired = getXpRequiredForLevel(pet.level);
  const unlockedPetIds = pet.unlockedPetIds ?? [];
  const petGrowth = pet.petGrowth ?? {};
  const feedingPoints = pet.feedingPoints ?? 0;

  const selectedOption = petOptions.find((o) => o.id === pet.selectedPetId) ?? petOptions[0] ?? null;
  const currentStage = selectedOption
    ? getCurrentStage(selectedOption, petGrowth[selectedOption.id] ?? 0)
    : null;

  const handleSelectPet = async (petId: string) => {
    try {
      await selectPet(petId);
    } catch (e) {
      Alert.alert('No disponible', (e as Error).message);
    }
  };

  const handleFeed = async (petOptionId: string) => {
    await feedPet(petOptionId);
    if (petOptionId === selectedOption?.id) {
      await triggerEvent('RECOMPENSA_DESBLOQUEADA');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Mascota Virtual</Text>

        <PetNameEditor name={pet.name} onSave={updateName} />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <MotivationalBanner message={message} />

        <View style={styles.streakCard}>
          <View style={styles.streakLeft}>
            <Text style={styles.streakLabel}>Días consecutivos</Text>
            <Text style={styles.streakNumber}>{pet.currentStreak}</Text>
            <Text style={styles.streakSubtitle}>
              {pet.currentStreak > 0 ? '¡Imparable! ✨' : 'Comienza hoy'}
            </Text>
            <WeeklyStreakRow activeDates={pet.activeDates} />
          </View>

          <View style={styles.petPanel}>
            <View style={styles.speechBubble}>
              <Text style={styles.speechText}>{reactionMessage ?? DEFAULT_SPEECH}</Text>
            </View>
            <InteractivePet
              ref={petRef}
              onTap={() => triggerEvent('INTERACCION_MASCOTA')}
              size={64}
              stage={currentStage}
            />
            {currentStage && <Text style={styles.stageLabel}>{currentStage.name}</Text>}
            <TouchableOpacity style={styles.changePetButton} onPress={() => setSelectorVisible(true)}>
              <Text style={styles.changePetText}>Cambiar mascota</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.feedingCard}>
          <View>
            <Text style={styles.feedingLabel}>Puntos de alimento</Text>
            <Text style={styles.feedingPoints}>{feedingPoints}</Text>
          </View>
          <TouchableOpacity style={styles.feedButton} onPress={() => setFeedVisible(true)}>
            <Text style={styles.feedButtonText}>Alimentar</Text>
          </TouchableOpacity>
        </View>

        <LevelProgressBar level={pet.level} currentXP={pet.currentXP} xpRequired={xpRequired} />

        <RewardsCarousel bestStreak={pet.bestStreak} />
      </ScrollView>

      <PetSelectorModal
        visible={selectorVisible}
        onClose={() => setSelectorVisible(false)}
        petOptions={petOptions}
        isLoading={optionsLoading}
        bestStreak={pet.bestStreak}
        unlockedPetIds={unlockedPetIds}
        petGrowth={petGrowth}
        selectedPetId={selectedOption?.id ?? ''}
        onSelect={handleSelectPet}
      />

      <FeedPetModal
        visible={feedVisible}
        onClose={() => setFeedVisible(false)}
        petOptions={petOptions}
        isLoading={optionsLoading}
        bestStreak={pet.bestStreak}
        unlockedPetIds={unlockedPetIds}
        petGrowth={petGrowth}
        feedingPoints={feedingPoints}
        onFeed={handleFeed}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF4E3' },
  loadingContainer: { flex: 1, backgroundColor: '#EAF4E3', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingTop: 12, paddingBottom: 60 },
  title: { fontSize: 20, fontWeight: 'bold', color: 'rgba(0,0,0,0.87)', marginTop: 8 },
  errorText: { color: '#E53935', fontSize: 12, marginTop: 8 },
  streakCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginTop: 16,
    flexDirection: 'row',
  },
  streakLeft: { flex: 1.1 },
  streakLabel: { fontSize: 13, color: '#9E9E9E' },
  streakNumber: { fontSize: 40, fontWeight: 'bold', color: 'rgba(0,0,0,0.87)', marginTop: 2 },
  streakSubtitle: { fontSize: 13, color: '#4CAF50', fontWeight: '600', marginBottom: 6 },
  petPanel: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  speechBubble: { backgroundColor: '#F1F8ED', borderRadius: 12, padding: 10, marginBottom: 10 },
  speechText: { fontSize: 11, color: '#3E6B3E', textAlign: 'center' },
  stageLabel: { fontSize: 11, color: '#9E9E9E', marginTop: 4, fontWeight: '600' },
  changePetButton: { marginTop: 6 },
  changePetText: { fontSize: 11, color: '#4CAF50', fontWeight: '600', textDecorationLine: 'underline' },
  feedingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  feedingLabel: { fontSize: 12, color: '#9E9E9E' },
  feedingPoints: { fontSize: 22, fontWeight: 'bold', color: '#4CAF50', marginTop: 2 },
  feedButton: { backgroundColor: '#4CAF50', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 18 },
  feedButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
});