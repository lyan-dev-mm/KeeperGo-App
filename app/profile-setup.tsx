import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { ProfileFormContainer } from '../src/presentation/components/profile/ProfileFormContainer';
import { NormalProfileForm } from '../src/presentation/components/profile/NormalProfileForm';
import { ProfessionalProfileForm } from '../src/presentation/components/profile/ProfessionalProfileForm';
import { InstitutionProfileForm } from '../src/presentation/components/profile/InstitutionProfileForm';
import { saveUserProfile } from '../src/infrastructure/firebase/userProfileService';

type ProfileType = 'user' | 'professional' | 'institution';

const ProfileSetupScreen = () => {
  const { type } = useLocalSearchParams<{ type: ProfileType }>();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const getSteps = () => {
    switch (type) {
      case 'user': return 1;
      case 'professional': return 2;
      case 'institution': return 3;
      default: return 1;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'user': return 'Perfil de Usuario';
      case 'professional': return 'Perfil Profesional';
      case 'institution': return 'Perfil Institucional';
      default: return 'Personalización';
    }
  };

  const handleFinish = async (data: any) => {
    try {
      setIsSaving(true);
      await saveUserProfile(data);

      Alert.alert(
        '¡Perfil guardado!',
        'Tu información se ha actualizado correctamente.',
        [{ text: 'Continuar', onPress: () => router.replace('/(tabs)/home') }]
      );
    } catch (error: any) {
      console.error('Error al guardar perfil:', error);
      Alert.alert('Error', error.message || 'No se pudo guardar el perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const renderForm = () => {
    switch (type) {
      case 'user':
        return (
          <NormalProfileForm
            onBack={handleBack}
            onFinish={handleFinish}
          />
        );
      case 'professional':
        return (
          <ProfessionalProfileForm
            onBack={handleBack}
            onFinish={handleFinish}
            onStepChange={setCurrentStep}
          />
        );
      case 'institution':
        return (
          <InstitutionProfileForm
            onBack={handleBack}
            onFinish={handleFinish}
            onStepChange={setCurrentStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ProfileFormContainer
      title={getTitle()}
      subtitle={isSaving ? "Guardando cambios..." : "Cuéntanos más sobre ti"}
      currentStep={currentStep}
      totalSteps={getSteps()}
      onBack={handleBack}
    >
      {renderForm()}
    </ProfileFormContainer>
  );
};

export default ProfileSetupScreen;
