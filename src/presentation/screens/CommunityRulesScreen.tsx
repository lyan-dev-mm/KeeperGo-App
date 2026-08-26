// src/presentation/screens/CommunityRulesScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Reglas genéricas de ejemplo — mientras no exista un backend de
// comunidades reales, se muestra el mismo set de reglas para cualquiera.
// Cuando haya datos reales por comunidad, esto se reemplaza por el
// contenido específico de cada una.
const RULES = [
  'No compares tu ritmo con el de otros. Cada quien lee a su tiempo.',
  'Comparte para inspirar, no para presumir.',
  'Ayuda sin juzgar. No corrijas gustos.',
  'Participa cuando quieras. Sin presión, sin penalización.',
  'Contenido seguro: sin spoilers, sin ofensas.',
];

export default function CommunityRulesScreen() {
  const { title, color } = useLocalSearchParams<{ title?: string; color?: string }>();
  const communityTitle = title ?? 'Comunidad';
  const bannerColor = color ?? '#FF8FAB';

  const handleJoin = () => {
    // Cambiamos la alerta por la navegación de regreso al detalle
    router.replace({
      pathname: '/(tabs)/community-detail',
      params: { 
        title: communityTitle, 
        color: bannerColor, 
        isMember: 'true' // Avisamos que ya es miembro
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Reglas de la comunidad</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.banner, { backgroundColor: bannerColor }]}>
          <Ionicons name="book" size={48} color="#FFFFFF" />
        </View>

        <Text style={styles.communityTitle}>{communityTitle}</Text>

        <Text style={styles.intro}>
          Aquí no competimos. Nos apoyamos. Cada persona lee a su ritmo, y eso está bien.
        </Text>
        <Text style={styles.intro}>
          Si deseas integrarte en esta comunidad deberás respetar las siguientes reglas.
        </Text>

        {RULES.map((rule, index) => (
          <View key={index} style={styles.ruleRow}>
            <View style={styles.ruleIcon}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#58C759" />
            </View>
            <View style={styles.ruleTextContainer}>
              <Text style={styles.ruleLabel}>Regla {index + 1}</Text>
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
          <Text style={styles.joinButtonText}>Aceptar y Unirme</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#4A3E38' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  banner: {
    height: 130,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  communityTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 14 },
  intro: { fontSize: 13.5, color: '#333333', lineHeight: 19, marginBottom: 12 },
  ruleRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 14 },
  ruleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EAF9EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  ruleTextContainer: { flex: 1 },
  ruleLabel: { fontSize: 13, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 2 },
  ruleText: { fontSize: 13, color: '#555555', lineHeight: 18 },
  joinButton: {
    backgroundColor: '#65C466',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 30,
  },
  joinButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
});