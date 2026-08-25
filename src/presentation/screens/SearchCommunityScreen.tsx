import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

function showComingSoon() {
  Alert.alert('Próximamente', 'Estamos trabajando en esto, pronto estará disponible.');
}

interface Community {
  id: number;
  title: string;
  subtitle: string;
  color: string;
}

// Datos de ejemplo — cuando exista un backend real de comunidades, esta
// lista se reemplaza por una consulta a Firestore, sin tocar el resto
// de la pantalla.
const COMMUNITIES: Community[] = [
  { id: 1, title: 'Lectores por el mundo', subtitle: 'Programas de apoyo a la producció...', color: '#FF8FAB' },
  { id: 2, title: 'Lectores por el mundo', subtitle: 'Plataforma de capacitación de la SAD...', color: '#20B2AA' },
  { id: 3, title: 'Lectores por el mundo', subtitle: 'Realiza investigaciones y desarrolla...', color: '#FFD700' },
  { id: 4, title: 'Lectores por el mundo', subtitle: 'Opera programas de SADER y otra...', color: '#9370DB' },
];

const STATE_COMMUNITY: Community = {
  id: 5,
  title: 'Lectores por el mundo',
  subtitle: 'Aquí encontrarás capacitación y ases...',
  color: '#FFA07A',
};

export default function SearchCommunityScreen() {
  const [query, setQuery] = useState('');

  const filtered = COMMUNITIES.filter(
    (c) =>
      c.title.toLowerCase().includes(query.trim().toLowerCase()) ||
      c.subtitle.toLowerCase().includes(query.trim().toLowerCase())
  );

  const openCommunity = (community: Community) => {
    router.push({
      pathname: '/(tabs)/community-rules',
      params: { title: community.title, color: community.color },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Comunidades</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#58C759" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#FFFFFF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar comunidad..."
          placeholderTextColor="#E0F5E0"
          autoFocus
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <View style={styles.filtersContainer}>
        <Ionicons name="filter-outline" size={22} color="#555" style={styles.filterIcon} />
        <TouchableOpacity style={styles.filterChip} onPress={showComingSoon}>
          <Text style={styles.filterText}>Filtrar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip} onPress={showComingSoon}>
          <Ionicons name="heart-outline" size={16} color="#555" style={{ marginRight: 5 }} />
          <Text style={styles.filterText}>Favoritos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip} onPress={showComingSoon}>
          <Ionicons name="time-outline" size={16} color="#555" style={{ marginRight: 5 }} />
          <Text style={styles.filterText}>Historial</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filtered.map((item) => (
          <TouchableOpacity key={item.id} style={styles.communityItem} onPress={() => openCommunity(item)}>
            <View style={[styles.avatar, { backgroundColor: item.color }]} />
            <View style={styles.communityTextContainer}>
              <Text style={styles.communityTitle}>{item.title}</Text>
              <Text style={styles.communitySubtitle} numberOfLines={1}>
                {item.subtitle}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {filtered.length === 0 && (
          <Text style={styles.emptyText}>No se encontró ninguna comunidad con ese nombre.</Text>
        )}

        <TouchableOpacity style={styles.stateSection} onPress={showComingSoon}>
          <Text style={styles.stateText}>En tu estado</Text>
          <Ionicons name="chevron-forward" size={16} color="#1A1A1A" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.communityItem} onPress={() => openCommunity(STATE_COMMUNITY)}>
          <View style={[styles.avatar, { backgroundColor: STATE_COMMUNITY.color }]} />
          <View style={styles.communityTextContainer}>
            <Text style={styles.communityTitle}>{STATE_COMMUNITY.title}</Text>
            <Text style={styles.communitySubtitle} numberOfLines={1}>
              {STATE_COMMUNITY.subtitle}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
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
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A3E38',
  },
  searchContainer: {
    backgroundColor: '#65C466',
    marginHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 45,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterIcon: {
    marginRight: 15,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  filterText: {
    color: '#4A4A4A',
    fontSize: 13,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  communityTextContainer: {
    flex: 1,
  },
  communityTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  communitySubtitle: {
    fontSize: 13,
    color: '#A0A0A0',
  },
  emptyText: {
    textAlign: 'center',
    color: '#A0A0A0',
    marginTop: 10,
    marginBottom: 20,
  },
  stateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 20,
  },
  stateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginRight: 5,
  },
});