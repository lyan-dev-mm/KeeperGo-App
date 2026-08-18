import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCurrentWeekKeys, getTodayKey } from '../../utils/dateUtils';

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

interface WeeklyStreakRowProps {
  activeDates: string[];
}

export function WeeklyStreakRow({ activeDates }: WeeklyStreakRowProps) {
  const weekKeys = getCurrentWeekKeys();
  const activeSet = new Set(activeDates);
  const todayKey = getTodayKey();

  return (
    <View style={styles.row}>
      {weekKeys.map((key, index) => {
        const isActive = activeSet.has(key);
        const isToday = key === todayKey;
        return (
          <View key={key} style={styles.dayColumn}>
            <View style={[styles.circle, isActive && styles.circleActive, isToday && styles.circleToday]}>
              {isActive && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>{DAY_LABELS[index]}</Text>
          </View>
        );
      })}
    </View>
  );
}

const CIRCLE_SIZE = 28;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  dayColumn: { alignItems: 'center' },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 1.5,
    borderColor: '#D9E8D3',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  circleActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  circleToday: { borderColor: '#2E7D32', borderWidth: 2 },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  dayLabel: { marginTop: 4, fontSize: 12, color: '#9E9E9E' },
  dayLabelToday: { color: '#2E7D32', fontWeight: 'bold' },
});