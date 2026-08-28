import React, { JSX } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '../../../../constants/colors';

const { height } = Dimensions.get('window');

type EjercicioItem = {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
  duracion: string;
  nivel: 'principiante' | 'intermedio' | 'avanzado';
};

export default function ZonaRelajacionScreen(): JSX.Element {
  const router = useRouter();

  const ejercicios: EjercicioItem[] = [
    {
      id: '1',
      nombre: 'Respiración 4-7-8',
      descripcion: 'Inhala 4s, mantén 7s, exhala 8s',
      color: '#D6EAF8',
      duracion: '3 min',
      nivel: 'principiante',
    },
    {
      id: '2',
      nombre: 'Respiración Diafragmática',
      descripcion: 'Respiración profunda con el diafragma',
      color: '#D5F5E3',
      duracion: '5 min',
      nivel: 'intermedio',
    },
    {
      id: '3',
      nombre: 'Respiración Cuadrada',
      descripcion: 'Inhala 4s · Mantén 4s · Exhala 4s',
      color: '#D1F2EB',
      duracion: '4 min',
      nivel: 'intermedio',
    },
    {
      id: '4',
      nombre: 'Respiración Alterna',
      descripcion: 'Alterna entre fosas nasales',
      color: '#EBDEF0',
      duracion: '6 min',
      nivel: 'avanzado',
    },
  ];

  const getNivelTexto = (nivel: string) => {
    switch (nivel) {
      case 'principiante': return 'Principiante';
      case 'intermedio': return 'Intermedio';
      case 'avanzado': return 'Avanzado';
      default: return nivel;
    }
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'principiante': return '#4CAF50';
      case 'intermedio': return '#FF9800';
      case 'avanzado': return '#F44336';
      default: return COLORS.gray[500];
    }
  };

  const handleEjercicioPress = (ejercicioId: string) => {
    console.log('Navegando a ejercicio:', ejercicioId);

    router.navigate({
        pathname: '/(modals)/EjercicioRespiracion',
        params: { ejercicioId },
      });
    };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Zona de Relajación</Text>

        <View style={styles.headerMensajeContainer}>
          <View style={styles.headerKiiContainer}>
            <Image
              source={require('../../../../assets/images/kii-relajado.png')}
              style={styles.headerKiiAvatar}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerMensajeTextContainer}>
            <Text style={styles.headerMensaje}>Tómate un momento</Text>
            <Text style={styles.headerMensajeSub} numberOfLines={2}>
              Conecta contigo mismo y encuentra tu calma interior.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardContainer}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.ejerciciosTitle}>Ejercicios</Text>

          {ejercicios.map((ejercicio) => (
            <TouchableOpacity
              key={ejercicio.id}
              style={[styles.card, { backgroundColor: ejercicio.color }]}
              onPress={() => handleEjercicioPress(ejercicio.id)}
              activeOpacity={0.7}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{ejercicio.nombre}</Text>
                  <Text style={styles.cardDescription} numberOfLines={1}>
                    {ejercicio.descripcion}
                  </Text>
                  <View style={styles.cardTags}>
                    <Text style={styles.tagText}>{ejercicio.duracion}</Text>
                    <Text style={styles.tagDot}>·</Text>
                    <Text style={[styles.tagText, { color: getNivelColor(ejercicio.nivel) }]}>
                      {getNivelTexto(ejercicio.nivel)}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: COLORS.secondary,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.title_black,
    textAlign: 'left',
    marginBottom: 12,
  },
  headerMensajeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    width: '100%',
  },
  headerKiiContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerKiiAvatar: {
    width: 140,
    height: 140,
  },
  headerMensajeTextContainer: {
    flex: 1,
    flexShrink: 1,
  },
  headerMensaje: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.title_black,
    textAlign: 'left',
  },
  headerMensajeSub: {
    fontSize: 13,
    color: COLORS.gray[500],
    marginTop: 2,
    textAlign: 'left',
    flexWrap: 'wrap',
    width: '100%',
  },
  // CONTENEDOR DE EJERCICIOS
  cardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 16,
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  ejerciciosTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.title_black,
    marginBottom: 12,
    textAlign: 'left',
  },
  // CARDS
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  cardContent: {
    flex: 1,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.title_black,
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: COLORS.gray[600],
    marginBottom: 4,
  },
  cardTags: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  tagDot: {
    fontSize: 12,
    color: COLORS.gray[400],
    marginHorizontal: 4,
  },
});