import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../../../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { useDASS21Status } from '../../hooks/useDASS21Status';
import { DASS21_CONFIG } from '../../../../constants/dass21Config';

export function RecordatorioDASS21() {
  const router = useRouter();
  const { user } = useAuth();
  const { estado } = useDASS21Status(user?.id);

  if (estado !== 'listo_final') return null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        router.push({ pathname: '/(modals)/DASS21', params: { tipo: 'final' } })
      }
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="clipboard" size={24} color="#FFFFFF" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.titulo}>¡Es hora de tu DASS-21 final!</Text>
        <Text style={styles.subtitulo}>
          Han pasado {DASS21_CONFIG.DIAS_ESPERA} días desde tu cuestionario inicial.
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={COLORS.primaryDark} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.secondary, borderRadius: 12,
    padding: 14, marginVertical: 8, marginHorizontal: 16,
    borderWidth: 1, borderColor: COLORS.primary, gap: 12,
  },
  iconContainer: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center', justifyContent: 'center',
  },
  textContainer: { flex: 1 },
  titulo: { fontSize: 14, fontWeight: '600', color: COLORS.title_black, marginBottom: 2 },
  subtitulo: { fontSize: 12, color: COLORS.gray[600] },
});