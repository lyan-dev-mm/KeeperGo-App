
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
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../../../constants/colors';
import EmotionCalendar from '../../components/bitacora/EmotionCalendar';
import PanelBienestar from '../../components/bitacora/PanelBienestar';
import DayInfoCard from '../../components/bitacora/DayInfoCard';
import RegistroAnimo from '../../../domain/entities/bitacora/RegistroAnimo';
import { useBitacoraStore } from '../../store/bitacoraStore';

interface RouteParams {
  fecha?: string;
  registro?: string;
  nuevoRegistro?: string;
}

export default function BitacoraScreen(): JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams<RouteParams>();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  const {
    registros = [],
    isLoading,
    alertas,
    resumenAlerta,
    analisisCompleto,
    loadRegistros,
    getRegistroPorFecha,
  } = useBitacoraStore();

  // Efecto para forzar actualización cuando cambian las alertas
  useEffect(() => {
  }, [alertas]);

  useFocusEffect(
    useCallback(() => {
      console.log('Enfocando BitacoraScreen');
      loadRegistros();
    }, [loadRegistros])
  );

  useEffect(() => {
    if (params?.nuevoRegistro) {
      try {
        const registroData = JSON.parse(params.nuevoRegistro as string);
        router.setParams({ nuevoRegistro: undefined });
      } catch (error) {
        console.error('Error al procesar nuevoRegistro:', error);
      }
    }
  }, [params?.nuevoRegistro]);

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
            fecha: typeof registroExistente.fecha === 'string' 
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
          fecha: typeof registro.fecha === 'string' 
            ? registro.fecha 
            : registro.fecha.toISOString(),
        }),
        fecha: date.toISOString(),
      },
    });
  };

  const selectedRegistro = getRegistroPorFecha(selectedDate);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bitácora Emocional</Text>
        {alertas && alertas.length > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>
              {alertas.filter(a => a.nivel === 'alto' || a.nivel === 'medio').length} insights
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
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
        />
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.white 
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
    color: COLORS.title_black 
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
  // Estilos para debug
  debugContainer: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  debugTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
    color: '#1E40AF',
  },
  debugItem: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  debugNivel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  debugText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  debugSugerencia: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  recomendacionesContainer: {
    marginTop: 16,
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  recomendacionesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.title_black,
    marginBottom: 12,
  },
  recomendacionItem: {
    marginBottom: 12,
  },
  recomendacionAccion: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primaryDark,
    marginBottom: 2,
  },
  recomendacionDetalle: {
    fontSize: 13,
    color: COLORS.gray[600],
    paddingLeft: 16,
  },
});