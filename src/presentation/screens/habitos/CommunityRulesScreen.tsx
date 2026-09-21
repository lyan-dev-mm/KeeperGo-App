import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';

import { CommunityRepositoryImpl } from '../../../data/repositories/comunidad/CommunityRepositoryImpl';
import { GetCommunityDetailUseCase } from '../../../domain/usecases/comunidad/GetCommunityDetailUseCase';
import { JoinOrRequestCommunityUseCase } from '../../../domain/usecases/comunidad/JoinOrRequestCommunityUseCase';
import { CommunityEntity } from '../../../domain/entities/comunidad/Community';
import JoinRequestSuccessModal from '../../components/JoinRequestSuccessModal';

const communityRepository = new CommunityRepositoryImpl();
const getCommunityDetailUseCase = new GetCommunityDetailUseCase(communityRepository);
const joinOrRequestCommunityUseCase = new JoinOrRequestCommunityUseCase(communityRepository);

export default function CommunityRulesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState<CommunityEntity | null>(null);
  const [alreadyMember, setAlreadyMember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // ✅ Hooks dentro del componente
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [outcome, setOutcome] = useState<'joined' | 'requested'>('joined');

  useEffect(() => {
    async function load() {
      if (!id || !user?.id) return;
      setLoading(true);
      try {
        const detail = await getCommunityDetailUseCase.execute(id, user.id);
        setCommunity(detail.community);
        setAlreadyMember(!!detail.membership);
      } catch (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo cargar la comunidad.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, user?.id]);
  // Si el usuario ya es miembro, redirigir directo al detalle de la comunidad
  useEffect(() => {
    if (!loading && alreadyMember && id) {
      router.replace({ pathname: '/(tabs)/community-detail', params: { id } });
    }
  }, [loading, alreadyMember, id]);
  const handleAccept = async () => {
    if (!id || !user?.id || !community) return;
    setIsSubmitting(true);
    try {
      const result = await joinOrRequestCommunityUseCase.execute(id, user.id, user.name);
      setOutcome(result);
      setShowSuccessModal(true);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo completar la acción.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator color="#58C759" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!community) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centerContainer}>
          <Text style={styles.notFoundText}>No se encontró la comunidad.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.notFoundButton}>
            <Text style={styles.notFoundButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Reglas de la comunidad</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#58C759" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {community.coverImage ? (
          <View style={[styles.banner, { backgroundColor: community.color }]}>
            <Ionicons name="book-outline" size={48} color="#FFFFFF" />
          </View>
        ) : (
          <View style={[styles.banner, { backgroundColor: community.color }]}>
            <Ionicons name="people" size={48} color="#FFFFFF" />
          </View>
        )}

        <Text style={styles.communityTitle}>{community.name}</Text>

        {!!community.description && <Text style={styles.paragraph}>{community.description}</Text>}
        <Text style={styles.paragraph}>
          {community.visibility === 'private'
            ? 'Esta comunidad es privada: tu solicitud quedará pendiente hasta que el creador la acepte.'
            : 'Si deseas integrarte en esta comunidad deberás respetar las siguientes reglas.'}
        </Text>

        {community.rules.length === 0 ? (
          <Text style={styles.noRulesText}>Esta comunidad todavía no tiene reglas establecidas.</Text>
        ) : (
          <View style={styles.rulesList}>
            {community.rules.map((rule, index) => (
              <View key={`${rule.title}-${index}`} style={styles.ruleItem}>
                <View style={styles.ruleIconContainer}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#58C759" />
                </View>
                <View style={styles.ruleTextContainer}>
                  <Text style={styles.ruleTitle}>{rule.title}</Text>
                  {!!rule.description && <Text style={styles.ruleDescription}>{rule.description}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {alreadyMember ? (
          <View style={styles.memberNotice}>
            <Ionicons name="checkmark-circle" size={18} color="#4A4A4A" style={{ marginRight: 8 }} />
            <Text style={styles.memberNoticeText}>Ya eres parte de esta comunidad</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.acceptButton} onPress={handleAccept} disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.acceptButtonText}>
                {community.visibility === 'public' ? 'Aceptar y Unirme' : 'Aceptar y solicitar unirme'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* ✅ Modal colocado en el lugar correcto (al final del componente) */}
      <JoinRequestSuccessModal
  visible={showSuccessModal}
  communityName={community.name}
  outcome={outcome}
        onClose={() => {
          setShowSuccessModal(false);
          // Navega al detalle: si es miembro verá la comunidad, si es pending verá el estado "pendiente"
          router.replace({ pathname: '/(tabs)/community-detail', params: { id } });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  notFoundText: { fontSize: 15, color: '#4A4A4A', marginBottom: 15 },
  notFoundButton: { backgroundColor: '#58C759', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 20 },
  notFoundButtonText: { color: '#FFFFFF', fontWeight: '600' },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A3E38' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  banner: { height: 150, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  communityTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 12 },
  paragraph: { fontSize: 14, color: '#4A4A4A', lineHeight: 20, marginBottom: 10 },
  noRulesText: { fontSize: 13, color: '#A0A0A0', marginTop: 10 },
  rulesList: { marginTop: 15 },
  ruleItem: { flexDirection: 'row', marginBottom: 18 },
  ruleIconContainer: { width: 32, alignItems: 'center', marginRight: 10, marginTop: 2 },
  ruleTextContainer: { flex: 1 },
  ruleTitle: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 3 },
  ruleDescription: { fontSize: 13, color: '#8A8A8A', lineHeight: 18 },
  footer: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10 },
  acceptButton: { backgroundColor: '#58C759', borderRadius: 25, paddingVertical: 14, alignItems: 'center' },
  acceptButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  memberNotice: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  memberNoticeText: { color: '#4A4A4A', fontWeight: '600', fontSize: 14 },
});