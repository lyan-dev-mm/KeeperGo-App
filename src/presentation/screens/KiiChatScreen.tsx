import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { delay } from '../../utils/asyncUtils';
import { aiConfigService } from '../../services/aiConfigService';
import { dailySummaryService } from '../../services/dailySummaryService';
import { auth } from '../../infrastructure/firebase/firebaseConfig';

interface ChatMessage {
  id: string;
  sender: 'user' | 'kii';
  text: string;
  linkLabel?: string;
}

const GREETING: ChatMessage = {
  id: 'greeting',
  sender: 'kii',
  text: 'Hola, como puedo ayudarte estoy aquí para ti, para escucharte y que me platiques de las cosas de tu día a día, espero que puedas confiar en mí ❤️',
};

// Guion fijo de demo — Kii siempre responde con esto la primera vez que
// alguien escribe, sin importar el contenido del mensaje (no hay IA real).
const SCRIPTED_RESPONSE_1 =
  'Lamento mucho que te sientas así. Es completamente válido estar abrumado por la presión, pero no tienes que pasar por esto solo. Tu bienestar es la prioridad.';

const SCRIPTED_RESPONSE_2: ChatMessage = {
  id: 'scripted-2',
  sender: 'kii',
  text: 'Tengo unas opciones de especialistas que encontré cerca de tu ubicación',
  linkLabel: 'Haz clic aquí',
};

const FOLLOW_UP_RESPONSE =
  'Estoy aquí para ti. Cuéntame lo que necesites, con calma.';

function KiiAvatar({ size = 40 }: { size?: number }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name="happy" size={size * 0.6} color="#fff" />
    </View>
  );
}

export default function KiiChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const loadHistory = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setIsLoadingHistory(false);
        return;
      }

      try {
        const history = await aiConfigService.getCurrentDayHistory(currentUser.uid);
        if (history && history.length > 0) {
          const mappedMessages: ChatMessage[] = history.map((m, index) => ({
            id: `history-${index}-${Date.now()}`,
            sender: m.role === 'user' ? 'user' : 'kii',
            text: m.content
          }));
          setMessages(mappedMessages);
        }

        // Ejecutar limpieza de historiales antiguos (> 7 días) en segundo plano
        dailySummaryService.cleanupExpiredChatHistory(currentUser.uid)
          .catch(err => console.error('Error en limpieza de historial:', err));

      } catch (error) {
        console.error('Error al precargar historial:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  const addMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isTyping || isLoadingHistory) return;

    // 1. Agregar mensaje del usuario a la UI
    const userMsg: ChatMessage = { id: `user-${Date.now()}`, sender: 'user', text };
    addMessage(userMsg);
    setInputText('');

    setIsTyping(true);

    try {
      // 2. Mapear historial al contrato role/content para OpenAI
      const history = messages.slice(-10).map(msg => ({
        role: (msg.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.text
      }));

      // 3. Única llamada coordinada al servicio de IA
      const response = await aiConfigService.chatWithAI({
        text,
        history
      });

      // 4. Agregar respuesta de Kii
      addMessage({
        id: `kii-${Date.now()}`,
        sender: 'kii',
        text: response.reply
      });

    } catch (err) {
      console.error('Error en el flujo de chat:', err);
      addMessage({
        id: `kii-error-${Date.now()}`,
        sender: 'kii',
        text: 'Lo siento, tuve un problema al procesar tu mensaje. ¿Podrías repetirme eso? ❤️'
      });
    } finally {
      setIsTyping(false);
    }
  };

  // ✅ CAMBIO AQUÍ: Ahora navega a la lista de especialistas
  const handleLinkPress = () => {
    router.push('/specialists');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="rgba(0,0,0,0.87)" />
        </TouchableOpacity>
        <KiiAvatar size={44} />
        <Text style={styles.headerTitle}>Kii</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messagesArea}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                msg.sender === 'user' ? styles.messageRowUser : styles.messageRowKii,
              ]}
            >
              {msg.sender === 'kii' && <KiiAvatar size={28} />}
              <View
                style={[
                  styles.bubble,
                  msg.sender === 'user' ? styles.bubbleUser : styles.bubbleKii,
                ]}
              >
                <Text style={styles.bubbleText}>{msg.text}</Text>
                {msg.linkLabel && (
                  <TouchableOpacity onPress={handleLinkPress}>
                    <Text style={styles.linkText}>{msg.linkLabel}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {isTyping && (
            <View style={[styles.messageRow, styles.messageRowKii]}>
              <KiiAvatar size={28} />
              <View style={[styles.bubble, styles.bubbleKii, styles.typingBubble]}>
                <Text style={styles.typingText}>Kii está escribiendo...</Text>
              </View>
            </View>
          )}

          {isLoadingHistory && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={styles.loadingText}>Cargando conversación...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu Texto....."
            placeholderTextColor="#9E9E9E"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF4E3' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#EAF4E3',
  },
  backButton: { marginRight: 8 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: 'rgba(0,0,0,0.87)', marginLeft: 10 },
  avatar: {
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesArea: { flex: 1, backgroundColor: '#F3F9EF' },
  messagesContent: { padding: 16, paddingBottom: 24 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 14 },
  messageRowKii: { justifyContent: 'flex-start' },
  messageRowUser: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginLeft: 8,
  },
  bubbleKii: { backgroundColor: '#fff' },
  bubbleUser: { backgroundColor: '#DCEFD3', marginLeft: 0 },
  bubbleText: { fontSize: 14, color: 'rgba(0,0,0,0.8)', lineHeight: 20 },
  linkText: { fontSize: 13, color: '#1976D2', textDecorationLine: 'underline', marginTop: 6 },
  typingBubble: { paddingVertical: 8 },
  typingText: { fontSize: 12, color: '#9E9E9E', fontStyle: 'italic' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#EAF4E3',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  loadingText: {
    fontSize: 12,
    color: '#9E9E9E',
    marginLeft: 8,
    fontStyle: 'italic'
  }
});
