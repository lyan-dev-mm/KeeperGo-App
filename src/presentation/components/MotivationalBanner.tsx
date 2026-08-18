import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MotivationalBannerProps {
  message: string;
}

export function MotivationalBanner({ message }: MotivationalBannerProps) {
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#F1F8ED',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  text: { fontSize: 14, color: '#3E6B3E', textAlign: 'center', fontWeight: '500' },
});