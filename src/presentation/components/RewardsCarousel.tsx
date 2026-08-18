import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MILESTONES } from '../../../constants/Milestones';

interface RewardsCarouselProps {
  bestStreak: number;
}

const CARD_WIDTH = 110;
const CARD_GAP = 12;

export function RewardsCarousel({ bestStreak }: RewardsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_GAP));
    setActiveIndex(index);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Recompensas por racha</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {MILESTONES.map((milestone, index) => {
          const achieved = bestStreak >= milestone.days;
          return (
            <View key={milestone.days} style={styles.rewardCard}>
              <Ionicons
                name={achieved ? 'checkmark-circle' : 'lock-closed'}
                size={26}
                color={achieved ? '#4CAF50' : '#B0BEC5'}
              />
              <Text style={styles.rewardDays}>{milestone.days} días</Text>
              <Text style={styles.rewardLabel} numberOfLines={2}>
                {milestone.label}
              </Text>
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.dotsRow}>
        {MILESTONES.map((_, index) => (
          <View key={index} style={[styles.dot, index === activeIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginTop: 16 },
  title: { fontSize: 15, fontWeight: 'bold', color: 'rgba(0,0,0,0.87)', marginBottom: 12 },
  scrollContent: { paddingRight: 8 },
  rewardCard: {
    width: CARD_WIDTH,
    marginRight: CARD_GAP,
    backgroundColor: '#F7FAF5',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  rewardDays: { fontSize: 13, fontWeight: '600', color: 'rgba(0,0,0,0.8)', marginTop: 6 },
  rewardLabel: { fontSize: 11, color: '#9E9E9E', textAlign: 'center', marginTop: 2 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#DDD', marginHorizontal: 3 },
  dotActive: { backgroundColor: '#4CAF50', width: 16 },
});