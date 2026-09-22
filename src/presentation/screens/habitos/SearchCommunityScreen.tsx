import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { CommunityRepositoryImpl } from '../../../data/repositories/comunidad/CommunityRepositoryImpl';
import { GetCommunitiesUseCase } from '../../../domain/usecases/comunidad/GetCommunitiesUseCase';
import { CommunityEntity } from '../../../domain/entities/comunidad/Community';

function showComingSoon() {
  Alert.alert('Próximamente', 'Estamos trabajando en esto, pronto estará disponible.');
}

const communityRepository = new CommunityRepositoryImpl();
const getCommunitiesUseCase = new GetCommunitiesUseCase(communityRepository);

export default function SearchCommunityScreen() {
  const [query, setQuery] = useState('');
  const [communities, setCommunities] = useState<CommunityEntity[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCommunities = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getCommunitiesUseCase.execute();
      setCommunities(result);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las comunidades. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCommunities();
  }, [loadCommunities]);

  const filtered = communities.filter(
    (c) =>
      c.name.toLowerCase().includes(query.trim().toLowerCase()) ||
      c.description.toLowerCase().includes(query.trim().toLowerCase())
  );

   const openCommunity = (community: CommunityEntity) => {
    // Redirige a la pantalla de reglas en lugar de directamente al detalle
    router.push({ pathname: '/(tabs)/community-rules', params: { id: community.id } });
  };

  const goToCreateCommunity = () => {
    router.push('/(tabs)/create-community');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Comunidades</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={goToCreateCommunity} style={styles.headerIconButton}>
            <Ionicons name="add-circle-outline" size={26} color="#58C759" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerIconButton}>
            <Ionicons name="chevron-back" size={28} color="#58C759" />
          </TouchableOpacity>
        </View>
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

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color="#58C759" size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {communities.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="people-outline" size={40} color="#C7C7C7" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyStateTitle}>Todavía no hay comunidades</Text>
              <Text style={styles.emptyStateText}>Sé el primero en crear una para tu hábito favorito.</Text>
              <TouchableOpacity style={styles.emptyStateButton} onPress={goToCreateCommunity}>
                <Text style={styles.emptyStateButtonText}>Crear comunidad</Text>
              </TouchableOpacity>
            </View>
          ) : filtered.length === 0 ? (
            <Text style={styles.emptyText}>No se encontró ninguna comunidad con ese nombre.</Text>
          ) : (
            filtered.map((item) => (
              <TouchableOpacity key={item.id} style={styles.communityItem} onPress={() => openCommunity(item)}>
                {item.coverImage ? (
                  <Image source={{ uri: item.coverImage.url }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: item.color }]} />
                )}
                <View style={styles.communityTextContainer}>
                  <Text style={styles.communityTitle}>{item.name}</Text>
                  <Text style={styles.communitySubtitle} numberOfLines={1}>
                    {item.description || `${item.memberCount} integrante${item.memberCount !== 1 ? 's' : ''}`}
                  </Text>
                </View>
                {item.visibility === 'private' && (
                  <Ionicons name="lock-closed-outline" size={16} color="#A0A0A0" />
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
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
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    marginLeft: 15,
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyStateContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  emptyStateText: {
    fontSize: 13,
    color: '#A0A0A0',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 30,
  },
  emptyStateButton: {
    backgroundColor: '#98F59C',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 22,
  },
  emptyStateButtonText: {
    color: '#333333',
    fontWeight: '600',
    fontSize: 13,
  },
});