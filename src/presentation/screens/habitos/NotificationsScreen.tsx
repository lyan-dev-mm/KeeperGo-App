import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { CommunityRepositoryImpl } from '../../../data/repositories/comunidad/CommunityRepositoryImpl';
import { UserNotificationRepositoryImpl } from '../../../data/repositories/notifications/UserNotificationRepositoryImpl';
import { GetOwnedCommunitiesWithPendingRequestsUseCase } from '../../../domain/usecases/comunidad/GetOwnedCommunitiesWithPendingRequestsUseCase';
import { RespondToJoinRequestUseCase } from '../../../domain/usecases/comunidad/RespondToJoinRequestUseCase';
import { GetUserNotificationsUseCase } from '../../../domain/usecases/notifications/GetUserNotificationsUseCase';
import { MarkNotificationAsReadUseCase } from '../../../domain/usecases/notifications/MarkNotificationAsReadUseCase';
import { UserNotificationEntity } from '../../../domain/entities/notifications/UserNotification';
import { useAuth } from '../../hooks/useAuth';

const communityRepository = new CommunityRepositoryImpl();
const notificationRepository = new UserNotificationRepositoryImpl();

const getOwnedUseCase = new GetOwnedCommunitiesWithPendingRequestsUseCase(communityRepository);
const respondUseCase = new RespondToJoinRequestUseCase(communityRepository, notificationRepository);
const getNotificationsUseCase = new GetUserNotificationsUseCase(notificationRepository);
const markAsReadUseCase = new MarkNotificationAsReadUseCase(notificationRepository);

function getInitials(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<
    { communityId: string; communityName: string; requests: any[] }[]
  >([]);
  const [userNotifications, setUserNotifications] = useState<UserNotificationEntity[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [requests, notifications] = await Promise.all([
        getOwnedUseCase.execute(user.id),
        getNotificationsUseCase.execute(user.id),
      ]);
      setPendingRequests(requests);
      setUserNotifications(notifications);
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

  const handleOpenNotification = async (notification: UserNotificationEntity) => {
    if (!user?.id) return;

    // Marcar como leída primero (sin bloquear la navegación)
    if (!notification.read) {
      markAsReadUseCase.execute(user.id, notification.id).catch(console.error);
      // Actualización optimista local
      setUserNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );
    }

    router.push({
      pathname: '/(tabs)/community-detail',
      params: { id: notification.communityId },
    });
  };

  const totalItems = pendingRequests.length + userNotifications.filter((n) => !n.read).length;

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
      ) : totalItems === 0 ? (
        <View style={styles.center}>
          <Ionicons name="notifications-off-outline" size={60} color="#D1D1D1" />
          <Text style={styles.emptyText}>No tienes notificaciones nuevas.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* ==== SECCIÓN 1: SOLICITUDES PENDIENTES (DUEÑO) ==== */}
          {pendingRequests.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Solicitudes pendientes</Text>
              {pendingRequests.map((group) => (
                <View key={group.communityId} style={styles.group}>
                  <Text style={styles.groupTitle}>{group.communityName}</Text>
                  {group.requests.map((request) => (
                    <View key={request.uid} style={styles.requestCard}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {getInitials(request.userName)}
                        </Text>
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
            </>
          )}

          {/* ==== SECCIÓN 2: NOTIFICACIONES PERSONALES ==== */}
          {userNotifications.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Novedades</Text>
              {userNotifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[styles.notificationCard, !notification.read && styles.notificationCardUnread]}
                  onPress={() => handleOpenNotification(notification)}
                  activeOpacity={0.7}
                >
                  <View style={styles.notificationIcon}>
                    <Ionicons name="checkmark-circle" size={26} color="#58C759" />
                  </View>
                  <View style={styles.notificationInfo}>
                    <Text style={styles.notificationTitle}>
                      ¡Te aceptaron en "{notification.communityName}"!
                    </Text>
                    <Text style={styles.notificationSubtitle}>
                      Toca para ir a la comunidad
                    </Text>
                  </View>
                  {!notification.read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#4A3E38' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 12, color: '#A0A0A0', fontSize: 14 },
  scroll: { padding: 20, paddingBottom: 100 },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 15,
    marginTop: 5,
  },
  group: { marginBottom: 25 },
  groupTitle: { fontSize: 13, fontWeight: 'bold', color: '#8A8A8A', marginBottom: 8 },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#98F59C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#FFF', fontWeight: 'bold' },
  requestInfo: { flex: 1 },
  requestName: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A' },
  requestSubtitle: { fontSize: 12, color: '#8A8A8A', marginTop: 2 },
  actions: { flexDirection: 'row' },
  actionBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  rejectBtn: { backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: '#F5C7CB' },
  acceptBtn: { backgroundColor: '#58C759' },
  // ==== NOTIFICACIONES PERSONALES ====
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  notificationCardUnread: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#A8DDA8',
  },
  notificationIcon: { marginRight: 12 },
  notificationInfo: { flex: 1 },
  notificationTitle: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A' },
  notificationSubtitle: { fontSize: 12, color: '#8A8A8A', marginTop: 2 },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#58C759',
    marginLeft: 10,
  },
});