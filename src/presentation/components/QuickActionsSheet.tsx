import React from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface QuickActionsSheetProps {
  visible: boolean;
  onClose: () => void;
}

interface ActionItem {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

function showComingSoon() {
  Alert.alert('Próximamente', 'Estamos trabajando en esto, pronto estará disponible.');
}

const ACTIONS: ActionItem[] = [
  { key: 'actividad', icon: 'book-outline', label: 'Nueva Actividad' },
  { key: 'habito', icon: 'star-outline', label: 'Nuevo hábito' },
  { key: 'emocion', icon: 'happy-outline', label: 'Registrar emoción' },
  { key: 'kii', icon: 'chatbubble-ellipses-outline', label: 'Conversar con Kii' },
];

export function QuickActionsSheet({ visible, onClose }: QuickActionsSheetProps) {
  const handlePress = (key: string) => {
    onClose();
    if (key === 'kii') {
      router.push('/kii-chat');
    } else if (key === 'habito') {
      router.push('/(tabs)/habits');
    } else {
      showComingSoon();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <SafeAreaView style={styles.sheetWrapper} edges={['bottom']} pointerEvents="box-none">
        <View style={styles.sheet}>
          <View style={styles.grid}>
            {ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.key}
                style={styles.card}
                onPress={() => handlePress(action.key)}
              >
                <Ionicons name={action.icon} size={26} color="#4CAF50" />
                <Text style={styles.cardLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheetWrapper: { position: 'absolute', bottom: 90, left: 0, right: 0, alignItems: 'center' },
  sheet: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: 260, justifyContent: 'space-between' },
  card: {
    width: 116,
    height: 90,
    backgroundColor: '#F5FBF3',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  cardLabel: { marginTop: 8, fontSize: 12, color: 'rgba(0,0,0,0.75)', textAlign: 'center', fontWeight: '600' },
});