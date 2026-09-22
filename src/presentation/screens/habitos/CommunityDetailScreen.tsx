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
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';

import { CommunityRepositoryImpl } from '../../../data/repositories/comunidad/CommunityRepositoryImpl';
import { CommunityFeedRepositoryImpl } from '../../../data/repositories/comunidad/CommunityFeedRepositoryImpl';
import { CommunityActivityRepositoryImpl } from '../../../data/repositories/comunidad/CommunityActivityRepositoryImpl';

import { GetCommunityDetailUseCase } from '../../../domain/usecases/comunidad/GetCommunityDetailUseCase';
import { GetCommunityFeedUseCase } from '../../../domain/usecases/comunidad/GetCommunityFeedUseCase';
import { GetCommunityActivitiesUseCase } from '../../../domain/usecases/comunidad/GetCommunityActivitiesUseCase';
import { GetPendingJoinRequestsUseCase } from '../../../domain/usecases/comunidad/GetPendingJoinRequestsUseCase';
import { RespondToJoinRequestUseCase } from '../../../domain/usecases/comunidad/RespondToJoinRequestUseCase';
import { CreatePostUseCase } from '../../../domain/usecases/comunidad/CreatePostUseCase';
import { ToggleLikePostUseCase } from '../../../domain/usecases/comunidad/ToggleLikePostUseCase';
import { ToggleActivityParticipationUseCase } from '../../../domain/usecases/comunidad/ToggleActivityParticipationUseCase';
import { CreateActivityUseCase } from '../../../domain/usecases/comunidad/CreateActivityUseCase';
import { LeaveCommunityUseCase } from '../../../domain/usecases/comunidad/LeaveCommunityUseCase';
import { DeleteCommunityUseCase } from '../../../domain/usecases/comunidad/DeleteCommunityUseCase';
import { UpdatePostUseCase } from '../../../domain/usecases/comunidad/UpdatePostUseCase';
import { DeletePostUseCase } from '../../../domain/usecases/comunidad/DeletePostUseCase';

import { CommunityEntity } from '../../../domain/entities/comunidad/Community';
import { CommunityMemberEntity, CommunityJoinRequestEntity } from '../../../domain/entities/comunidad/CommunityMember';
import { CommunityPostEntity } from '../../../domain/entities/comunidad/CommunityPost';
import { CommunityActivityEntity } from '../../../domain/entities/comunidad/CommunityActivity';

import CreateActivityModal from '../../components/CreateActivityModal';
import EditFieldModal from '../../components/EditFieldModal';

import { GetCommunityMembersUseCase } from '../../../domain/usecases/comunidad/GetCommunityMembersUseCase';
import CommunityMembersModal from '../../components/CommunityMembersModal';
import { UserNotificationRepositoryImpl } from '../../../data/repositories/notifications/UserNotificationRepositoryImpl';

const communityRepository = new CommunityRepositoryImpl();
const feedRepository = new CommunityFeedRepositoryImpl();
const activityRepository = new CommunityActivityRepositoryImpl();
const notificationRepository = new UserNotificationRepositoryImpl();



const getCommunityDetailUseCase = new GetCommunityDetailUseCase(communityRepository);
const getCommunityFeedUseCase = new GetCommunityFeedUseCase(feedRepository);
const getCommunityActivitiesUseCase = new GetCommunityActivitiesUseCase(activityRepository);
const getPendingJoinRequestsUseCase = new GetPendingJoinRequestsUseCase(communityRepository);
const respondToJoinRequestUseCase = new RespondToJoinRequestUseCase(
  communityRepository,
  notificationRepository
);
const createPostUseCase = new CreatePostUseCase(feedRepository);
const toggleLikePostUseCase = new ToggleLikePostUseCase(feedRepository);
const toggleActivityParticipationUseCase = new ToggleActivityParticipationUseCase(activityRepository);
const createActivityUseCase = new CreateActivityUseCase(activityRepository);
const leaveCommunityUseCase = new LeaveCommunityUseCase(communityRepository);
const deleteCommunityUseCase = new DeleteCommunityUseCase(communityRepository);
const updatePostUseCase = new UpdatePostUseCase(feedRepository);
const deletePostUseCase = new DeletePostUseCase(feedRepository);
const getCommunityMembersUseCase = new GetCommunityMembersUseCase(communityRepository);


