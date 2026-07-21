import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CardProps {
  title: string;
  subtitle: string;
  buttonText: string;
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

export function Card({ title, subtitle, buttonText, iconName, color, onPress }: CardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name={iconName} color={color} size={28} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onPress}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { marginLeft: 12, fontSize: 18, fontWeight: 'bold', color: 'rgba(0,0,0,0.87)' },
  subtitle: { marginTop: 8, fontSize: 14, color: '#9E9E9E' },
  button: {
    marginTop: 16,
    alignSelf: 'flex-start',
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonText: { color: '#FFFFFF', fontWeight: '600' },
});