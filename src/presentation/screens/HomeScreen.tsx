import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { SideDrawer, DrawerMenuItem } from '../components/SideDrawer';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { ProfileCustomizationModal } from '../components/notifications/ProfileCustomizationModal';
import { ProfileTypeSelector } from '../components/profile/ProfileTypeSelector';

function showComingSoon() {
  Alert.alert('Próximamente', 'Estamos trabajando en esto, pronto estará disponible.');
}

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { profile } = useUserProfile();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const fullName = profile?.generalInfo?.username || profile?.professionalInfo?.professionalName || profile?.institutionInfo?.institutionName || user?.name || '';
  const firstName = fullName.split(' ')[0] || user?.email?.split('@')[0] || 'Usuario';
  const profileImageUrl = profile?.profileImage?.url;

  const menuItems: DrawerMenuItem[] = [
    { label: 'Perfil', onPress: () => setShowProfileModal(true) },
    { label: 'Comunidad de hábitos', onPress:  () => router.push('/(tabs)/habits') },
    { label: 'Bitácora de emociones', onPress: () => router.push('/(tabs)/bitacora') },
    { label: 'Zona de relajación', onPress: () => router.push('/zona-relajacion') },
    { label: 'Técnicas de Estudio', onPress: showComingSoon },
    { label: 'Ver planes', onPress: showComingSoon },
    { label: 'Configuraciones', onPress: showComingSoon },
    {
      label: 'Cerrar sesión',
      onPress: async () => {
        await logout();
        router.replace('/(auth)/login');
      },
    },
  ];

  return (
    <SafeAreaView style={styles.wrapper} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setDrawerVisible(true)}>
            <Ionicons name="menu" size={28} color="#333" />
          </TouchableOpacity>
          {/**
          <TouchableOpacity onPress={() => setShowProfileModal(true)}>
            <Ionicons name="notifications-outline" size={28} color="#333" />
          </TouchableOpacity>
           */}
        </View>

        <Text style={styles.greeting}>Hola, {firstName}!</Text>
        <Text style={styles.subGreeting}>Describe tu día a Kii</Text>
        <View style={{ height: 30 }} />

        <Card
          title="Respiración Guiada"
          subtitle="Tómate 30 segundos para ti"
          buttonText="Iniciar respiración"
          iconName="leaf-outline"
          color="#4CAF50"
          onPress={() => router.push('/zona-relajacion')}
        />

        <View style={{ height: 20 }} />

        <Card
          title="¿Cómo te sientes hoy?"
          subtitle="Recuerda tus emociones importantes"
          buttonText="Registrar ánimo"
          iconName="happy-outline"
          color="#FF9800"
          onPress={() => router.push('/bitacora')}
        />

        <View style={styles.motivation}>
          <Ionicons name="paw-outline" size={50} color="#616161" />
          <Text style={styles.motivationTitle}>Tu mascota te acompaña.</Text>
          <Text style={styles.motivationSubtitle}>Mientras tu creces el también.</Text>
          <Text style={styles.motivationBold}>¡Sigue así!</Text>
        </View>
      </ScrollView>

      <SideDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        userName={fullName || firstName}
        profileImage={profileImageUrl}
        menuItems={menuItems}
      />

      <ProfileCustomizationModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onStart={() => {
          setShowProfileModal(false);
          setShowTypeSelector(true);
        }}
      />

      <ProfileTypeSelector
        visible={showTypeSelector}
        onClose={() => setShowTypeSelector(false)}
        onSelect={(type) => {
          setShowTypeSelector(false);
          router.push({
            pathname: '/profile-setup',
            params: { type },
          });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  container: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: { fontSize: 28, fontWeight: 'bold', color: 'rgba(0,0,0,0.87)' },
  subGreeting: { fontSize: 16, color: '#9E9E9E', marginTop: 4 },
  motivation: { alignItems: 'center', marginTop: 40 },
  motivationTitle: { fontSize: 16, fontWeight: '500', color: 'rgba(0,0,0,0.87)', marginTop: 10 },
  motivationSubtitle: { fontSize: 14, color: '#9E9E9E' },
  motivationBold: { fontSize: 14, fontWeight: 'bold', color: 'rgba(0,0,0,0.87)', marginTop: 8 },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    backgroundColor: '#fff',
  },
});