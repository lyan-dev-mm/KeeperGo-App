import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LevelProgressBarProps {
  level: number;
  currentXP: number;
  xpRequired: number;
}

export function LevelProgressBar({ level, currentXP, xpRequired }: LevelProgressBarProps) {
  const progress = Math.min(currentXP / xpRequired, 1);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.levelText}>Nivel {level}</Text>
        <Text style={styles.xpText}>
          {currentXP} / {xpRequired} XP
        </Text>
      </View>
      <Text style={styles.subtitle}>Nivel de avance</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginTop: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  levelText: { fontSize: 20, fontWeight: 'bold', color: 'rgba(0,0,0,0.87)' },
  xpText: { fontSize: 14, fontWeight: '600', color: '#4CAF50' },
  subtitle: { fontSize: 12, color: '#9E9E9E', marginTop: 2, marginBottom: 10 },
  track: { height: 8, borderRadius: 4, backgroundColor: '#EEF5EA' },
  fill: { height: 8, borderRadius: 4, backgroundColor: '#4CAF50' },
});