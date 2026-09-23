
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageSourcePropType
} from 'react-native';
import { COLORS } from '../../../../constants/colors';

  export interface EmotionData {
  id: string;
  label: string;
  color: string;
  emoji?: string;
  image?: ImageSourcePropType;
}

export interface ConfirmationPanelProps {
  emotion?: EmotionData | null;
  energy?: number;
  onReflect: () => void;
  onSkip: () => void;
  visible: boolean;
}

/**
 * Panel de confirmación que aparece después de seleccionar la energía
 * Pregunta si el usuario quiere reflexionar sobre su emoción
 */
export default function ConfirmationPanel({ 
  emotion, 
  energy, 
  onReflect, 
  onSkip,
  visible,
}: ConfirmationPanelProps): React.ReactElement | null {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <View style={styles.halfCircleBackground}>
            <Image 
          source={require('../../../../assets/images/kii-pensanding.png')} 
          style={styles.iconImage}
          resizeMode="contain"
        />
          </View>
        </View>
         
        <Text style={styles.title}>¿Quieres reflexionar?</Text>
        <Text style={styles.subtitle}>
          Tomarte un momento para entender mejor cómo te sientes 
          puede ayudarte a gestionar tus emociones.
        </Text>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Emoción</Text>
            <Text style={[styles.summaryValue, { color: emotion?.color }]}>
              {emotion?.label || '—'}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Energía</Text>
            <Text style={styles.summaryValue}>{energy || '—'}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
            <Text style={styles.skipButtonText}>Ahora no</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.reflectButton} onPress={onReflect}>
            <Text style={styles.reflectButtonText}>Reflexionar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  //  CONTENEDOR DEL ICONO
  iconContainer: {
    width: 80,
    height: 80,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    
    position: 'relative',
  },

  // MEDIO CÍRCULO ROSA 
  halfCircleBackground: {
    position:'absolute',
    bottom: 10,
    left: 1,
    right: 0,
    width: 85,
    height: 60, // La mitad del ancho para que sea medio círculo
    backgroundColor: '#FFA8A7', // ← Color rosa que pediste
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFA8A7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  iconImage: {
    width: 90,
    height: 90,
    marginBottom: -15,
    position:'absolute',
    left: 1,
    right: 1,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.gray[400],
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[500],
  },
  reflectButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  reflectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});