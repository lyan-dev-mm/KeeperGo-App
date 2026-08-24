import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Animated, TouchableWithoutFeedback, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PetAnimationType } from '../../domain/entities/mascota/PetEvent';

export interface InteractivePetHandle {
  play: (animation: PetAnimationType) => void;
}

export type PetStage = 'huevo' | 'polilla';

interface InteractivePetProps {
  onTap: () => void;
  size?: number;
  stage?: PetStage;
}

// Placeholder con emoji mientras no haya ilustraciones reales del diseñador.
// Cuando existan, se reemplaza este mapa por rutas de imagen (require(...) o URL)
// y el <Text> de abajo por un <Image>, sin tocar el resto del componente.
const STAGE_EMOJI: Record<PetStage, string> = {
  huevo: '🥚',
  polilla: '🦋',
};

export const InteractivePet = forwardRef<InteractivePetHandle, InteractivePetProps>(
  ({ onTap, size = 80, stage = 'huevo' }, ref) => {
    const scale = useRef(new Animated.Value(1)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const rotate = useRef(new Animated.Value(0)).current;
    const sparkleOpacity = useRef(new Animated.Value(0)).current;
    const [showSparkles, setShowSparkles] = useState(false);

    useImperativeHandle(ref, () => ({
      play: (animation: PetAnimationType) => runAnimation(animation),
    }));

    const triggerSparkles = (duration = 700) => {
      setShowSparkles(true);
      sparkleOpacity.setValue(1);
      Animated.timing(sparkleOpacity, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }).start(() => setShowSparkles(false));
    };

    const runAnimation = (animation: PetAnimationType) => {
      scale.stopAnimation();
      translateY.stopAnimation();
      rotate.stopAnimation();
      rotate.setValue(0);

      switch (animation) {
        case 'jump':
          Animated.sequence([
            Animated.timing(translateY, { toValue: -22, duration: 170, useNativeDriver: true }),
            Animated.spring(translateY, { toValue: 0, friction: 4, useNativeDriver: true }),
          ]).start();
          break;

        case 'spin':
          Animated.timing(rotate, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start(() => rotate.setValue(0));
          break;

        case 'wiggle':
          Animated.sequence([
            Animated.timing(rotate, { toValue: -0.06, duration: 90, useNativeDriver: true }),
            Animated.timing(rotate, { toValue: 0.06, duration: 90, useNativeDriver: true }),
            Animated.timing(rotate, { toValue: -0.04, duration: 90, useNativeDriver: true }),
            Animated.timing(rotate, { toValue: 0, duration: 90, useNativeDriver: true }),
          ]).start();
          break;

        case 'bounce':
          Animated.sequence([
            Animated.timing(scale, { toValue: 1.15, duration: 110, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 0.95, duration: 90, useNativeDriver: true }),
            Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }),
          ]).start();
          break;

        case 'pulse':
          Animated.sequence([
            Animated.timing(scale, { toValue: 1.2, duration: 220, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1, duration: 220, useNativeDriver: true }),
          ]).start();
          break;

        case 'wave':
          Animated.sequence([
            Animated.timing(rotate, { toValue: 0.09, duration: 140, useNativeDriver: true }),
            Animated.timing(rotate, { toValue: -0.09, duration: 140, useNativeDriver: true }),
            Animated.timing(rotate, { toValue: 0.05, duration: 140, useNativeDriver: true }),
            Animated.timing(rotate, { toValue: 0, duration: 140, useNativeDriver: true }),
          ]).start();
          break;

        case 'celebrate':
          triggerSparkles();
          Animated.sequence([
            Animated.parallel([
              Animated.timing(translateY, { toValue: -16, duration: 160, useNativeDriver: true }),
              Animated.timing(scale, { toValue: 1.15, duration: 160, useNativeDriver: true }),
            ]),
            Animated.parallel([
              Animated.spring(translateY, { toValue: 0, friction: 4, useNativeDriver: true }),
              Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
            ]),
          ]).start();
          break;

        case 'reward':
          triggerSparkles(800);
          Animated.sequence([
            Animated.timing(scale, { toValue: 1.25, duration: 180, useNativeDriver: true }),
            Animated.timing(rotate, { toValue: 0.05, duration: 90, useNativeDriver: true }),
            Animated.timing(rotate, { toValue: -0.05, duration: 90, useNativeDriver: true }),
            Animated.spring(rotate, { toValue: 0, friction: 3, useNativeDriver: true }),
            Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }),
          ]).start();
          break;

        case 'levelUp':
          triggerSparkles(1000);
          Animated.sequence([
            Animated.parallel([
              Animated.timing(scale, { toValue: 1.4, duration: 300, useNativeDriver: true }),
              Animated.timing(translateY, { toValue: -26, duration: 300, useNativeDriver: true }),
              Animated.timing(rotate, { toValue: 1, duration: 500, useNativeDriver: true }),
            ]),
            Animated.parallel([
              Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }),
              Animated.spring(translateY, { toValue: 0, friction: 3, useNativeDriver: true }),
            ]),
          ]).start(() => rotate.setValue(0));
          break;
      }
    };

    const rotateInterpolated = rotate.interpolate({
      inputRange: [-1, 1],
      outputRange: ['-360deg', '360deg'],
    });

    return (
      <TouchableWithoutFeedback onPress={onTap}>
        <View style={[styles.wrapper, { width: size * 1.6, height: size * 1.6 }]}>
          {showSparkles && (
            <Animated.View style={[styles.sparkleContainer, { opacity: sparkleOpacity }]}>
              <Ionicons name="sparkles" size={size * 0.35} color="#FFD54F" style={styles.sparkleTopLeft} />
              <Ionicons name="sparkles" size={size * 0.25} color="#81C784" style={styles.sparkleTopRight} />
              <Ionicons name="sparkles" size={size * 0.28} color="#FFB74D" style={styles.sparkleBottom} />
            </Animated.View>
          )}
          <Animated.View
            style={{
              transform: [{ translateY }, { scale }, { rotate: rotateInterpolated }],
            }}
          >
            <Text style={{ fontSize: size }}>{STAGE_EMOJI[stage]}</Text>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
);

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center' },
  sparkleContainer: { ...StyleSheet.absoluteFillObject },
  sparkleTopLeft: { position: 'absolute', top: 4, left: 6 },
  sparkleTopRight: { position: 'absolute', top: 10, right: 4 },
  sparkleBottom: { position: 'absolute', bottom: 6, alignSelf: 'center' },
});