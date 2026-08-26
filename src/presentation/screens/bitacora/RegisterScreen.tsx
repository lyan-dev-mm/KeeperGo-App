
import React, { useState, useRef, useEffect, JSX } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  StatusBar,
  Alert,
} from 'react-native';

// Componentes
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, EMOCIONES} from '../../../../constants/colors';
import EmotionWheel from '../../components/bitacora/EmotionWheel';
import IntensitySlider from '../../components/bitacora/IntensitySlider'; 
import ConfirmationPanel from '../../components/bitacora/ConfirmationPanel'; 
import ReflectionForm from '../../components/bitacora/ReflectionForm'; 
import { EmotionData } from '../../components/bitacora/ConfirmationPanel';
// Hooks
import { useBitacora } from '../../hooks/useBitacora';
import { useBitacoraStore } from '../../store/bitacoraStore';

interface EmotionType {
  id: string;
  label: string;
  color: string;
  image: any;
  emoji: string;
}

export default function RegisterScreen(): JSX.Element {
  // Obtener parámetros de navegación
  const router = useRouter();
  const params = useLocalSearchParams();
  

  const fecha = params.fecha as string | undefined;
  const registroParam = params.registro as string | undefined;
  const fechaDate: Date = fecha ? new Date(fecha) : new Date();
  const registroExistente = registroParam ? JSON.parse(registroParam) : null;
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [step, setStep] = useState<'emotion' | 'energy' | 'reflection'>('emotion');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionData | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<number>(5);
  const [note, setNote] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const hasLoaded = useRef(false);

  const { saveRegistro } = useBitacoraStore();

  useEffect(() => {
    if (registroExistente && !hasLoaded.current) {
      const emotion = EMOCIONES.find((e: EmotionData) => e.id === registroExistente.emocion);
      if (emotion) {
        setSelectedEmotion(emotion);
        setSelectedEnergy(registroExistente.energia || 5);
        setNote(registroExistente.nota || '');
        setStep('energy');
        hasLoaded.current = true;
      }
    }
  }, [registroExistente]);

  
  const handleSelectEmotion = (emotion: EmotionData): void => {
    setSelectedEmotion(emotion);
    setTimeout(() => {
      setStep('energy');
    }, 800);
  };

  const handleSelectEnergy = (value: number): void => {
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 5;
    console.log(' Energía seleccionada:', safeValue);
    setSelectedEnergy(safeValue); 
  };

  const handleConfirm = (): void => {
    if (!selectedEmotion || !selectedEnergy) {
      Alert.alert('', 'Por favor selecciona una emoción y nivel de energía');
      return;
    }
    setShowConfirmation(true);
  };

  const handleReflect = (): void => {
    setShowConfirmation(false);
    setStep('reflection');
  };

  const handleSkipReflection = (): void => {
    setShowConfirmation(false);
    handleSave();
  };

  const handleSaveReflection = (reflectionText: string): void => {
    setNote(reflectionText);
    handleSave(reflectionText);
  };

  const handleSave = async (reflectionText: string | null = null): Promise<void> => {
    if (!selectedEmotion || !selectedEnergy) {
      Alert.alert('⚠️', 'Por favor selecciona una emoción y nivel de energía');
      return;
    }

    setIsSaving(true);

    const selectedDate = fechaDate;

    const registroData = {
      id: registroExistente?.id || `reg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      emocion: selectedEmotion.id,
      emocionLabel: selectedEmotion.label,
      color: selectedEmotion.color,
      energia: selectedEnergy,
      energiaLabel: selectedEnergy >= 7 ? 'Alta' : selectedEnergy >= 4 ? 'Media' : 'Baja',
      nota: note.trim() || (reflectionText ? reflectionText.trim() : ''),
      fecha: fechaDate,//selectedDate,
      //id: registroExistente?.id,
    };

    
    try {
      const result = await saveRegistro(registroData);

       console.log('📊 Resultado guardado:', result); 
      
      if (result) {
        Alert.alert('¡Bien! ', '¡Emoción registrada con éxito!', [
          {
            text: 'Volver',
            onPress: () => {
              router.replace('/(tabs)/bitacora');
            },
          },
          {
            text: 'Registrar otra',
            onPress: resetForm,
            style: 'default',
          },
        ]);
      } else {
        Alert.alert('Error', 'Hubo un problema al guardar tu registro');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      Alert.alert('Error', 'Hubo un error al guardar tu registro. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = (): void => {
    setSelectedEmotion(null);
    setSelectedEnergy(5);
    setNote('');
    setStep('emotion');
    setShowConfirmation(false);
  };

  // ========== RENDER POR PASO ==========

  const renderEmotionStep = (): JSX.Element => (
    <View style={styles.stepContainer}>      
      <Text style={styles.dateText}>
        {fechaDate.toLocaleDateString('es-MX', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric' 
        }).toUpperCase()}
      </Text>
      <Text style={styles.questionText}>¿Cómo te sientes hoy?</Text>

      <EmotionWheel
        selectedEmotion={selectedEmotion}
        onSelectEmotion={handleSelectEmotion}
      />
    </View>
  );

  const renderEnergyStep = () => (
    <View style={styles.stepContainer}>    
      <Text style={styles.questionText}>La emoción de hoy es...</Text>

      {selectedEmotion && (
        <View style={styles.selectedEmotionDisplay}>
          <Image source={selectedEmotion.image} style={styles.selectedEmotionImage} />
          <Text style={[styles.selectedEmotionLabel, { color: selectedEmotion.color }]}>
            {selectedEmotion.label}
          </Text>
        </View>
      )}

      <Text style={styles.energyQuestion}>Mide el nivel de energía</Text>
      <Text style={styles.energySubtext}>(Del 1 al 10, donde 1 es bajo y 10 es alto)</Text>

      <IntensitySlider
        value={selectedEnergy} 
        onValueChange={handleSelectEnergy}
        min={1}
        max={10}
      />

      <TouchableOpacity
        style={[
          styles.continueButton,
          (!selectedEmotion || !selectedEnergy) && styles.continueButtonDisabled,
        ]}
        onPress={handleConfirm}
        disabled={!selectedEmotion || !selectedEnergy}
      > 
        <Text style={styles.continueButtonText}>
          {registroExistente ? 'Actualizar' : 'Confirmar'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ========== MAIN RENDER ==========

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.replace('/(tabs)/bitacora')} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {registroExistente ? 'Editar' : 'Registrar'}
        </Text>

         {/* Espacio vacío para centrar el título */}
        <View style={styles.headerPlaceholder} />

      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {step === 'emotion' && renderEmotionStep()}
        {step === 'energy' && renderEnergyStep()}

        {step === 'reflection' && (
          <ReflectionForm
            emotion={selectedEmotion}
            energy={selectedEnergy}
            onSave={handleSaveReflection}
            onBack={() => setStep('energy')}
          />
        )}
      </ScrollView>

      {/* Panel de confirmación */}
      <ConfirmationPanel
        visible={showConfirmation}
        emotion={selectedEmotion}
        energy={selectedEnergy}
        onReflect={handleReflect}
        onSkip={handleSkipReflection}
      />
    </SafeAreaView>
  );
}

//  ESTILOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  
  // HEADER 
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
    borderBottomColor: COLORS.gray[200],
    backgroundColor: COLORS.white,
  },

  backButton: {
    padding: 8,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  backIcon: {
    fontSize: 40, //40
    color: COLORS.primaryDark,
    fontWeight: '300',
    lineHeight: 32,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.title_black,
    marginLeft: 20,      
    flex: 1,
    textAlign: 'left',
  },

   headerPlaceholder: {
    width: 44, 
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.primaryDark,
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.gray[200],
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  progressStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gray[200],
    textAlign: 'center',
    textAlignVertical: 'center',
    color: COLORS.gray[500],
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 28,
  },
  progressStepActive: {
    backgroundColor: COLORS.primary,
    color: '#fff',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  stepContainer: {
    flex: 1,
    paddingTop: 20,
  },
  dateText: {
    fontSize: 19,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'left',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray[500],
    textAlign: 'left',
    marginBottom: 50,
  },
  selectedEmotionText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    color: COLORS.gray[600],
  },
  emotionLabel: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  noteInput: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    minHeight: 120,
    textAlignVertical: 'top',
  },
  noteHelper: {
    fontSize: 14,
    color: COLORS.gray[500],
    marginTop: 8,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  skipButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: COLORS.gray[100],
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[600],
  },
  saveButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flex: 1,
    marginLeft: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // PANTALLA DE ENERGÍA 
  selectedEmotionDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  selectedEmotionImage: {
    width: 130,
    height: 130,
    borderRadius: 40,
  },
  selectedEmotionLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  energyQuestion: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'center',
    marginTop: 16,
  },
  energySubtext: {
    fontSize: 14,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginTop: 4,
  },
  energyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 20,
  },
  energyScaleMin: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[400],
  },
  energyScaleMax: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[400],
  },
  energySlider: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  energyButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    backgroundColor: '#FFFFFF',
    minWidth: 55,
  },
  energyButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F5F3FF',
  },
  energyValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray[600],
  },
  energyValueActive: {
    color: COLORS.primary,
  },
  energyLabel: {
    fontSize: 10,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  continueButton: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 100,
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.gray[300],
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});