type TabKey = 'recientes' | 'actividades' | 'destacados';

function getInitials(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatDate(timestamp: Timestamp | null): string {
  if (!timestamp) return '';
  return timestamp.toDate().toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

interface PostCardProps {
  post: CommunityPostEntity;
  currentUserId?: string;
  onLike: (post: CommunityPostEntity) => void;
  onReply: (post: CommunityPostEntity) => void;
  onOptions: (post: CommunityPostEntity) => void;
}

function PostCard({ post, currentUserId, onLike, onReply, onOptions }: PostCardProps) {
  const isLiked = !!currentUserId && post.likedBy.includes(currentUserId);
  const isOwner = !!currentUserId && post.authorId === currentUserId;

  return (
    <View style={styles.postCard}>
      <View style={[styles.postAvatar, { backgroundColor: post.authorColor || '#98F59C' }]}>
        <Text style={styles.postInitials}>{getInitials(post.authorName)}</Text>
      </View>
      <View style={styles.postContent}>
        <View style={styles.postHeader}>
          <Text style={styles.postUser}>{post.authorName}</Text>
          {isOwner && (
            <TouchableOpacity
              onPress={() => onOptions(post)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="ellipsis-horizontal" size={18} color="#8A8A8A" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.postText}>{post.text}</Text>
        <View style={styles.postActions}>
          <TouchableOpacity onPress={() => onReply(post)}>
            <Text style={styles.postActionText}>Responder</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onLike(post)}>
            <Text style={styles.postActionText}>
              {isLiked ? '❤️' : '🤍'} {post.likeCount}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState<CommunityEntity | null>(null);
  const [membership, setMembership] = useState<CommunityMemberEntity | null>(null);
  const [joinRequest, setJoinRequest] = useState<CommunityJoinRequestEntity | null>(null);
  const [pendingRequests, setPendingRequests] = useState<CommunityJoinRequestEntity[]>([]);
  const [recentPosts, setRecentPosts] = useState<CommunityPostEntity[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<CommunityPostEntity[]>([]);
  const [activities, setActivities] = useState<CommunityActivityEntity[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('recientes');
  const [postText, setPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [selectedPostForMenu, setSelectedPostForMenu] = useState<CommunityPostEntity | null>(null);
  const [editingPost, setEditingPost] = useState<CommunityPostEntity | null>(null);
  const [isMembersModalVisible, setIsMembersModalVisible] = useState(false);
  const [members, setMembers] = useState<CommunityMemberEntity[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const loadAll = useCallback(async () => {
    if (!id || !user?.id) return;
    setLoading(true);
    try {
      const detail = await getCommunityDetailUseCase.execute(id, user.id);
      setCommunity(detail.community);
      setMembership(detail.membership);
      setJoinRequest(detail.joinRequest);

      const feed = await getCommunityFeedUseCase.execute(id);
      setRecentPosts(feed.recent);
      setFeaturedPosts(feed.featured);

      const activitiesResult = await getCommunityActivitiesUseCase.execute(id);
      setActivities(activitiesResult);

      if (detail.community.createdBy === user.id) {
        const pending = await getPendingJoinRequestsUseCase.execute(id);
        setPendingRequests(pending);
      } else {
        setPendingRequests([]);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo cargar la comunidad.');
    } finally {
      setLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const isOwner = !!community && !!user?.id && community.createdBy === user.id;
  const isMember = !!membership;

  const handleGoToRules = () => {
    if (!community) return;
    router.push({ pathname: '/(tabs)/community-rules', params: { id: community.id } });
  };

  const handleRespond = async (uid: string, accept: boolean) => {
    if (!id) return;
    try {
      await respondToJoinRequestUseCase.execute(id, uid, accept);
      await loadAll();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo procesar la solicitud.');
    }
  };
    const handleOpenMembers = async () => {
    if (!id) return;
    setIsMembersModalVisible(true);
    setLoadingMembers(true);
    try {
      const result = await getCommunityMembersUseCase.execute(id);
      setMembers(result);
    } catch (error) {
      console.error('Error cargando miembros:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleLeave = () => {
    setIsMenuVisible(false);
    Alert.alert(
      'Salir de la comunidad',
      `¿Seguro que quieres salir de "${community?.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            if (!id || !user?.id) return;
            try {
              await leaveCommunityUseCase.execute(id, user.id);
              Alert.alert('Listo', 'Has salido de la comunidad.');
              router.replace('/(tabs)/habits');
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo salir.');
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    setIsMenuVisible(false);
    Alert.alert(
      'Eliminar comunidad',
      `¿Seguro que quieres eliminar "${community?.name}"? Esta acción no se puede deshacer y se borrarán TODAS las publicaciones, retos y miembros.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (!id || !user?.id) return;
            try {
              await deleteCommunityUseCase.execute(id, user.id);
              Alert.alert('Listo', 'La comunidad ha sido eliminada.');
              router.replace('/(tabs)/habits');
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo eliminar.');
            }
          },
        },
      ]
    );
  };

  const handleCreatePost = async () => {
    if (!id || !user?.id || !postText.trim() || !community) return;
    setIsPosting(true);
    try {
      await createPostUseCase.execute(id, user.id, user.name, community.color, postText);
      setPostText('');
      const feed = await getCommunityFeedUseCase.execute(id);
      setRecentPosts(feed.recent);
      setFeaturedPosts(feed.featured);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo publicar.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleToggleLike = async (post: CommunityPostEntity) => {
    if (!id || !user?.id) return;
    const isLiked = post.likedBy.includes(user.id);
    const applyLocalToggle = (list: CommunityPostEntity[]) =>
      list.map((p) =>
        p.id === post.id
          ? {
              ...p,
              likeCount: p.likeCount + (isLiked ? -1 : 1),
              likedBy: isLiked ? p.likedBy.filter((uid) => uid !== user.id) : [...p.likedBy, user.id],
            }
          : p
      );
    setRecentPosts((prev) => applyLocalToggle(prev));
    setFeaturedPosts((prev) => applyLocalToggle(prev));
    try {
      await toggleLikePostUseCase.execute(id, post.id, user.id, isLiked);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el me gusta.');
      await loadAll();
    }
  };

  const handleReply = (post: CommunityPostEntity) => {
    router.push({
      pathname: '/(tabs)/thread-reply',
      params: {
        communityId: id,
        communityName: community?.name ?? '',
        postId: post.id,
        author: post.authorName,
        text: post.text,
        color: post.authorColor,
      },
    });
  };

  // ==== POSTS: editar / eliminar ====
  const handleOpenPostMenu = (post: CommunityPostEntity) => {
    setSelectedPostForMenu(post);
  };

  const handleClosePostMenu = () => {
    setSelectedPostForMenu(null);
  };

  const handleStartEditPost = () => {
    if (!selectedPostForMenu) return;
    const postToEdit = selectedPostForMenu;
    setSelectedPostForMenu(null);
    setEditingPost(postToEdit);
  };

  const handleSavePostEdit = async (newText: string) => {
    if (!editingPost || !id) return;
    const postId = editingPost.id;
    setEditingPost(null);
    try {
      await updatePostUseCase.execute(id, postId, newText);
      const feed = await getCommunityFeedUseCase.execute(id);
      setRecentPosts(feed.recent);
      setFeaturedPosts(feed.featured);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo editar.');
    }
  };

  const handleConfirmDeletePost = () => {
    if (!selectedPostForMenu || !id) return;
    const postToDelete = selectedPostForMenu;
    setSelectedPostForMenu(null);

    Alert.alert(
      'Eliminar publicación',
      '¿Seguro que quieres eliminar esta publicación? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePostUseCase.execute(id, postToDelete.id);
              const feed = await getCommunityFeedUseCase.execute(id);
              setRecentPosts(feed.recent);
              setFeaturedPosts(feed.featured);
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo eliminar.');
            }
          },
        },
      ]
    );
  };

  const handleToggleParticipation = async (activity: CommunityActivityEntity) => {
    if (!id || !user?.id) return;
    const isParticipating = activity.participants.includes(user.id);
    try {
      await toggleActivityParticipationUseCase.execute(id, activity.id, user.id, isParticipating);
      const activitiesResult = await getCommunityActivitiesUseCase.execute(id);
      setActivities(activitiesResult);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar tu participación.');
    }
  };

  const handleCreateActivity = async (data: {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
  }) => {
    if (!id || !user?.id) return;
    try {
      await createActivityUseCase.execute(id, user.id, data.title, data.description, data.startDate, data.endDate);
      const activitiesResult = await getCommunityActivitiesUseCase.execute(id);
      setActivities(activitiesResult);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo crear el reto.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator color="#58C759" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!community) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centerContainer}>
          <Text style={styles.notFoundText}>No se encontró la comunidad.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.notFoundButton}>
            <Text style={styles.notFoundButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#4A3E38" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {community.name}
        </Text>
        {(isMember || isOwner) ? (
          <TouchableOpacity
            onPress={() => setIsMenuVisible(true)}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="ellipsis-vertical" size={22} color="#4A3E38" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {community.coverImage ? (
          <Image source={{ uri: community.coverImage.url }} style={styles.coverImage} />
        ) : (
          <View style={[styles.coverImage, styles.coverPlaceholder, { backgroundColor: community.color }]}>
            <Ionicons name="people" size={60} color="#FFFFFF" />
          </View>
        )}

        <Text style={styles.groupName}>{community.name}</Text>
        <Text style={styles.groupMeta}>
          <Ionicons
            name={community.visibility === 'public' ? 'globe-outline' : 'lock-closed-outline'}
            size={14}
            color="#8A8A8A"
          />{' '}
          {community.visibility === 'public' ? 'Grupo público' : 'Grupo privado'} ·{' '}
          <Text
            style={{ color: '#58C759', fontWeight: 'bold' }}
            onPress={handleOpenMembers}
          >
            {community.memberCount} {community.memberCount === 1 ? 'integrante' : 'integrantes'}
          </Text>
        </Text>
        {!!community.description && <Text style={styles.description}>{community.description}</Text>}

        {isMember && (
          <View style={styles.memberButton}>
            <Ionicons name="checkmark-circle" size={18} color="#4A4A4A" style={{ marginRight: 8 }} />
            <Text style={styles.memberButtonText}>
              {isOwner ? 'Eres el creador de esta comunidad' : 'Ya eres parte de esta comunidad'}
            </Text>
          </View>
        )}

        {!isMember && joinRequest?.status === 'pending' && (
          <View style={styles.pendingButton}>
            <Ionicons name="time-outline" size={18} color="#B8860B" style={{ marginRight: 8 }} />
            <Text style={styles.pendingButtonText}>Solicitud pendiente de aprobación</Text>
          </View>
        )}

        {!isMember && joinRequest?.status === 'rejected' && (
          <View style={styles.rejectedBox}>
            <Text style={styles.rejectedText}>
              Tu solicitud fue rechazada por el creador.
            </Text>
            <TouchableOpacity style={styles.joinButton} onPress={handleGoToRules}>
              <Text style={styles.joinButtonText}>Volver a solicitar</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isMember && !joinRequest && (
          <TouchableOpacity style={styles.joinButton} onPress={handleGoToRules}>
            <Text style={styles.joinButtonText}>
              {community.visibility === 'public' ? 'Unirme' : 'Solicitar unirme'}
            </Text>
          </TouchableOpacity>
        )}

        {isOwner && pendingRequests.length > 0 && (
          <View style={styles.requestsBanner}>
            <Text style={styles.requestsBannerTitle}>
              Tienes {pendingRequests.length} solicitud{pendingRequests.length > 1 ? 'es' : ''} pendiente
              {pendingRequests.length > 1 ? 's' : ''}
            </Text>
            {pendingRequests.map((request) => (
              <View key={request.uid} style={styles.requestRow}>
                <Text style={styles.requestName} numberOfLines={1}>
                  {request.userName}
                </Text>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={styles.requestRejectButton}
                    onPress={() => handleRespond(request.uid, false)}
                  >
                    <Ionicons name="close" size={16} color="#B33A3A" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.requestAcceptButton}
                    onPress={() => handleRespond(request.uid, true)}
                  >
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.tabsRow}>
          {(['recientes', 'actividades', 'destacados'] as TabKey[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={activeTab === tab ? styles.activeTabText : styles.tabText}>
                {tab === 'recientes' ? 'Recientes' : tab === 'actividades' ? 'Actividades' : 'Destacados'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'recientes' && (
          <>
            {isMember ? (
              <View style={styles.composerRow}>
                <TextInput
                  style={styles.composerInput}
                  placeholder="Comparte algo con la comunidad..."
                  placeholderTextColor="#B0B0B0"
                  value={postText}
                  onChangeText={setPostText}
                  multiline
                />
                <TouchableOpacity
                  style={styles.composerButton}
                  onPress={handleCreatePost}
                  disabled={isPosting || !postText.trim()}
                >
                  {isPosting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Ionicons name="send" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.joinHintText}>Únete a la comunidad para poder publicar.</Text>
            )}

            {recentPosts.length === 0 ? (
              <Text style={styles.emptyText}>Todavía no hay publicaciones. ¡Sé el primero!</Text>
            ) : (
              recentPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id}
                  onLike={handleToggleLike}
                  onReply={handleReply}
                  onOptions={handleOpenPostMenu}
                />
              ))
            )}
          </>
        )}

        {activeTab === 'actividades' && (
          <>
            <TouchableOpacity style={styles.addActivityButton} onPress={() => setIsActivityModalVisible(true)}>
              <Ionicons name="add" size={18} color="#58C759" />
              <Text style={styles.addActivityButtonText}>Nuevo reto</Text>
            </TouchableOpacity>

            {activities.length === 0 ? (
              <Text style={styles.emptyText}>Todavía no hay retos programados.</Text>
            ) : (
              activities.map((activity) => {
                const isParticipating = !!user?.id && activity.participants.includes(user.id);
                return (
                  <View key={activity.id} style={styles.activityCard}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    {!!activity.description && (
                      <Text style={styles.activityDescription}>{activity.description}</Text>
                    )}
                    <Text style={styles.activityDates}>
                      {formatDate(activity.startDate)} — {formatDate(activity.endDate)}
                    </Text>
                    <View style={styles.activityFooter}>
                      <Text style={styles.activityParticipants}>
                        {activity.participants.length} participante{activity.participants.length !== 1 ? 's' : ''}
                      </Text>
                      <TouchableOpacity
                        style={[styles.participateButton, isParticipating && styles.participateButtonActive]}
                        onPress={() => handleToggleParticipation(activity)}
                      >
                        <Text
                          style={[
                            styles.participateButtonText,
                            isParticipating && styles.participateButtonTextActive,
                          ]}
                        >
                          {isParticipating ? 'Ya participas' : 'Participar'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}

        {activeTab === 'destacados' && (
          <>
            {featuredPosts.length === 0 ? (
              <Text style={styles.emptyText}>
                Cuando una publicación llegue a varios "me gusta", va a aparecer aquí.
              </Text>
            ) : (
              featuredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id}
                  onLike={handleToggleLike}
                  onReply={handleReply}
                  onOptions={handleOpenPostMenu}
                />
              ))
            )}
          </>
        )}
      </ScrollView>

      <CreateActivityModal
        visible={isActivityModalVisible}
        onClose={() => setIsActivityModalVisible(false)}
        onSave={handleCreateActivity}
      />

      {/* Menú de opciones de la comunidad (salir/eliminar) */}
      <Modal
        visible={isMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsMenuVisible(false)}>
          <View style={styles.menuOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.menuWrapper}>
          <View style={styles.menuCard}>
            {isOwner ? (
              <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={20} color="#B33A3A" />
                <Text style={[styles.menuItemText, { color: '#B33A3A' }]}>
                  Eliminar comunidad
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.menuItem} onPress={handleLeave}>
                <Ionicons name="exit-outline" size={20} color="#B33A3A" />
                <Text style={[styles.menuItemText, { color: '#B33A3A' }]}>
                  Salir de la comunidad
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemCancel]}
              onPress={() => setIsMenuVisible(false)}
            >
              <Text style={styles.menuItemText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Menú de opciones de un post propio (editar/eliminar) */}
      <Modal
        visible={!!selectedPostForMenu}
        transparent
        animationType="fade"
        onRequestClose={handleClosePostMenu}
      >
        <TouchableWithoutFeedback onPress={handleClosePostMenu}>
          <View style={styles.menuOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.menuWrapper}>
          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem} onPress={handleStartEditPost}>
              <Ionicons name="pencil" size={20} color="#1A1A1A" />
              <Text style={styles.menuItemText}>Editar publicación</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemCancel]}
              onPress={handleConfirmDeletePost}
            >
              <Ionicons name="trash-outline" size={20} color="#B33A3A" />
              <Text style={[styles.menuItemText, { color: '#B33A3A' }]}>
                Eliminar publicación
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de edición del texto del post */}
      <EditFieldModal
        visible={!!editingPost}
        label="Editar publicación"
        placeholder="Escribe tu publicación..."
        initialValue={editingPost?.text ?? ''}
        multiline
        onClose={() => setEditingPost(null)}
        onSave={handleSavePostEdit}
      />
        <CommunityMembersModal
        visible={isMembersModalVisible}
        onClose={() => setIsMembersModalVisible(false)}
        members={members}
        loading={loadingMembers}
        communityName={community.name}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  notFoundText: { fontSize: 15, color: '#4A4A4A', marginBottom: 15 },
  notFoundButton: { backgroundColor: '#58C759', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 20 },
  notFoundButtonText: { color: '#FFFFFF', fontWeight: '600' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  backButton: { padding: 5 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#4A3E38' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 15 },
  coverImage: { height: 160, borderRadius: 20, marginBottom: 15 },
  coverPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  groupName: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 5 },
  groupMeta: { fontSize: 13, color: '#8A8A8A', marginBottom: 10 },
  description: { fontSize: 13, color: '#4A4A4A', lineHeight: 19, marginBottom: 20 },
  joinButton: {
    backgroundColor: '#98F59C',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  joinButtonText: { color: '#333333', fontWeight: 'bold', fontSize: 16 },
  memberButton: {
    backgroundColor: '#E8F5E9',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#58C759',
  },
  memberButtonText: { color: '#4A4A4A', fontWeight: 'bold', fontSize: 14 },
  requestsBanner: {
    backgroundColor: '#FFF8DD',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
  },
  requestsBannerTitle: { fontSize: 13, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 10 },
  requestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestName: { flex: 1, fontSize: 13, color: '#4A4A4A' },
  requestActions: { flexDirection: 'row' },
  requestRejectButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0C0C0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  requestAcceptButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#58C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsRow: { flexDirection: 'row', marginBottom: 20 },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#F4F4F4',
    marginRight: 10,
  },
  activeTab: { backgroundColor: '#98F59C' },
  activeTabText: { color: '#333333', fontWeight: 'bold', fontSize: 13 },
  tabText: { color: '#A0A0A0', fontWeight: '600', fontSize: 13 },
  composerRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 20 },
  composerInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1A1A1A',
    marginRight: 10,
    maxHeight: 90,
  },
  composerButton: {
    backgroundColor: '#58C759',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinHintText: { fontSize: 12, color: '#A0A0A0', marginBottom: 15, fontStyle: 'italic' },
  emptyText: { fontSize: 13, color: '#A0A0A0', marginBottom: 15 },
  postCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    marginBottom: 15,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  postInitials: { color: '#FFFFFF', fontWeight: 'bold' },
  postContent: { flex: 1 },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  postUser: { fontSize: 13, fontWeight: 'bold', color: '#1A1A1A' },
  postText: { fontSize: 13, color: '#4A4A4A', lineHeight: 18, marginBottom: 10 },
  postActions: { flexDirection: 'row', justifyContent: 'space-between' },
  postActionText: { fontSize: 12, color: '#8A8A8A', fontWeight: '500' },
  addActivityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#58C759',
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  addActivityButtonText: { color: '#58C759', fontWeight: '600', fontSize: 13, marginLeft: 6 },
  activityCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
  },
  pendingButton: {
    backgroundColor: '#FFF8DD',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8D68A',
  },
  pendingButtonText: { color: '#B8860B', fontWeight: 'bold', fontSize: 14 },
  rejectedBox: { backgroundColor: '#FFEBEE', borderRadius: 16, padding: 16, marginBottom: 20 },
  rejectedText: { color: '#B33A3A', fontSize: 13, textAlign: 'center', marginBottom: 12 },
  activityTitle: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  activityDescription: { fontSize: 13, color: '#4A4A4A', lineHeight: 18, marginBottom: 8 },
  activityDates: { fontSize: 12, color: '#A0A0A0', marginBottom: 12 },
  activityFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activityParticipants: { fontSize: 12, color: '#8A8A8A' },
  participateButton: {
    backgroundColor: '#F4F4F4',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  participateButtonActive: { backgroundColor: '#98F59C' },
  participateButtonText: { fontSize: 12, fontWeight: '600', color: '#8A8A8A' },
  participateButtonTextActive: { color: '#333333' },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  menuWrapper: { position: 'absolute', top: 70, right: 20 },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 6,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 10,
  },
  menuItemText: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  menuItemCancel: { borderTopWidth: 1, borderTopColor: '#F0F0F0' },
});