import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NavButtonProps {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

export function NavButton({ iconName, label, onPress }: NavButtonProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Ionicons name={iconName} size={28} color="#616161" />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  label: { marginTop: 4, fontSize: 12, color: '#616161' },
});
