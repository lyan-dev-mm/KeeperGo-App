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
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { CommunityRepositoryImpl } from '../../../data/repositories/comunidad/CommunityRepositoryImpl';
import { FavoriteCommunityRepositoryImpl } from '../../../data/repositories/comunidad/FavoriteCommunityRepositoryImpl';
import { GetCommunitiesUseCase } from '../../../domain/usecases/comunidad/GetCommunitiesUseCase';
import { GetFavoriteCommunitiesUseCase } from '../../../domain/usecases/comunidad/GetFavoriteCommunitiesUseCase';
import { ToggleFavoriteCommunityUseCase } from '../../../domain/usecases/comunidad/ToggleFavoriteCommunityUseCase';
import { CommunityEntity } from '../../../domain/entities/comunidad/Community';
import {
  getCommunityHistory,
  addToCommunityHistory,
  clearCommunityHistory,
  HistoryItem,
} from '../../../infrastructure/storage/communityHistoryStorage';
import { useAuth } from '../../hooks/useAuth';

const communityRepository = new CommunityRepositoryImpl();
const favoriteRepository = new FavoriteCommunityRepositoryImpl();

const getCommunitiesUseCase = new GetCommunitiesUseCase(communityRepository);
const getFavoritesUseCase = new GetFavoriteCommunitiesUseCase(favoriteRepository);
const toggleFavoriteUseCase = new ToggleFavoriteCommunityUseCase(favoriteRepository);

type VisibilityFilter = 'all' | 'public' | 'private';
type SortOption = 'name' | 'members';
type ActiveChip = 'none' | 'favorites' | 'history';

