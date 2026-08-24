// src/presentation/components/EmotionWheel.jsx

import React, { useRef, useEffect, JSX } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageSourcePropType,
  Animated,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { COLORS, EMOCIONES } from '../../../../constants/colors';
import { EmotionData } from './ConfirmationPanel';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.76;
const RADIUS = WHEEL_SIZE / 2 - 3;
const SEGMENT_ANGLE = 360 / EMOCIONES.length;
const IMAGE_SIZE = 72;

// BASE_ANGLE = 90° para que el selector empiece apuntando a la derecha
const BASE_ANGLE = 90;

export interface EmotionItem {
  id: string;
  label: string;
  color: string;
  image?: ImageSourcePropType;
  emoji: string;
}

export interface EmotionWheelProps {
  selectedEmotion: EmotionData | null;
  onSelectEmotion: (emotion: EmotionData) => void;
}

// Ángulos de las emociones (desplazados por BASE_ANGLE)
const EMOCION_ANGLES: Record<string, number>= {
  feliz: BASE_ANGLE + 269,     // 90°
  calma: BASE_ANGLE + 60,    // 150°
  neutral: BASE_ANGLE + 40, // 210°
  triste: BASE_ANGLE + 89,  // 270°
  molesto: BASE_ANGLE + 135, // 330°
  ansioso: BASE_ANGLE + 220, // 390° → 30° (normalizado)
};

// Normalizar ángulo a 0-360
const normalizeAngle = (angle: number) : number => {
  return ((angle % 360) + 360) % 360;
};

export default function EmotionWheel({ 
  selectedEmotion, 
  onSelectEmotion 
}: EmotionWheelProps): JSX.Element {
  const spinValue = useRef<Animated.Value>(new Animated.Value(BASE_ANGLE)).current;
  const currentAngle = useRef<number>(BASE_ANGLE);
  const isAnimating = useRef<boolean>(false);

  const getPosition = (index: number): { x: number; y: number }  => {
    const angle = index * SEGMENT_ANGLE - 90;
    const radian = (angle * Math.PI) / 180;
    return {
      x: RADIUS * Math.cos(radian),
      y: -RADIUS * Math.sin(radian),
    };
  };

  const getEmotionAngle = (emotionId: string): number => {
    return EMOCION_ANGLES[emotionId] || BASE_ANGLE;
  };

  const animateToEmotion = (emotionId: string): void => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const targetAngle = getEmotionAngle(emotionId);
    
    // Calcular la diferencia en sentido horario
    let diff = targetAngle - currentAngle.current;
    while (diff < 0) {
      diff += 360;
    }

    // Si la diferencia es 0, forzar una vuelta completa (360°)
    // para que la animación siempre se vea
    if (diff === 0) {
      diff = 360;
    }

    const finalAngle = currentAngle.current + diff;

    Animated.timing(spinValue, {
      toValue: finalAngle,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      currentAngle.current = finalAngle;
      isAnimating.current = false;
    });
  };

  useEffect(() => {
    if (selectedEmotion) {
      animateToEmotion(selectedEmotion.id);
    }
  }, [selectedEmotion]);

  const rotate = spinValue.interpolate({
    inputRange: [0, 360, 720, 1080, 1440, 1800, 2160],
    outputRange: ['0deg', '360deg', '720deg', '1080deg', '1440deg', '1800deg', '2160deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.wheelWrapper}>
        <View style={styles.wheelContainer}>
          {EMOCIONES.map((emotion, index) => {
            const pos = getPosition(index);
            const isSelected = selectedEmotion?.id === emotion.id;
            return (
              <TouchableOpacity
                key={emotion.id}
                style={[
                  styles.emotionItem,
                  {
                    transform: [
                      { translateX: pos.x },
                      { translateY: pos.y },
                    ],
                  },
                ]}
                onPress={() => {
                  if (onSelectEmotion && !isAnimating.current) {
                    onSelectEmotion(emotion);
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.imageWrapper,
                  isSelected && styles.imageWrapperSelected,
                ]}>
                  <Image
                    source={emotion.image}
                    style={styles.emotionImage}
                    resizeMode="contain"
                  />
                </View>
                <Text
                  style={[
                    styles.emotionLabel,
                    { color: emotion.color },
                    isSelected && styles.emotionLabelSelected,
                  ]}
                >
                  {emotion.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Animated.View
          style={[
            styles.selectorContainer,
            { transform: [{ rotate }] },
          ]}
        >
          <View style={styles.selectorPointerContainer}>
            <View style={styles.selectorPointer} />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  wheelWrapper: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelContainer: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    backgroundColor: COLORS.secondary,
    borderWidth: 4,
    borderColor: COLORS.secondaryDark,
    position: 'relative',
  },
  emotionItem: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    left: WHEEL_SIZE / 2 - IMAGE_SIZE / 2,
    top: WHEEL_SIZE / 2 - IMAGE_SIZE / 2,
    width: IMAGE_SIZE,
  },
  emotionImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
  },
  emotionImageSelected: {
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  emotionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray[600],
    textAlign: 'center',
    marginTop: 4,
    width: 60,
    marginLeft: -5,
  },
// ===== SELECTOR CENTRAL (TRIÁNGULO) =====
  selectorContainer: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    top: WHEEL_SIZE / 2 - 30,
    left: WHEEL_SIZE / 2 - 30,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  selectorPointerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  selectorPointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: 18,
    borderRightWidth: 18,
    borderBottomWidth: 50,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.white,
    position: 'absolute',
    top: -5,
    alignSelf: 'center',
  },
  imageWrapper: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
    overflow: 'hidden',
  },
   imageWrapperSelected: {
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  emotionLabelSelected: {
    fontWeight: '700',
  },

}); 