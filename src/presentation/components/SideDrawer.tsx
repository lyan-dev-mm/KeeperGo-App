import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.8;

export interface DrawerMenuItem {
  label: string;
  onPress: () => void;
}

interface SideDrawerProps {
  visible: boolean;
  onClose: () => void;
  userName: string;
  menuItems: DrawerMenuItem[];
}

export function SideDrawer({ visible, onClose, userName, menuItems }: SideDrawerProps) {
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(visible);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(translateX, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, { toValue: -DRAWER_WIDTH, duration: 250, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => setModalVisible(false));
    }
  }, [visible]);

  if (!modalVisible) return null;

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[styles.drawer, { width: DRAWER_WIDTH, transform: [{ translateX }] }]}
        >
          <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <TouchableOpacity onPress={onClose} style={styles.menuButton}>
              <Ionicons name="menu" size={28} color="#333" />
            </TouchableOpacity>

            <View style={styles.profileSection}>
              <Ionicons name="person-circle" size={90} color="#9DDC9A" />
              <Text style={styles.userName}>{userName}</Text>
            </View>

            <View style={styles.divider} />

            <ScrollView contentContainerStyle={styles.menuList}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => {
                    onClose();
                    item.onPress();
                  }}
                >
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawer: {
    height: '100%',
    backgroundColor: '#fff',
    position: 'absolute',
    left: 0,
    top: 0,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 2, height: 0 },
    elevation: 10,
  },
  container: { flex: 1, paddingHorizontal: 20 },
  menuButton: { marginTop: 10, marginBottom: 10 },
  profileSection: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
  userName: { marginTop: 8, fontSize: 18, fontWeight: 'bold', color: 'rgba(0,0,0,0.87)' },
  divider: { height: 2, backgroundColor: '#9DDC9A', borderRadius: 2, marginBottom: 16 },
  menuList: { paddingBottom: 40 },
  menuItem: {
    backgroundColor: '#EAF7E6',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  menuItemText: { fontSize: 15, color: 'rgba(0,0,0,0.8)' },
});