export default function SearchCommunityScreen() {
  const { user } = useAuth();

  const [query, setQuery] = useState('');
  const [communities, setCommunities] = useState<CommunityEntity[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('name');
  const [activeChip, setActiveChip] = useState<ActiveChip>('none');

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

  const loadFavorites = useCallback(async () => {
    if (!user?.id) return;
    try {
      const favs = await getFavoritesUseCase.execute(user.id);
      setFavorites(favs);
    } catch (error) {
      console.error('Error cargando favoritos:', error);
    }
  }, [user?.id]);

  const loadHistory = useCallback(async () => {
    const h = await getCommunityHistory();
    setHistory(h);
  }, []);

  useEffect(() => {
    loadCommunities();
  }, [loadCommunities]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
      loadHistory();
    }, [loadFavorites, loadHistory])
  );

  // ==== Filtro + ordenamiento combinados ====
  const baseList =
    activeChip === 'favorites'
      ? communities.filter((c) => favorites.includes(c.id))
      : activeChip === 'history'
      ? communities.filter((c) => history.some((h) => h.communityId === c.id))
      : communities;

  const filtered = baseList
    .filter((c) => {
      const matchesQuery =
        c.name.toLowerCase().includes(query.trim().toLowerCase()) ||
        c.description.toLowerCase().includes(query.trim().toLowerCase());
      const matchesVisibility =
        visibilityFilter === 'all' ? true : c.visibility === visibilityFilter;
      return matchesQuery && matchesVisibility;
    })
    .sort((a, b) => {
      if (sortOption === 'name') return a.name.localeCompare(b.name);
      return b.memberCount - a.memberCount;
    });

  const handleToggleFavorite = async (communityId: string) => {
    if (!user?.id) return;
    const isFav = favorites.includes(communityId);
    // Actualización optimista
    setFavorites((prev) =>
      isFav ? prev.filter((id) => id !== communityId) : [...prev, communityId]
    );
    try {
      await toggleFavoriteUseCase.execute(user.id, communityId, isFav);
    } catch (error) {
      // Revertir en error
      setFavorites((prev) =>
        isFav ? [...prev, communityId] : prev.filter((id) => id !== communityId)
      );
      Alert.alert('Error', 'No se pudo actualizar el favorito.');
    }
  };

  const openCommunity = async (community: CommunityEntity) => {
    await addToCommunityHistory({
      communityId: community.id,
      communityName: community.name,
      color: community.color,
    });
    await loadHistory();
    router.push({ pathname: '/(tabs)/community-rules', params: { id: community.id } });
  };

  const goToCreateCommunity = () => {
    router.push('/(tabs)/create-community');
  };

  const handleClearHistory = async () => {
    Alert.alert(
      'Borrar historial',
      '¿Seguro que quieres borrar el historial de comunidades vistas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            await clearCommunityHistory();
            setHistory([]);
            setActiveChip('none');
          },
        },
      ]
    );
  };

  const activeFiltersCount = [
    visibilityFilter !== 'all',
    sortOption !== 'name',
  ].filter(Boolean).length;

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
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color="#E0F5E0" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterIconBtn, activeFiltersCount > 0 && styles.filterIconBtnActive]}
          onPress={() => setIsFilterModalVisible(true)}
        >
          <Ionicons name="options-outline" size={20} color={activeFiltersCount > 0 ? '#FFF' : '#555'} />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeChip === 'favorites' && styles.filterChipActive]}
          onPress={() => setActiveChip(activeChip === 'favorites' ? 'none' : 'favorites')}
        >
          <Ionicons
            name={activeChip === 'favorites' ? 'heart' : 'heart-outline'}
            size={16}
            color={activeChip === 'favorites' ? '#FFF' : '#555'}
            style={{ marginRight: 5 }}
          />
          <Text style={[styles.filterText, activeChip === 'favorites' && styles.filterTextActive]}>
            Favoritos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeChip === 'history' && styles.filterChipActive]}
          onPress={() => setActiveChip(activeChip === 'history' ? 'none' : 'history')}
        >
          <Ionicons
            name={activeChip === 'history' ? 'time' : 'time-outline'}
            size={16}
            color={activeChip === 'history' ? '#FFF' : '#555'}
            style={{ marginRight: 5 }}
          />
          <Text style={[styles.filterText, activeChip === 'history' && styles.filterTextActive]}>
            Historial
          </Text>
        </TouchableOpacity>

        {activeChip === 'history' && history.length > 0 && (
          <TouchableOpacity onPress={handleClearHistory} style={styles.clearHistoryBtn}>
            <Ionicons name="trash-outline" size={16} color="#B33A3A" />
          </TouchableOpacity>
        )}
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
            <Text style={styles.emptyText}>
              {activeChip === 'favorites'
                ? 'No tienes comunidades favoritas todavía.'
                : activeChip === 'history'
                ? 'No hay historial reciente.'
                : 'No se encontró ninguna comunidad.'}
            </Text>
          ) : (
            filtered.map((item) => {
              const isFav = favorites.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.communityItem}
                  onPress={() => openCommunity(item)}
                  activeOpacity={0.7}
                >
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
                    <Ionicons
                      name="lock-closed-outline"
                      size={16}
                      color="#A0A0A0"
                      style={{ marginRight: 10 }}
                    />
                  )}
                  <TouchableOpacity
                    onPress={() => handleToggleFavorite(item.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={isFav ? 'heart' : 'heart-outline'}
                      size={22}
                      color={isFav ? '#FF6B6B' : '#C7C7C7'}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      {/* ==== MODAL DE FILTROS ==== */}
      <Modal
        visible={isFilterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsFilterModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={styles.filterSheet}>
          <View style={styles.filterSheetHeader}>
            <Text style={styles.filterSheetTitle}>Filtros</Text>
            <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
              <Ionicons name="close-circle" size={26} color="#C7C7C7" />
            </TouchableOpacity>
          </View>

          <Text style={styles.filterSectionTitle}>Visibilidad</Text>
          <View style={styles.filterOptionsRow}>
            {[
              { key: 'all', label: 'Todas' },
              { key: 'public', label: 'Públicas' },
              { key: 'private', label: 'Privadas' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.filterOption,
                  visibilityFilter === opt.key && styles.filterOptionActive,
                ]}
                onPress={() => setVisibilityFilter(opt.key as VisibilityFilter)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    visibilityFilter === opt.key && styles.filterOptionTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterSectionTitle}>Ordenar por</Text>
          <View style={styles.filterOptionsRow}>
            {[
              { key: 'name', label: 'Nombre A-Z' },
              { key: 'members', label: 'Más miembros' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.filterOption,
                  sortOption === opt.key && styles.filterOptionActive,
                ]}
                onPress={() => setSortOption(opt.key as SortOption)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    sortOption === opt.key && styles.filterOptionTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.filterActions}>
            <TouchableOpacity
              style={styles.filterResetBtn}
              onPress={() => {
                setVisibilityFilter('all');
                setSortOption('name');
              }}
            >
              <Text style={styles.filterResetText}>Restablecer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterApplyBtn}
              onPress={() => setIsFilterModalVisible(false)}
            >
              <Text style={styles.filterApplyText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#4A3E38' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  headerIconButton: { marginLeft: 15 },
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
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 16 },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F4F4F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  filterIconBtnActive: { backgroundColor: '#58C759' },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6B6B',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
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
  filterChipActive: { backgroundColor: '#58C759', borderColor: '#58C759' },
  filterText: { color: '#4A4A4A', fontSize: 13 },
  filterTextActive: { color: '#FFFFFF', fontWeight: '600' },
  clearHistoryBtn: { padding: 6, marginLeft: 'auto' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  communityTextContainer: { flex: 1 },
  communityTitle: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  communitySubtitle: { fontSize: 13, color: '#A0A0A0' },
  emptyText: { textAlign: 'center', color: '#A0A0A0', marginTop: 10, marginBottom: 20 },
  emptyStateContainer: { alignItems: 'center', paddingTop: 40 },
  emptyStateTitle: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 6 },
  emptyStateText: {
    fontSize: 13,
    color: '#A0A0A0',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 30,
  },
  emptyStateButton: { backgroundColor: '#98F59C', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 22 },
  emptyStateButtonText: { color: '#333333', fontWeight: '600', fontSize: 13 },
  // ==== MODAL ====
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  filterSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  filterSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterSheetTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginTop: 15,
    marginBottom: 10,
  },
  filterOptionsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  filterOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F4F4F4',
    marginRight: 10,
    marginBottom: 8,
  },
  filterOptionActive: { backgroundColor: '#98F59C' },
  filterOptionText: { fontSize: 13, color: '#8A8A8A', fontWeight: '600' },
  filterOptionTextActive: { color: '#333333' },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 25,
  },
  filterResetBtn: { paddingVertical: 10, paddingHorizontal: 16, marginRight: 10 },
  filterResetText: { color: '#8A8A8A', fontWeight: '600', fontSize: 13 },
  filterApplyBtn: {
    backgroundColor: '#58C759',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  filterApplyText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
});