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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { delay } from '../../utils/asyncUtils';

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
  const [hasPlayedScript, setHasPlayedScript] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  const addMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;

    addMessage({ id: `user-${Date.now()}`, sender: 'user', text });
    setInputText('');

    setIsTyping(true);
    await delay(1000);
    setIsTyping(false);

    if (!hasPlayedScript) {
      setHasPlayedScript(true);
      addMessage({ id: `kii-${Date.now()}`, sender: 'kii', text: SCRIPTED_RESPONSE_1 });

      setIsTyping(true);
      await delay(1200);
      setIsTyping(false);
      addMessage({ ...SCRIPTED_RESPONSE_2, id: `kii-${Date.now()}-2` });
    } else {
      addMessage({ id: `kii-${Date.now()}`, sender: 'kii', text: FOLLOW_UP_RESPONSE });
    }
  };

  const handleLinkPress = () => {
    Alert.alert('Próximamente', 'Estamos trabajando en esto, pronto estará disponible.');
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
});