import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Reply {
  id: string;
  author: string;
  text: string;
  color: string;
}

export default function ThreadReplyScreen() {
  const { author, text, color } = useLocalSearchParams<{ author: string; text: string; color: string }>();
  
  // Mensajes de ejemplo y el estado para el nuevo mensaje
  const [replies, setReplies] = useState<Reply[]>([
    { id: 'r1', author: 'Edan Reyes', text: '¡Totalmente de acuerdo! A veces leer en exceso nos bloquea.', color: '#B8C0FF' },
    { id: 'r2', author: 'Sofía Luna', text: 'Justo estaba pensando lo mismo. Buen consejo.', color: '#FFDAC1' },
  ]);
  
  const [currentMessage, setCurrentMessage] = useState('');

  const handleSend = () => {
    if (currentMessage.trim().length === 0) return;
    
    const newReply: Reply = {
      id: `r${Date.now()}`,
      author: 'Tú', // El usuario actual (puedes cambiarlo por el nombre real de tu contexto)
      text: currentMessage.trim(),
      color: '#98F59C', // Color verde para ti
    };

    setReplies([...replies, newReply]);
    setCurrentMessage('');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#4A3E38" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comunidad Hábitos</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Publicación original */}
          <View style={styles.originalPost}>
            <View style={[styles.avatar, { backgroundColor: color || '#FF9F9F' }]}>
              <Text style={styles.avatarText}>{author?.charAt(0) || 'A'}</Text>
            </View>
            <View style={styles.postContent}>
              <Text style={styles.postAuthor}>{author}</Text>
              <Text style={styles.postText}>{text}</Text>
              <Text style={styles.postAction}>Responder · Me gusta ❤️</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Respuestas</Text>

          {/* Lista de respuestas */}
          {replies.map((reply) => (
            <View key={reply.id} style={styles.replyRow}>
              <View style={[styles.avatar, { backgroundColor: reply.color }]}>
                <Text style={styles.avatarText}>{reply.author.charAt(0)}</Text>
              </View>
              <View style={styles.postContent}>
                <Text style={styles.postAuthor}>{reply.author}</Text>
                <Text style={styles.postText}>{reply.text}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input para escribir */}
        <View style={styles.inputContainer}>
          <View style={styles.inputBubble}>
            <TextInput
              style={styles.input}
              placeholder="Escribe tu respuesta..."
              placeholderTextColor="#A0A0A0"
              value={currentMessage}
              onChangeText={setCurrentMessage}
              multiline
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardContainer: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingTop: 15, paddingBottom: 10 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#4A3E38' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  
  originalPost: { 
    flexDirection: 'row', 
    marginBottom: 20, 
    backgroundColor: '#F9F9F9', 
    padding: 15, 
    borderRadius: 16 
  },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  postContent: { flex: 1 },
  postAuthor: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  postText: { fontSize: 14, color: '#4A4A4A', lineHeight: 20, marginBottom: 8 },
  postAction: { fontSize: 12, color: '#8A8A8A', fontWeight: '500' },
  
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 15 },
  
  replyRow: { flexDirection: 'row', marginBottom: 15 },
  
  inputContainer: { 
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    borderTopWidth: 1, 
    borderTopColor: '#F0F0F0', 
    backgroundColor: '#FFFFFF'
  },
  inputBubble: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    backgroundColor: '#F4F4F4', 
    borderRadius: 25, 
    paddingHorizontal: 15, 
    paddingVertical: 10
  },
  input: { flex: 1, fontSize: 15, color: '#1A1A1A', maxHeight: 100 },
  sendButton: { 
    marginLeft: 10, 
    backgroundColor: '#58C759', 
    width: 35, 
    height: 35, 
    borderRadius: 17.5, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
});