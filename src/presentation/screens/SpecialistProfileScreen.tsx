import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getSpecialistById } from '../../../constants/Specialists';
import { Colors } from '../../../constants/colors';

export default function SpecialistProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const specialist = getSpecialistById(id);

  if (!specialist) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>No se encontró la información de este especialista.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleChatPress = () => {
    router.push({
      pathname: '/specialist-chat',
      params: { id: specialist.id, name: specialist.name },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="rgba(0,0,0,0.87)" />
        </TouchableOpacity>
        <Text style={styles.title}>Perfil del especialista</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarContainer}>
          <Ionicons name={specialist.avatarIcon} size={80} color={Colors.primary} />
        </View>

        <Text style={styles.name}>{specialist.name}</Text>
        <Text style={styles.specialty}>{specialist.specialty}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={16} color="#9E9E9E" />
            <Text style={styles.metaText}>{specialist.distanceKm} km</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={16} color="#FFB300" />
            <Text style={styles.metaText}>{specialist.rating}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color="#9E9E9E" />
            <Text style={styles.metaText}>{specialist.yearsExperience} años de exp.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Biografía</Text>
          <Text style={styles.bio}>{specialist.bio}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Credenciales</Text>
          {specialist.credentials.map((cred, idx) => (
            <View key={idx} style={styles.credentialItem}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
              <Text style={styles.credentialText}>{cred}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.chatButton} onPress={handleChatPress}>
          <Ionicons name="chatbubble-ellipses" size={22} color="#fff" />
          <Text style={styles.chatButtonText}>Chatear con {specialist.name.split(' ')[0]}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: { fontSize: 17, fontWeight: 'bold', color: 'rgba(0,0,0,0.87)' },
  content: { padding: 20, paddingBottom: 40 },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  name: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: 'rgba(0,0,0,0.87)' },
  specialty: { fontSize: 16, color: Colors.primary, textAlign: 'center', marginTop: 4 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { marginLeft: 4, fontSize: 13, color: '#555' },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: 'rgba(0,0,0,0.87)' },
  bio: { fontSize: 14, lineHeight: 22, color: '#444' },
  credentialItem: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  credentialText: { marginLeft: 8, fontSize: 14, color: '#444' },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 30,
  },
  chatButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFoundText: { fontSize: 16, color: '#888' },
  backLink: { marginTop: 12, color: Colors.primary, fontWeight: '600' },
});