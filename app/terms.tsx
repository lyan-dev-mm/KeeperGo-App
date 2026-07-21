import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { TERMS_SECTIONS, PRIVACY_SECTIONS, LAST_UPDATED } from '../constants/LegalContent';

export default function TermsScreen() {
  const { title } = useLocalSearchParams<{ title?: string }>();
  const displayTitle = title ?? 'Términos y Condiciones';
  const isPrivacy = displayTitle.toLowerCase().includes('privacidad');
  const sections = isPrivacy ? PRIVACY_SECTIONS : TERMS_SECTIONS;

  return (
    <>
      <Stack.Screen options={{ title: displayTitle }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>{displayTitle}</Text>
        <Text style={styles.updated}>Última actualización: {LAST_UPDATED}</Text>
        <View style={styles.divider} />

        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.heading}>{section.heading}</Text>
            <Text style={styles.body}>{section.body}</Text>
          </View>
        ))}

        <Text style={styles.footer}>
          Este documento es un modelo con fines académicos/de desarrollo para el proyecto KeeperGo.
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingBottom: 60 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'rgba(0,0,0,0.87)' },
  updated: { fontSize: 13, color: '#9E9E9E', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 20 },
  section: { marginBottom: 20 },
  heading: { fontSize: 16, fontWeight: 'bold', color: 'rgba(0,0,0,0.87)', marginBottom: 6 },
  body: { fontSize: 14, color: '#444', lineHeight: 21 },
  footer: {
    marginTop: 20,
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#9E9E9E',
    fontSize: 12,
  },
});