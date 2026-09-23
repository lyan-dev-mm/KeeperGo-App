// src/presentation/components/notifications/NotificationCenter.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../../../../constants/colors';
import { useDASS21Status } from '../../hooks/useDASS21Status';
import { usePilotoStatus } from '../../hooks/usePilotoStatus';
import { useAuth } from '../../contexts/AuthContext';

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
}

interface Notificacion {
  id: string;
  titulo: string;
  subtitulo: string;
  icono: keyof typeof Ionicons.glyphMap;
  color: string;
  colorFondo: string;
  /** Qué hacer al presionar */
  action:
    | { type: 'dass21_inicial' }
    | { type: 'cierre_piloto'; esPrimeraVez: boolean };
}

export function NotificationCenter({ visible, onClose }: NotificationCenterProps) {
  const router = useRouter();
  const { user } = useAuth();

  const { estado } = useDASS21Status(user?.id);
  const { debeMostrarBannerCierre, progreso } = usePilotoStatus(user?.id);

  const handlePress = (notif: Notificacion) => {
    onClose();

    if (notif.action.type === 'dass21_inicial') {
      router.push({
        pathname: '/(modals)/DASS21',
        params: { tipo: 'inicial' },
      });
      return;
    }

    if (notif.action.type === 'cierre_piloto') {
      if (notif.action.esPrimeraVez) {
        router.push({
          pathname: '/(modals)/BienvenidaPiloto',
          params: { variante: 'cierre' },
        });
      } else {
        router.push('/(modals)/CierrePiloto');
      }
    }
  };

  // ─── Construir lista de notificaciones ────────────────────
  const notificaciones: Notificacion[] = [];

  // Día 1: pretest DASS-21
  if (estado === 'sin_iniciar') {
    notificaciones.push({
      id: 'dass21-inicial',
      titulo: '¡Completa tu cuestionario inicial!',
      subtitulo: 'Ayúdanos a conocer cómo te sientes. Solo toma 5 minutos.',
      icono: 'clipboard-outline',
      color: '#4CAF50',
      colorFondo: '#E8F5E9',
      action: { type: 'dass21_inicial' },
    });
  }

  // Día 5: cierre del piloto (incluye todos los instrumentos)
  if (debeMostrarBannerCierre) {
    const esPrimeraVez = progreso.completados === 0;
    const faltantes = progreso.total - progreso.completados;

    notificaciones.push({
      id: 'cierre-piloto',
      titulo: esPrimeraVez ? '¡Último día del piloto!' : 'Continúa tu cierre',
      subtitulo: esPrimeraVez
        ? 'Completa tu cierre en 8 minutos.'
        : `Faltan ${faltantes} ${faltantes === 1 ? 'paso' : 'pasos'} para terminar.`,
      icono: 'flag',
      color: '#eebe44',
      colorFondo: '#FFF8E1',
      action: { type: 'cierre_piloto', esPrimeraVez },
    });
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Notificaciones</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.title_black} />
            </TouchableOpacity>
          </View>

          {/* Contenido */}
          {notificaciones.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-circle" size={64} color={COLORS.primary} />
              <Text style={styles.emptyTitle}>Todo al día</Text>
              <Text style={styles.emptySubtitle}>
                No tienes notificaciones pendientes
              </Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.content}>
              {notificaciones.map((notif) => (
                <TouchableOpacity
                  key={notif.id}
                  style={[styles.notifCard, { backgroundColor: notif.colorFondo }]}
                  onPress={() => handlePress(notif)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.notifIcon, { backgroundColor: notif.color }]}>
                    <Ionicons name={notif.icono} size={22} color="#FFFFFF" />
                  </View>
                  <View style={styles.notifContent}>
                    <Text style={styles.notifTitulo}>{notif.titulo}</Text>
                    <Text style={styles.notifSubtitulo}>{notif.subtitulo}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.title_black,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.title_black,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.gray[500],
    marginTop: 4,
    textAlign: 'center',
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: {
    flex: 1,
  },
  notifTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.title_black,
    marginBottom: 2,
  },
  notifSubtitulo: {
    fontSize: 12,
    color: COLORS.gray[600],
    lineHeight: 16,
  },
});