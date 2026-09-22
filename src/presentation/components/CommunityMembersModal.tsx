import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommunityMemberEntity } from '../../domain/entities/comunidad/CommunityMember';

interface Props {
  visible: boolean;
  onClose: () => void;
  members: CommunityMemberEntity[];
  loading: boolean;
  communityName: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function CommunityMembersModal({
  visible,
  onClose,
  members,
  loading,
  communityName,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Integrantes</Text>
            <Text style={styles.subtitle}>
              {communityName} · {members.length}{' '}
              {members.length === 1 ? 'persona' : 'personas'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={28} color="#C7C7C7" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#58C759" size="large" />
          </View>
        ) : members.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No hay integrantes todavía.</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {members.map((member) => {
              const displayName = member.userName || 'Usuario anónimo';
              const avatarColor = member.userColor || '#98F59C';
              return (
                <View key={member.uid} style={styles.memberRow}>
                  <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                    <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName} numberOfLines={1}>
                      {displayName}
                    </Text>
                    <Text style={styles.memberRole}>
                      {member.role === 'owner' ? '👑 Creador' : 'Miembro'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  subtitle: { fontSize: 13, color: '#8A8A8A', marginTop: 2 },
  center: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#A0A0A0' },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  memberRole: { fontSize: 12, color: '#8A8A8A', marginTop: 2 },
});