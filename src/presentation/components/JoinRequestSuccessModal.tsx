import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  communityName: string;
  outcome: 'joined' | 'requested';
  onClose: () => void;
}

export default function JoinRequestSuccessModal({ visible, communityName, outcome, onClose }: Props) {
  const isJoined = outcome === 'joined';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={[styles.iconCircle, isJoined && styles.iconCircleJoined]}>
            <Ionicons
              name={isJoined ? 'checkmark-circle' : 'paper-plane'}
              size={40}
              color={isJoined ? '#58C759' : '#5073FF'}
            />
          </View>
          <Text style={styles.title}>
            {isJoined ? '¡Bienvenido!' : '¡Solicitud enviada!'}
          </Text>
          <Text style={styles.message}>
            {isJoined
              ? `Ya eres parte de "${communityName}". ¡Empieza a compartir y participar!`
              : `El creador de "${communityName}" revisará tu solicitud. Te avisaremos cuando sea aceptada.`}
          </Text>
          <TouchableOpacity
            style={[styles.button, isJoined && styles.buttonJoined]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>
              {isJoined ? 'Ir a la comunidad' : 'Entendido'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8EEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  iconCircleJoined: { backgroundColor: '#E8F5E9' },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#5073FF',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 40,
    minWidth: 180,
    alignItems: 'center',
  },
  buttonJoined: { backgroundColor: '#58C759' },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});