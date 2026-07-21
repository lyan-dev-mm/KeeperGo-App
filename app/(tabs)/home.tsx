import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../src/presentation/components/Card';
import { SideDrawer, DrawerMenuItem } from '../../src/presentation/components/SideDrawer';
import { useAuth } from '../../src/presentation/hooks/useAuth';

function showComingSoon() {
  Alert.alert('Próximamente', 'Estamos trabajando en esto, pronto estará disponible.');
}

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const fullName = user?.name ?? '';
  const firstName = fullName.split(' ')[0] || user?.email?.split('@')[0] || 'Usuario';

  const menuItems: DrawerMenuItem[] = [
    { label: 'Perfil', onPress: showComingSoon },
    { label: 'Comunidad de hábitos', onPress: showComingSoon },
    { label: 'Bitácora de emociones', onPress: showComingSoon },
    { label: 'Zona de relajación', onPress: showComingSoon },
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
        </View>

        <Text style={styles.greeting}>Hola, {firstName}!</Text>
        <Text style={styles.subGreeting}>describe tu día a Kii</Text>

        <View style={{ height: 30 }} />

        <Card
          title="Respiración Guiada"
          subtitle="Tómate 30 segundos para ti"
          buttonText="Iniciar respiración"
          iconName="leaf-outline"
          color="#4CAF50"
          onPress={showComingSoon}
        />

        <View style={{ height: 20 }} />

        <Card
          title="¿Cómo te sientes hoy?"
          subtitle="Recuerda tus emociones importantes"
          buttonText="Registrar ánimo"
          iconName="happy-outline"
          color="#FF9800"
          onPress={showComingSoon}
        />

        <View style={styles.motivation}>
          <Ionicons name="paw-outline" size={50} color="#616161" />
          <Text style={styles.motivationTitle}>Tu mascota te acompaña.</Text>
          <Text style={styles.motivationSubtitle}>Mientras tu creces el también.</Text>
          <Text style={styles.motivationBold}>¡Sigue así!</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => {}}>
          <Ionicons name="home" size={26} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity onPress={showComingSoon}>
          <Ionicons name="heart-outline" size={26} color="#9E9E9E" />
        </TouchableOpacity>
        <TouchableOpacity onPress={showComingSoon}>
          <Ionicons name="add-circle-outline" size={30} color="#9E9E9E" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(tabs)/racha')}>
          <Ionicons name="paw-outline" size={26} color="#9E9E9E" />
        </TouchableOpacity>
        <TouchableOpacity onPress={showComingSoon}>
          <Ionicons name="person-outline" size={26} color="#9E9E9E" />
        </TouchableOpacity>
      </View>

      <SideDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        userName={fullName || firstName}
        menuItems={menuItems}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  container: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 30 },
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