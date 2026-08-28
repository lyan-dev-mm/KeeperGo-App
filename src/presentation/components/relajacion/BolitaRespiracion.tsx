
import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface BolitaRespiracionProps {
  fase: 'inhalar' | 'mantener' | 'exhalar';
  color: string;
  tamañoMaximo: number;
  animatedScale: Animated.Value;
  animatedGlow: Animated.Value;
}

export default function BolitaRespiracion({
  fase,
  color,
  tamañoMaximo,
  animatedScale,
  animatedGlow,
}: BolitaRespiracionProps) {
  const getScaleInterpolation = () => {
    switch (fase) {
      case 'inhalar':
        return animatedScale.interpolate({
          inputRange: [0, 1],
          outputRange: [0.4, 1],
        });
      case 'mantener':
        return 1;
      case 'exhalar':
        return animatedScale.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.4],
        });
      default:
        return 0.4;
    }
  };

  const scale = getScaleInterpolation();

  const glowScale = animatedGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.4],
  });

  const glowOpacity = animatedGlow.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.1, 0.3, 0.1],
  });

  return (
    <View style={[styles.container, { width: tamañoMaximo, height: tamañoMaximo }]}>
      {/* Glow */}
      <Animated.View
        style={[
          styles.glow,
          {
            width: tamañoMaximo,
            height: tamañoMaximo,
            borderRadius: tamañoMaximo / 2,
            backgroundColor: color + '20',
            transform: [{ scale: glowScale }],
            opacity: glowOpacity,
          },
        ]}
      />

      {/* Bolita */}
      <Animated.View
        style={[
          styles.bolita,
          {
            width: tamañoMaximo,
            height: tamañoMaximo,
            borderRadius: tamañoMaximo / 2,
            backgroundColor: color + '40',
            borderColor: color,
            borderWidth: 4,
            transform: [{ scale }],
          },
        ]}
      >
        {/* Brillo */}
        <Animated.View
          style={[
            styles.brillo,
            {
              opacity: animatedScale.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.2, 0.5, 0.2],
              }),
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
  },
  bolita: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brillo: {
    position: 'absolute',
    top: '15%',
    left: '25%',
    width: '30%',
    height: '20%',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    opacity: 0.3,
  },
});