import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { CommunityRepositoryImpl } from '../../../data/repositories/comunidad/CommunityRepositoryImpl';
import { GetOwnedCommunitiesWithPendingRequestsUseCase } from '../../../domain/usecases/comunidad/GetOwnedCommunitiesWithPendingRequestsUseCase';
import { RespondToJoinRequestUseCase } from '../../../domain/usecases/comunidad/RespondToJoinRequestUseCase';
import { useAuth } from '../../hooks/useAuth';

const repository = new CommunityRepositoryImpl();
const getOwnedUseCase = new GetOwnedCommunitiesWithPendingRequestsUseCase(repository);
const respondUseCase = new RespondToJoinRequestUseCase(repository);

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [data, setData] = useState<{ communityId: string; communityName: string; requests: any[] }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const result = await getOwnedUseCase.execute(user.id);
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleRespond = async (communityId: string, uid: string, accept: boolean) => {
    try {
      await respondUseCase.execute(communityId, uid, accept);
      await load();
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar la solicitud.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#4A3E38" />
        </TouchableOpacity>
        <Text style={styles.title}>Notificaciones</Text>
        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#58C759" /></View>
      ) : data.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="notifications-off-outline" size={60} color="#D1D1D1" />
          <Text style={styles.emptyText}>No tienes notificaciones nuevas.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {data.map((group) => (
            <View key={group.communityId} style={styles.group}>
              <Text style={styles.groupTitle}>{group.communityName}</Text>
              {group.requests.map((request) => (
                <View key={request.uid} style={styles.requestCard}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{request.userName.slice(0, 2).toUpperCase()}</Text>
                  </View>
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestName}>{request.userName}</Text>
                    <Text style={styles.requestSubtitle}>Quiere unirse a tu comunidad</Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.rejectBtn]}
                      onPress={() => handleRespond(group.communityId, request.uid, false)}
                    >
                      <Ionicons name="close" size={18} color="#B33A3A" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.acceptBtn]}
                      onPress={() => handleRespond(group.communityId, request.uid, true)}
                    >
                      <Ionicons name="checkmark" size={18} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#4A3E38' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 12, color: '#A0A0A0', fontSize: 14 },
  scroll: { padding: 20, paddingBottom: 100 },
  group: { marginBottom: 25 },
  groupTitle: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 10 },
  requestCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', borderRadius: 14, padding: 12, marginBottom: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#98F59C', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#FFF', fontWeight: 'bold' },
  requestInfo: { flex: 1 },
  requestName: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A' },
  requestSubtitle: { fontSize: 12, color: '#8A8A8A', marginTop: 2 },
  actions: { flexDirection: 'row' },
  actionBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  rejectBtn: { backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: '#F5C7CB' },
  acceptBtn: { backgroundColor: '#58C759' },
});