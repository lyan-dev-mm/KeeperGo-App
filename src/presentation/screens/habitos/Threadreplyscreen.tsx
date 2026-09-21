import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';

import { CommunityFeedRepositoryImpl } from '../../../data/repositories/comunidad/CommunityFeedRepositoryImpl';
import { GetPostRepliesUseCase } from '../../../domain/usecases/comunidad/GetPostRepliesUseCase';
import { AddReplyUseCase } from '../../../domain/usecases/comunidad/AddReplyUseCase';
import { CommunityPostReplyEntity } from '../../../domain/entities/comunidad/CommunityPost';

const feedRepository = new CommunityFeedRepositoryImpl();
const getPostRepliesUseCase = new GetPostRepliesUseCase(feedRepository);
const addReplyUseCase = new AddReplyUseCase(feedRepository);

function getInitials(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function ThreadReplyScreen() {
  const { communityId, communityName, postId, author, text, color } = useLocalSearchParams<{
    communityId: string;
    communityName?: string;
    postId: string;
    author?: string;
    text?: string;
    color?: string;
  }>();
  const { user } = useAuth();

  const [replies, setReplies] = useState<CommunityPostReplyEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const loadReplies = useCallback(async () => {
    if (!communityId || !postId) return;
    setLoading(true);
    try {
      const result = await getPostRepliesUseCase.execute(communityId, postId);
      setReplies(result);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las respuestas.');
    } finally {
      setLoading(false);
    }
  }, [communityId, postId]);

  useEffect(() => {
    loadReplies();
  }, [loadReplies]);

  const handleSend = async () => {
    if (!communityId || !postId || !user?.id || !replyText.trim()) return;
    setIsSending(true);
    try {
      await addReplyUseCase.execute(communityId, postId, user.id, user.name, replyText);
      setReplyText('');
      await loadReplies();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo enviar la respuesta.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#4A3E38" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {communityName || 'Publicación'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* KeyboardAvoidingView envuelve todo lo de abajo, incluyendo el input,
          para que el teclado nunca lo tape (esto era el pendiente de antes). */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.postCard}>
            <View style={[styles.postAvatar, { backgroundColor: color || '#98F59C' }]}>
              <Text style={styles.postInitials}>{getInitials(author || '?')}</Text>
            </View>
            <View style={styles.postContent}>
              <Text style={styles.postUser}>{author}</Text>
              <Text style={styles.postText}>{text}</Text>
              <Text style={styles.postFooterHint}>Responder · Me gusta ❤️</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Respuestas</Text>

          {loading ? (
            <ActivityIndicator color="#58C759" style={{ marginTop: 10 }} />
          ) : replies.length === 0 ? (
            <Text style={styles.emptyText}>Todavía no hay respuestas. ¡Sé el primero en responder!</Text>
          ) : (
            replies.map((reply) => (
              <View key={reply.id} style={styles.replyRow}>
                <View style={styles.replyAvatar}>
                  <Text style={styles.replyInitials}>{getInitials(reply.authorName)}</Text>
                </View>
                <View style={styles.replyContent}>
                  <Text style={styles.replyUser}>{reply.authorName}</Text>
                  <Text style={styles.replyText}>{reply.text}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu respuesta..."
            placeholderTextColor="#A0A0A0"
            value={replyText}
            onChangeText={setReplyText}
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={isSending || !replyText.trim()}
          >
            {isSending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Ionicons name="send" size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
  },
  backButton: { padding: 5 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#4A3E38' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  postCard: {
    backgroundColor: '#F4F4F4',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    marginBottom: 25,
  },
  postAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  postInitials: { color: '#FFFFFF', fontWeight: 'bold' },
  postContent: { flex: 1 },
  postUser: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 6 },
  postText: { fontSize: 14, color: '#4A4A4A', lineHeight: 20, marginBottom: 10 },
  postFooterHint: { fontSize: 12, color: '#8A8A8A' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 15 },
  emptyText: { fontSize: 13, color: '#A0A0A0' },
  replyRow: { flexDirection: 'row', marginBottom: 20 },
  replyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#B8C0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  replyInitials: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  replyContent: { flex: 1 },
  replyUser: { fontSize: 13, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 3 },
  replyText: { fontSize: 13, color: '#4A4A4A', lineHeight: 18 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  input: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#58C759',
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
});