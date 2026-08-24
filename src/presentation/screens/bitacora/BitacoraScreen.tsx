// src/presentation/screens/bitacora/BitacoraScreen.jsx

import React, { useState, useCallback, JSX } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS } from '../../../../constants/colors';
import { Emocion } from '../../../domain/entities/bitacora/Emocion'; 
import { useBitacora } from '../../hooks/useBitacora';
import EmotionCalendar from '../../components/bitacora/EmotionCalendar';

import { RegistroAnimoRepositoryImpl } from '../../../data/repositories/RegistroAnimoRepositoryImpl';
import { AnalisisCompleto, DetectarPatronesUseCase } from '../../../domain/usecases/bitacora/DetectarPatronesUseCase';
import AlertaPrevencion from '../../components/bitacora/AlertaPrevencion';
import PanelBienestar from '../../components/bitacora/PanelBienestar';
import DayInfoCard from '../../components/bitacora/DayInfoCard';
import RegistroAnimo from '../../../domain/entities/bitacora/RegistroAnimo';
import { Alerta } from '../../../domain/usecases/bitacora/DetectarPatronesUseCase';

import { AlertaBienestar } from '../../components/bitacora/PanelBienestar';

interface RouteParams {
  fecha?: string;
  registro?: string;
}


export default function BitacoraScreen(): JSX.Element  {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [resumenAlerta, setResumenAlerta] = useState<string>('');

  const {
    registros = [],
    isLoading,
    loadRegistros,
    getRegistroPorFecha,
  } = useBitacora();

  useFocusEffect(
    useCallback(() => {
      loadRegistros();
      setAlertas([]);
      setResumenAlerta('')
    }, [loadRegistros])
  );

  const handleRefresh = async () : Promise<void> => {
    setRefreshing(true);
    await loadRegistros();
    setAlertas([]);
    setResumenAlerta('');
    setRefreshing(false);
  };

   //  FUNCIONES AUXILIARES 
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
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };


  // ANALISIS DE PATRONES

  // Función para analizar patrones después de registrar
  const analizarPatrones = async (nuevoRegistro: RegistroAnimo): Promise<AnalisisCompleto | null> => {
  console.log('Analizando análisis de patrones');


  try {
    const repository = new RegistroAnimoRepositoryImpl();
    const detectarPatrones = new DetectarPatronesUseCase(repository);
    
    // Obtener historial completo
    const historial = await repository.getRegistros('temp_user');
    console.log('Historial obtenido', historial.length, 'registros');
    
    // Ejecutar análisis
    const resultado = await detectarPatrones.execute(
      'temp_user',
      nuevoRegistro,
      historial
    );

    console.log('resultado del analisis', resultado);
    console.log('Alertas encontradas', resultado.alertas.length);

    setAlertas(resultado.alertas);
    setResumenAlerta(resultado.resumen);
    
    return resultado;
  } catch (error) {
    console.error('Error en análisis de patrones:', error);
    return null;
  }
};

  //  HANDLERS DE NAVEGACIÓN 
  
  // 1. Tocar un día (sin emoción o para editar)
  const handleDayPress = (date: Date): void => {
    setSelectedDate(date);
    const registroExistente = getRegistroPorFecha(date);
    
    // Si tiene registro, vamos al detalle
    if (registroExistente) {
       router.push({
        pathname: '/EmotionDetail',
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
      console.log('Navegando a RegisterEmotion');
      
      router.push({
        pathname: '/RegisterEmotion',
        params: {
          fecha: date.toISOString(),
          registro: null,
        },
      });
    }
  };
    
    
      /* Cuando se complete el registro, analizar patrones
      onRegisterComplete: (nuevoRegistro) => {
        if (nuevoRegistro) {
          analizarPatrones(nuevoRegistro);
        } else {
          console.log('Nuevo registro es null o undefined');
        }
        loadRegistros();
      }*/
    

  // 2. Tocar el ícono de la emoción (ver detalle)
  const handleEmotionPress = (registro: RegistroAnimo, date: Date): void => {
    router.push({
      pathname: '/EmotionDetail',
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
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* CALENDARIO  */}
        <EmotionCalendar
          registros={registros || [] }
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
          
        {/*  PANEL DE BIENESTAR  */}
      <PanelBienestar 
        alertas={alertas} 
        resumen={resumenAlerta}
      />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.title_black },
  headerSubtitle: { fontSize: 14, color: COLORS.gray[500], marginTop: 2 },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  
  dayInfoContainer: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dayInfoDate: { fontSize: 16, fontWeight: '600', color: COLORS.black, marginBottom: 12 },
  registeredContent: { alignItems: 'center' },
  emotionTag: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 8 },
  emotionTagText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  energyInfo: { fontSize: 14, color: COLORS.gray[500], marginBottom: 8 },
  notePreview: { fontSize: 14, color: COLORS.gray[600], textAlign: 'center', fontStyle: 'italic', marginBottom: 12 },
  editButton: { backgroundColor: '#F3F4F6', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 12, borderWidth: 1, borderColor: COLORS.gray[200] },
  editButtonText: { fontSize: 14, fontWeight: '500', color: COLORS.gray[600] },
  registerButton: { backgroundColor: COLORS.primaryDark, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  registerButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  futureContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', padding: 12, borderRadius: 12 },
  futureEmoji: { fontSize: 20, marginRight: 12 },
  futureText: { flex: 1, fontSize: 14, color: '#92400E' },
});