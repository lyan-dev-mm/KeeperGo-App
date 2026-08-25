import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

function showComingSoon() {
  Alert.alert('Próximamente', 'Estamos trabajando en esto, pronto estará disponible.');
}

export default function HabitsScreen() {
  const { user } = useAuth();
  const fullName = user?.name ?? '';
  const firstName = fullName.split(' ')[0] || user?.email?.split('@')[0] || 'Usuario';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Hábitos saludables</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/(tabs)/search-community')}
          >
            <Ionicons name="search-outline" size={24} color="#4A3E38" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={showComingSoon}>
            <Ionicons name="notifications-outline" size={24} color="#4A4A4A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.greetingCard}>
          <Text style={styles.greetingTitle}>Hola, {firstName}!</Text>
          <View style={styles.phrasePill}>
            <Text style={styles.phraseText}>construir un hábito no es solo constancia...</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Mis hábitos</Text>

        <View style={styles.habitCard}>
          <View style={[styles.iconContainer, { backgroundColor: '#FF8FAB' }]}>
            <Ionicons name="book" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.habitTextContainer}>
            <Text style={styles.habitTitle}>Lectura</Text>
            <Text style={styles.habitSubtitle}>Leer por lo menos 30 minutos por día.</Text>
          </View>
        </View>

        <View style={styles.habitCard}>
          <View style={[styles.iconContainer, { backgroundColor: '#B8C0FF' }]}>
            <Ionicons name="text-outline" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.habitTextContainer}>
            <Text style={styles.habitTitle}>Aprender Inglés</Text>
            <Text style={styles.habitSubtitle}>Estudiar una hora por día.</Text>
          </View>
        </View>

        <View style={styles.newHabitContainer}>
          <TouchableOpacity style={styles.newHabitButton} onPress={showComingSoon}>
            <Text style={styles.newHabitText}>Nuevo hábito</Text>
            <Ionicons name="add" size={18} color="#FFFFFF" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fabContainer} onPress={() => router.push('/kii-chat')}>
        <FontAwesome5 name="robot" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A3E38',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  greetingCard: {
    backgroundColor: '#D1F5C0',
    borderRadius: 20,
    padding: 20,
    marginTop: 5,
    marginBottom: 25,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  phrasePill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
  },
  phraseText: {
    color: '#333333',
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 15,
  },
  habitCard: {
    backgroundColor: '#FFF8DD',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 15,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  habitTextContainer: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  habitSubtitle: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  newHabitContainer: {
    alignItems: 'flex-end',
    marginTop: 5,
  },
  newHabitButton: {
    backgroundColor: '#98F59C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  newHabitText: {
    color: '#555555',
    fontWeight: '600',
    fontSize: 13,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#58C759',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
});