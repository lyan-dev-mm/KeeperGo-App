// src/presentation/screens/bitacora/BitacoraScreen.tsx

import React, { useState, useCallback, JSX, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../../../constants/colors';
import EmotionCalendar from '../../components/bitacora/EmotionCalendar';
import PanelBienestar from '../../components/bitacora/PanelBienestar';
import DayInfoCard from '../../components/bitacora/DayInfoCard';
import RegistroAnimo from '../../../domain/entities/bitacora/RegistroAnimo';
import { useBitacoraStore } from '../../store/bitacoraStore';
import { useAuth } from '../../contexts/AuthContext';
import { useShallow } from 'zustand/react/shallow';

export default function BitacoraScreen(): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const userId = user?.id;

  const { registros, alertas, resumenAlerta, recomendaciones, requiereProfesional } =
    useBitacoraStore(
      useShallow((state) => ({
        registros: state.registros,
        alertas: state.alertas,
        resumenAlerta: state.resumenAlerta,
        recomendaciones: state.recomendaciones,
        requiereProfesional: state.requiereProfesional,
      }))
    );

  const { setUserId, loadRegistros, saveRegistro, deleteRegistro, limpiarAlertas } =
    useBitacoraStore();

  useEffect(() => {
    if (userId) {
      console.log('Sincronizando userId con store:', userId);
      setUserId(userId);

      if (registros.length === 0) {
        loadRegistros(true); 
      }
    }
  }, [userId, setUserId, loadRegistros, registros.length]);

  useEffect(() => {
    if (params?.nuevoRegistro) {
      try {
        JSON.parse(params.nuevoRegistro as string);
        router.setParams({ nuevoRegistro: undefined });
      } catch (error) {
        console.error('Error al procesar nuevoRegistro:', error);
      }
    }
  }, [params?.nuevoRegistro, router]);

  const getRegistroPorFecha = useCallback(
    (fecha: Date): RegistroAnimo | null => {
      try {
        const targetDate = new Date(fecha);
        targetDate.setHours(0, 0, 0, 0);

        const encontrado = registros.find((r) => {
          const rDate = new Date(r.fecha);
          rDate.setHours(0, 0, 0, 0);
          return rDate.getTime() === targetDate.getTime();
        });

        return encontrado || null;
      } catch (error) {
        console.error('Error en getRegistroPorFecha:', error);
        return null;
      }
    },
    [registros]
  );

  if (!userId) {
    console.log('Esperando autenticacion...');
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  console.log('Registros en UI:', registros.length);

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadRegistros();
    setRefreshing(false);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isFuture = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCompare = new Date(date);
    dateToCompare.setHours(0, 0, 0, 0);
    return dateToCompare > today;
  };

  const handleDayPress = (date: Date): void => {
    setSelectedDate(date);
    const registroExistente = getRegistroPorFecha(date);

    if (registroExistente) {
      router.push({
        pathname: '/(modals)/EmotionDetail',
        params: {
          registro: JSON.stringify({
            ...registroExistente,
            fecha:
              typeof registroExistente.fecha === 'string'
                ? registroExistente.fecha
                : registroExistente.fecha.toISOString(),
          }),
          fecha: date.toISOString(),
        },
      });
    } else {
      router.push({
        pathname: '/(modals)/RegisterEmotion',
        params: {
          fecha: date.toISOString(),
          registro: null,
        },
      });
    }
  };

  const handleEmotionPress = (registro: RegistroAnimo, date: Date): void => {
    router.push({
      pathname: '/(modals)/EmotionDetail',
      params: {
        registro: JSON.stringify({
          ...registro,
          fecha: typeof registro.fecha === 'string' ? registro.fecha : registro.fecha.toISOString(),
        }),
        fecha: date.toISOString(),
      },
    });
  };

  // TODO: ajusta esta ruta al nombre de profesionales de salud mental.
  const handleVerProfesionales = (): void => {
    router.push('/(modals)/ProfesionalesDirectory');
  };

  const selectedRegistro = getRegistroPorFecha(selectedDate);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bitacora Emocional</Text>
        {alertas && alertas.length > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>
              {alertas.filter((a) => a.nivel === 'alto' || a.nivel === 'medio').length} insights
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <EmotionCalendar
          registros={registros || []}
          onDayPress={handleDayPress}
          onEmotionPress={handleEmotionPress}
          selectedDate={selectedDate}
        />

        <DayInfoCard
          registro={selectedRegistro}
          fecha={selectedDate}
          onEdit={() => handleDayPress(selectedDate)}
          onRegister={() => handleDayPress(selectedDate)}
          isToday={isToday(selectedDate)}
          isFuture={isFuture(selectedDate)}
        />

        <PanelBienestar
          alertas={alertas}
          resumen={resumenAlerta}
          recomendaciones={recomendaciones}
          requiereProfesional={requiereProfesional}
          onVerProfesionales={handleVerProfesionales}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.title_black,
  },
  badgeContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});