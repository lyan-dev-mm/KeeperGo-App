import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useAdminStats } from '../hooks/useAdminStats';
import { isAdminEmail } from '../../utils/adminUtils';

export default function AdminHomeScreen() {
  const { user } = useAuth();
  const { stats, isLoading } = useAdminStats();

  if (!isAdminEmail(user?.email)) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.deniedContainer}>
          <Ionicons name="lock-closed-outline" size={48} color="#9E9E9E" />
          <Text style={styles.deniedText}>No tienes acceso a esta sección.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="rgba(0,0,0,0.87)" />
          </TouchableOpacity>
          <Text style={styles.title}>Panel de administración</Text>
        </View>

        {isLoading || !stats ? (
          <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalUsers}</Text>
              <Text style={styles.statLabel}>Usuarios totales</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.averageStreak}</Text>
              <Text style={styles.statLabel}>Racha promedio</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.averageLevel}</Text>
              <Text style={styles.statLabel}>Nivel promedio</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalActiveMessages}</Text>
              <Text style={styles.statLabel}>Mensajes activos</Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin-messages')}>
          <Ionicons name="chatbubbles-outline" size={22} color="#4CAF50" />
          <Text style={styles.menuItemText}>Gestionar mensajes motivacionales</Text>
          <Ionicons name="chevron-forward" size={18} color="#9E9E9E" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin-milestones')}>
          <Ionicons name="trophy-outline" size={22} color="#4CAF50" />
          <Text style={styles.menuItemText}>Editar hitos y recompensas</Text>
          <Ionicons name="chevron-forward" size={18} color="#9E9E9E" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin-users')}>
          <Ionicons name="people-outline" size={22} color="#4CAF50" />
          <Text style={styles.menuItemText}>Ver usuarios registrados</Text>
          <Ionicons name="chevron-forward" size={18} color="#9E9E9E" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 60 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: 'rgba(0,0,0,0.87)', marginLeft: 12 },
  deniedContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  deniedText: { marginTop: 12, fontSize: 15, color: '#9E9E9E', textAlign: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statCard: {
    width: '48%',
    backgroundColor: '#F5FBF3',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: { fontSize: 26, fontWeight: 'bold', color: '#2E7D32' },
  statLabel: { fontSize: 12, color: '#9E9E9E', marginTop: 4, textAlign: 'center' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  menuItemText: { flex: 1, marginLeft: 12, fontSize: 14, fontWeight: '600', color: 'rgba(0,0,0,0.8)' },
});