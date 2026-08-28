import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePet } from '../hooks/usePet';
import { usePetReactions } from '../hooks/usePetReactions';
import { useDailyMessage } from '../hooks/useDailyMessage';
import { usePetActivity } from '../contexts/PetActivityContext';
import { useMilestones } from '../hooks/useMilestones';
import { PetNameEditor } from '../components/PetNameEditor';
import { MotivationalBanner } from '../components/MotivationalBanner';
import { WeeklyStreakRow } from '../components/WeeklyStreakRow';
import { LevelProgressBar } from '../components/LevelProgressBar';
import { RewardsCarousel } from '../components/RewardsCarousel';
import { InteractivePet } from '../components/InteractivePet';
import { getXpRequiredForLevel } from '../../utils/xpUtils';
import { delay } from '../../utils/asyncUtils';

const DEFAULT_SPEECH = '¡Lo estás haciendo genial! Cada día te acercas más a tus metas.';

export default function MascotaVirtualScreen() {
  const { pet, isLoading, error, updateName } = usePet();
  const { message } = useDailyMessage();
  const { petRef, reactionMessage, triggerEvent } = usePetReactions();
  const { consumePendingResult } = usePetActivity();
  const { milestones } = useMilestones();

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

  const petStage: 'huevo' | 'polilla' =
    milestones.length > 0 && pet.bestStreak >= Math.min(...milestones.map((m) => m.days))
      ? 'polilla'
      : 'huevo';

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
              stage={petStage}
            />
          </View>
        </View>

        <LevelProgressBar level={pet.level} currentXP={pet.currentXP} xpRequired={xpRequired} />

        <RewardsCarousel bestStreak={pet.bestStreak} />
      </ScrollView>
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
});