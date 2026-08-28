// src/presentation/screens/CommunityDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CommunityDetailScreen() {
  // Recibimos el estado 'isMember' de la ruta. Por defecto es 'false'.
  const { title, color, isMember } = useLocalSearchParams<{ title: string; color: string; isMember?: string }>();
  
  const alreadyMember = isMember === 'true';

  const handleJoin = () => {
    // Al presionar "Unirme", navega a la pantalla de reglas
    router.push({
      pathname: '/(tabs)/community-rules',
      params: { title, color },
    });
  };

  // Nueva función para responder a una publicación
  const handleReply = (author: string, postText: string) => {
    router.push({
      pathname: '/(tabs)/thread-reply',
      params: { author, text: postText, color: '#FF9F9F' }, // Color del avatar de ejemplo
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#4A3E38" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comunidad Hábitos</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Portada */}
        <View style={[styles.coverImage, { backgroundColor: color || '#98F59C' }]}>
          <Ionicons name="people" size={60} color="#FFFFFF" />
        </View>

        {/* Info */}
        <Text style={styles.groupName}>{title}</Text>
        <Text style={styles.groupMeta}>
          {/* CAMBIO: Ahora es un mundo (globe-outline) en lugar de candado */}
          <Ionicons name="globe-outline" size={14} color="#8A8A8A" /> Grupo público · Comunidad activa
        </Text>

        {/* Integrantes */}
        <Text style={styles.sectionTitle}>Integrantes</Text>
        <View style={styles.membersRow}>
          <View style={[styles.memberAvatar, { backgroundColor: color || '#98F59C' }]}>
            <Text style={styles.memberInitials}>AM</Text>
          </View>
          <View style={[styles.memberAvatar, { backgroundColor: color || '#98F59C', marginLeft: -10 }]}>
            <Text style={styles.memberInitials}>JR</Text>
          </View>
          <View style={[styles.memberAvatar, { backgroundColor: color || '#98F59C', marginLeft: -10 }]}>
            <Text style={styles.memberInitials}>LP</Text>
          </View>
          <View style={styles.addMemberIcon}>
            <Ionicons name="add" size={16} color="#4A4A4A" />
          </View>
          <Text style={styles.membersCount}>+ 250</Text>
        </View>

        {/* Botón Unirme (Solo si NO es miembro) */}
        {!alreadyMember && (
          <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
            <Text style={styles.joinButtonText}>Unirme</Text>
          </TouchableOpacity>
        )}

        {/* Mensaje si ya es miembro */}
        {alreadyMember && (
          <View style={styles.memberButton}>
            <Ionicons name="checkmark-circle" size={18} color="#4A4A4A" style={{ marginRight: 8 }} />
            <Text style={styles.memberButtonText}>Ya eres parte de esta comunidad</Text>
          </View>
        )}

        {/* Tabs de ejemplo */}
        <View style={styles.tabsRow}>
          <View style={[styles.tabButton, styles.activeTab]}>
            <Text style={styles.activeTabText}>Recientes</Text>
          </View>
          <View style={styles.tabButton}>
            <Text style={styles.tabText}>Actividades</Text>
          </View>
          <View style={styles.tabButton}>
            <Text style={styles.tabText}>Destacados</Text>
          </View>
        </View>

        {/* Publicaciones de ejemplo */}
        <Text style={styles.postsTitle}>Publicaciones recientes</Text>
        
        {/* Publicación 1 */}
        <View style={styles.postCard}>
          <View style={styles.postAvatar}>
            <Text style={styles.postInitials}>AM</Text>
          </View>
          <View style={styles.postContent}>
            <Text style={styles.postUser}>Andy Martínez</Text>
            <Text style={styles.postText}>
              Una recomendación ya que no encuentro el mismo gusto de lectura que antes.
            </Text>
            <View style={styles.postActions}>
              <TouchableOpacity onPress={() => handleReply('Andy Martínez', 'Una recomendación ya que no encuentro el mismo gusto de lectura que antes.')}>
                <Text style={styles.postActionText}>Responder</Text>
              </TouchableOpacity>
              <Text style={styles.postActionText}>Me gusta ❤️</Text>
            </View>
          </View>
        </View>

        {/* Publicación 2 (Ejemplo extra) */}
        <View style={styles.postCard}>
          <View style={[styles.postAvatar, { backgroundColor: '#B8C0FF' }]}>
            <Text style={styles.postInitials}>ER</Text>
          </View>
          <View style={styles.postContent}>
            <Text style={styles.postUser}>Edan Reyes</Text>
            <Text style={styles.postText}>
              No te tortures pensando en demasiadas ideas. Disfruta leyendo los clásicos que te gustan.
            </Text>
            <View style={styles.postActions}>
              <TouchableOpacity onPress={() => handleReply('Edan Reyes', 'No te tortures pensando en demasiadas ideas. Disfruta leyendo los clásicos que te gustan.')}>
                <Text style={styles.postActionText}>Responder</Text>
              </TouchableOpacity>
              <Text style={styles.postActionText}>Me gusta ❤️</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingTop: 15 },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A3E38' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  coverImage: { height: 160, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  groupName: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 5 },
  groupMeta: { fontSize: 13, color: '#8A8A8A', marginBottom: 20, flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 12 },
  membersRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  memberAvatar: { width: 35, height: 35, borderRadius: 17.5, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  memberInitials: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  addMemberIcon: { width: 35, height: 35, borderRadius: 17.5, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginLeft: -10, borderWidth: 2, borderColor: '#FFFFFF' },
  membersCount: { marginLeft: 10, color: '#4A4A4A', fontWeight: '600' },
  joinButton: { backgroundColor: '#98F59C', borderRadius: 25, paddingVertical: 14, alignItems: 'center', marginBottom: 25 },
  joinButtonText: { color: '#333333', fontWeight: 'bold', fontSize: 16 },
  memberButton: { 
    backgroundColor: '#E8F5E9', 
    borderRadius: 25, 
    paddingVertical: 14, 
    alignItems: 'center', 
    justifyContent: 'center', 
    flexDirection: 'row',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#58C759'
  },
  memberButtonText: { color: '#4A4A4A', fontWeight: 'bold', fontSize: 15 },
  tabsRow: { flexDirection: 'row', marginBottom: 25 },
  tabButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, backgroundColor: '#F4F4F4', marginRight: 10 },
  activeTab: { backgroundColor: '#98F59C' },
  activeTabText: { color: '#333333', fontWeight: 'bold', fontSize: 13 },
  tabText: { color: '#A0A0A0', fontWeight: '600', fontSize: 13 },
  postsTitle: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 15 },
  postCard: { backgroundColor: '#F9F9F9', borderRadius: 16, padding: 15, flexDirection: 'row', marginBottom: 15 },
  postAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FF9F9F', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  postInitials: { color: '#FFFFFF', fontWeight: 'bold' },
  postContent: { flex: 1 },
  postUser: { fontSize: 13, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  postText: { fontSize: 13, color: '#4A4A4A', lineHeight: 18, marginBottom: 10 },
  postActions: { flexDirection: 'row', justifyContent: 'space-between' },
  postActionText: { fontSize: 12, color: '#8A8A8A', fontWeight: '500' },
});