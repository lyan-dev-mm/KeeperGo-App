import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'specialist';
  timestamp: Date;
};

// Respuestas genéricas de ejemplo para el especialista
const getSpecialistReply = (userMessage: string): string => {
  const lower = userMessage.toLowerCase();
  if (lower.includes('hola') || lower.includes('buenos')) {
    return '¡Hola! ¿Cómo te sientes hoy? Cuéntame, estoy aquí para escucharte.';
  }
  if (lower.includes('ansiedad') || lower.includes('estrés')) {
    return 'Entiendo que la ansiedad puede ser abrumadora. Vamos a respirar juntos. ¿Has probado la técnica 4-7-8? Inhala 4 segundos, sostén 7, exhala 8. ¿Quieres que la practiquemos?';
  }
  if (lower.includes('triste') || lower.includes('deprimido')) {
    return 'Lamento que te sientas así. Recuerda que no estás solo, y estos sentimientos son temporales. ¿Qué actividad solía darte alegría antes? Tal vez podamos empezar por ahí.';
  }
  if (lower.includes('gracias')) {
    return 'Siempre es un placer ayudarte. Cuenta conmigo cuando lo necesites.';
  }
  return 'Gracias por compartir eso conmigo. Me gustaría entender más, ¿podrías contarme un poco más sobre cómo te sientes?';
};

export default function SpecialistChatScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hola, soy ${name}. Cuéntame, ¿cómo te sientes hoy? Estoy aquí para apoyarte.`,
      sender: 'specialist',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = () => {
    if (inputText.trim().length === 0) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Simular respuesta del especialista después de 1s
    setTimeout(() => {
      const replyText = getSpecialistReply(userMsg.text);
      const specialistMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: replyText,
        sender: 'specialist',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, specialistMsg]);
    }, 1000);
  };

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.specialistRow]}>
        {!isUser && (
          <View style={styles.avatarIcon}>
            <Ionicons name="person-circle" size={32} color={Colors.primary} />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.specialistBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.specialistText]}>
            {item.text}
          </Text>
          <Text style={styles.timestamp}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        {isUser && (
          <View style={styles.avatarIcon}>
            <Ionicons name="person" size={32} color="#ccc" />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="rgba(0,0,0,0.87)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escribe un mensaje..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: 'rgba(0,0,0,0.87)' },
  chatList: { paddingHorizontal: 12, paddingTop: 16, paddingBottom: 12 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  userRow: { justifyContent: 'flex-end' },
  specialistRow: { justifyContent: 'flex-start' },
  avatarIcon: { marginHorizontal: 6 },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 16 },
  userBubble: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  specialistBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#eee' },
  messageText: { fontSize: 15, lineHeight: 20 },
  userText: { color: '#fff' },
  specialistText: { color: '#222' },
  timestamp: { fontSize: 10, color: '#999', marginTop: 4, alignSelf: 'flex-end' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: 30,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});