import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SPECIALISTS } from '../../../constants/Specialists';
import { Colors } from '../../../constants/Colors';
import MapComponent from '../components/MapComponent';

export default function SpecialistsScreen() {
  const sortedSpecialists = [...SPECIALISTS].sort((a, b) => a.distanceKm - b.distanceKm);
  const [showMap, setShowMap] = useState(true);

  const handleMarkerPress = (id: string) => {
    router.push({ pathname: '/specialist-profile', params: { id } });
  };

  const toggleView = () => setShowMap(!showMap);

  // Para que el mapa tenga una altura fija (40% de la pantalla)
  const screenHeight = Dimensions.get('window').height;
  const mapHeight = screenHeight * 0.4;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="rgba(0,0,0,0.87)" />
        </TouchableOpacity>
        <Text style={styles.title}>Especialistas cerca de ti</Text>
        <TouchableOpacity onPress={toggleView}>
          <Ionicons name={showMap ? 'list' : 'map'} size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Mapa */}
      {showMap && (
        <View style={[styles.mapContainer, { height: mapHeight }]}>
          <MapComponent specialists={sortedSpecialists} onMarkerPress={handleMarkerPress} />
        </View>
      )}

      {/* Lista de especialistas (siempre visible) */}
      <ScrollView contentContainerStyle={styles.list} style={{ flex: 1 }}>
        {sortedSpecialists.map((specialist) => (
          <TouchableOpacity
            key={specialist.id}
            style={styles.card}
            onPress={() => handleMarkerPress(specialist.id)}
          >
            <Ionicons name={specialist.avatarIcon} size={48} color={Colors.primary} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{specialist.name}</Text>
              <Text style={styles.cardSpecialty}>{specialist.specialty}</Text>
              <View style={styles.cardMetaRow}>
                <Ionicons name="location-outline" size={13} color="#9E9E9E" />
                <Text style={styles.cardMetaText}>{specialist.distanceKm} km</Text>
                <Ionicons name="star" size={13} color="#FFB300" style={{ marginLeft: 12 }} />
                <Text style={styles.cardMetaText}>{specialist.rating}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9E9E9E" />
          </TouchableOpacity>
        ))}
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
  mapContainer: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  list: { padding: 16, paddingBottom: 60 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FBF7',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  cardInfo: { flex: 1, marginLeft: 14 },
  cardName: { fontSize: 15, fontWeight: 'bold', color: 'rgba(0,0,0,0.87)' },
  cardSpecialty: { fontSize: 12, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  cardMetaText: { fontSize: 11, color: '#9E9E9E', marginLeft: 4 },
});