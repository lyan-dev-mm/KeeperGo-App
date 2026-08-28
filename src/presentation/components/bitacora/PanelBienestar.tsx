
import React, { useState, useRef, JSX } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { COLORS } from '../../../../constants/colors';
import { router } from 'expo-router';

export type NivelAlerta = 'bajo' | 'medio' | 'alto';

export interface AlertaBienestar {
  tipo: string;
  nivel: NivelAlerta;
  mensaje: string;
  sugerencia: string;
  timestamp: string;
}

export interface PanelBienestarProps {
  /** Lista de alertas de bienestar */
  alertas: AlertaBienestar[];
  /** Mensaje de resumen */
  resumen?: string;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.78;
const CARD_MARGIN = 12;
const ITEM_WIDTH = CARD_WIDTH + CARD_MARGIN * 2;

export default function PanelBienestar({
  alertas,
  resumen,
}: PanelBienestarProps): JSX.Element | null {
  const [expandido, setExpandido] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const flatListRef = useRef<FlatList<AlertaBienestar>>(null);

  // Si no hay alertas, no renderizar
  if (!alertas || alertas.length === 0) {
    return null;
  }

  const niveles = alertas.map((a) => a.nivel);
  const tieneAlta = niveles.includes('alto');
  const tieneMedia = niveles.includes('medio');

  const getEmoji = (): string => {
    if (tieneAlta) return '🌱';
    if (tieneMedia) return '🌿';
    return '🌸';
  };

  const getEstado = (): string => {
    if (tieneAlta) return 'priorizado';
    if (tieneMedia) return 'activo';
    return 'tranquilo';
  };

  const getColorByLevel = (nivel: NivelAlerta): string => {
    switch (nivel) {
      case 'bajo':
        return '#A0ED85';
      case 'medio':
        return '#FCD34D';
      case 'alto':
        return '#F59E0B';
      default:
        return COLORS.gray[300];
    }
  };

  const getNivelTexto = (nivel: NivelAlerta): string => {
    switch (nivel) {
      case 'bajo':
        return 'Seguimiento';
      case 'medio':
        return 'Acompañamiento';
      case 'alto':
        return 'Atención';
      default:
        return 'Información';
    }
  };

  const scrollToIndex = (index: number): void => {
    if (!flatListRef.current) return;

    const paddingOffset = 8;
    const offset = index * ITEM_WIDTH + paddingOffset;

    flatListRef.current.scrollToOffset({
      offset: offset,
      animated: true,
    });
  };

  const goToNext = (): void => {
    if (currentIndex < alertas.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollToIndex(nextIndex);
    }
  };

  const goToPrevious = (): void => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      scrollToIndex(prevIndex);
    }
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const paddingOffset = 8;
    const index = Math.round((offsetX - paddingOffset) / ITEM_WIDTH);
    const clampedIndex = Math.max(0, Math.min(index, alertas.length - 1));
    if (clampedIndex !== currentIndex) {
      setCurrentIndex(clampedIndex);
    }
  };

  const renderAlertaCard = ({
    item,
    index,
  }: {
    item: AlertaBienestar;
    index: number;
  }): JSX.Element => {
    return (
      <View style={[styles.card, { borderColor: getColorByLevel(item.nivel) }]}>
        <View style={styles.cardHeader}>
          <View
            style={[styles.levelBadge, { backgroundColor: getColorByLevel(item.nivel) }]}
          >
            <Text style={styles.levelBadgeText}>{getNivelTexto(item.nivel)}</Text>
          </View>
          <Text style={styles.cardIndex}>
            {index + 1}/{alertas.length}
          </Text>
        </View>

        <Text style={styles.cardMessage}>{item.mensaje}</Text>

        {item.sugerencia && (
          <View style={styles.cardSuggestion}>
            <Text style={styles.suggestionLabel}>💡 Sugerencia</Text>
            <Text style={styles.suggestionText}>{item.sugerencia}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderProgressIndicator = (): JSX.Element => (
    <View style={styles.progressContainer}>
      {alertas.map((_, index) => (
        <View
          key={index}
          style={[
            styles.progressDot,
            index === currentIndex && styles.progressDotActive,
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpandido(!expandido)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.iconEmoji}>{getEmoji()}</Text>
          <View>
            <Text style={styles.headerTitle}>Acompañamiento emocional</Text>
            <Text style={styles.headerSubtitle}>
              {alertas.length} sugerencias · {getEstado()}
            </Text>
          </View>
        </View>
        <Text style={styles.headerArrow}>{expandido ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expandido && (
        <View style={styles.content}>
          <View style={styles.rahcaMessage}>
            <Text style={styles.rahcaText}>
              {resumen ||
                'He notado algunos patrones interesantes. Desliza para ver las sugerencias.'}
            </Text>
          </View>

          <View style={styles.carouselContainer}>
            <FlatList
              ref={flatListRef}
              data={alertas}
              renderItem={renderAlertaCard}
              keyExtractor={(_, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={ITEM_WIDTH}
              snapToAlignment="center"
              onScroll={onScroll}
              contentContainerStyle={styles.carouselContent}
              style={styles.carouselList}
              getItemLayout={(_, index) => ({
                length: ITEM_WIDTH,
                offset: ITEM_WIDTH * index,
                index,
              })}
              initialScrollIndex={0}
              pagingEnabled={false}
              scrollEventThrottle={16}
            />

            {renderProgressIndicator()}
          </View>


          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary]}
              onPress={() =>  router.push('/zona-relajacion')}
            >
              <Text style={styles.actionButtonText}>Zona de relajación</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={() =>  router.push('/kii-chat')}
            >
              <Text style={styles.actionButtonTextSecondary}>Hablar con Kii</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.title_black,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 2,
    fontWeight: '400',
  },
  headerArrow: {
    fontSize: 14,
    color: COLORS.gray[400],
    paddingLeft: 8,
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 16,
  },
  rahcaMessage: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 14,
  },
  rahcaText: {
    fontSize: 13,
    color: COLORS.gray[600],
    lineHeight: 20,
    fontStyle: 'normal',
    textAlign: 'left',
  },
  carouselContainer: {
    marginBottom: 12,
    position: 'relative',
  },
  carouselContent: {
    paddingHorizontal: 0,
  },
  carouselList: {
    height: 270,
  },
  card: {
    width: CARD_WIDTH,
    height: 270,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: CARD_MARGIN,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cardIndex: {
    fontSize: 12,
    color: COLORS.gray[400],
    fontWeight: '400',
  },
  cardMessage: {
    fontSize: 14,
    color: COLORS.gray[700],
    lineHeight: 20,
    marginBottom: 10,
  },
  cardSuggestion: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  suggestionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.gray[500],
    marginBottom: 2,
  },
  suggestionText: {
    fontSize: 13,
    color: COLORS.gray[600],
    lineHeight: 18,
  },

  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 6,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gray[300],
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: COLORS.primaryDark,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  actionButtonSecondary: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  actionButtonTextSecondary: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray[600],
    letterSpacing: 0.3,
  },
});