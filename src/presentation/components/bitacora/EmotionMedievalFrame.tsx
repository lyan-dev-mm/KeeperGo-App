// src/presentation/components/bitacora/EmotionMedievalFrame.jsx

import React, { JSX } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { COLORS } from '../../../../constants/colors';
import { Emocion } from '../../../domain/entities/bitacora/Emocion';

const { width } = Dimensions.get('window');

export interface EmotionMedievalFrameProps {
  emotionId: string;
  emotionLabel: string;
  color?: string;
}

export default function EmotionMedievalFrame({ 
  emotionId, 
  emotionLabel, 
  color 
}: EmotionMedievalFrameProps): JSX.Element {
  const emotionData = Emocion.getById(emotionId);
  
  return (
    <View style={styles.medievalFrame}>
      <View style={styles.medievalOuterBorder}>
        <View style={[styles.corner, styles.cornerBottomLeft]} />
        <View style={[styles.corner, styles.cornerBottomRight]} />
        
        <View style={styles.windowContent}>
          <View style={styles.emotionMainContainer}>
            <View style={[styles.emotionCircle, { backgroundColor: color || COLORS.primary }]}>
              {emotionData?.image ? (
                <Image 
                  source={emotionData.image} 
                  style={styles.emotionMainImage} 
                  resizeMode="contain" 
                />
              ) : (
                <Text style={styles.emotionMainEmoji}>{emotionData?.emoji || '😊'}</Text>
              )}
            </View>
            <Text style={styles.emotionMainLabel}>
              {emotionLabel}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  medievalFrame: {
    width: width * 0.75,
    maxWidth: 250,
    alignSelf: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  medievalOuterBorder: {
    backgroundColor: '#fcecbb', //FFF6DA
    padding: 4,
    borderWidth: 2,
    borderColor: '#eebe44',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
  },
  windowContent: {
    backgroundColor: '#FFFDF5',
    padding: 20,
    paddingVertical: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 56,
    borderTopRightRadius: 56,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    overflow: 'hidden',
  },// esto estaba comentado
  corner: { // Esquinas
    position: 'absolute',
    width: 24,
    height: 24,
    zIndex: 10,
    backgroundColor: 'transparent',
    borderColor: '#B8A080',
    borderWidth: 3,
  },
  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 10,
  },
  cornerBottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 10,
  },
  emotionMainContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emotionCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  emotionMainImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  emotionMainEmoji: {
    fontSize: 38,
  },
  emotionMainLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#514343',
    letterSpacing: 1,
  },
});