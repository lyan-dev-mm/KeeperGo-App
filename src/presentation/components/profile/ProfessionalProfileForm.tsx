import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Colors';
import { pickAndUploadImageToCloudinary } from '../../../infrastructure/cloudinary/cloudinaryUploadService';
import { datosNonStopService, ProfessionalData } from '../../../infrastructure/api/datosNonStopService';
import { CustomToast } from '../common/CustomToast';
import { useToast } from '../../hooks/useToast';

interface ProfessionalProfileFormProps {
  onBack: () => void;
  onFinish: (data: any) => void;
  onStepChange: (step: number) => void;
}

export function ProfessionalProfileForm({ onBack, onFinish, onStepChange }: ProfessionalProfileFormProps) {
  const [step, setStep] = useState(1);
  const { toastConfig, showToast, hideToast } = useToast();
  const [formData, setFormData] = useState({
    profName: '',
    specialty: '', // Profesión
    carrera: '',
    profInfo: '',
    description: '',
    phone: '',
    email: '',
    curp: '', // Número de Cédula
    photo: null as { url: string; publicId: string } | null,
    professionalVerified: false,
    institucion: '',
    nivelEducativo: '',
    areaConocimiento: '',
    subareaConocimiento: '',
  });

  const [verificationStatus, setVerificationStatus] = useState<'not_verified' | 'verifying' | 'verified' | 'not_found' | 'error'>('not_verified');
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.profName.trim()) newErrors.profName = 'El nombre profesional es obligatorio';
    if (!formData.email.trim()) {
      newErrors.email = 'Ingresa tu correo electrónico.';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
      onStepChange(2);
    }
  };

  const handleFinish = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.specialty.trim()) newErrors.specialty = 'La profesión es obligatoria';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Por favor, completa los campos obligatorios.', 'error');
      return;
    }

    onFinish({
      profileType: 'professional',
      phone: formData.phone || undefined,
      email: formData.email,
      professionalInfo: {
        professionalName: formData.profName,
        specialty: formData.specialty,
        carrera: formData.carrera,
        description: formData.description,
        professionalDetails: formData.profInfo,
        curp: formData.curp,
        professionalVerified: formData.professionalVerified,
        institucion: formData.institucion,
        academicDetails: {
          nivelEducativo: formData.nivelEducativo,
          areaConocimiento: formData.areaConocimiento,
          subareaConocimiento: formData.subareaConocimiento,
        }
      },
      profileImage: formData.photo
    });
  };

  const handleVerify = async () => {
    if (!formData.curp.trim()) {
      setErrors({ ...errors, curp: 'Ingresa un número de cédula' });
      return;
    }

    setVerificationStatus('verifying');
    setErrors({ ...errors, curp: '' });

    const result = await datosNonStopService.verifyLicense(formData.curp);

    if (result.status === 'found' && result.data) {
      setVerificationStatus('verified');
      setFormData(prev => ({
        ...prev,
        specialty: result.data!.profesion,
        carrera: result.data!.carrera,
        institucion: result.data!.institucion,
        nivelEducativo: result.data!.nivelEducativo,
        areaConocimiento: result.data!.areaConocimiento,
        subareaConocimiento: result.data!.subareaConocimiento,
        professionalVerified: true,
      }));
      showToast('La cédula profesional fue verificada correctamente. Los datos han sido cargados.', 'success');
    } else if (result.status === 'not_found') {
      setVerificationStatus('not_found');
      showToast(result.message || 'No se encontró información asociada a esta cédula.', 'error');
    } else {
      setVerificationStatus('error');
      showToast(result.message || 'Error al verificar la cédula.', 'error');
    }
  };

  const renderVerificationStatus = () => {
    switch (verificationStatus) {
      case 'verifying':
        return (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.statusText}>Consultando API de Cédulas...</Text>
          </View>
        );
      case 'verified':
        return (
          <View style={styles.statusContainer}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={[styles.statusText, { color: '#4CAF50', fontWeight: 'bold' }]}>
              Verificada correctamente
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  const pickImage = async () => {
    try {
      setIsUploading(true);
      const uploadedImage = await pickAndUploadImageToCloudinary();

      if (uploadedImage) {
        setFormData({
          ...formData,
          photo: {
            url: uploadedImage.secure_url,
            publicId: uploadedImage.public_id
          }
        });
      }
    } catch (error: any) {
      showToast(error.message || 'No se pudo subir la imagen', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  if (step === 1) {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.photoContainer}>
            <TouchableOpacity
              style={styles.photoCircle}
              onPress={pickImage}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="large" color={Colors.primary} />
              ) : formData.photo ? (
                <Image source={{ uri: formData.photo.url }} style={styles.image} />
              ) : (
                <View style={styles.placeholder}>
                  <Ionicons name="camera-outline" size={40} color="#9E9E9E" />
                  <Text style={styles.addPhotoText}>Agregar foto</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Nombre Profesional *</Text>
            <TextInput
              style={[styles.input, errors.profName && styles.inputError]}
              placeholder="Dr. Nombre Apellido"
              value={formData.profName}
              onChangeText={(text) => setFormData({ ...formData, profName: text })}
            />
            {errors.profName && <Text style={styles.errorText}>{errors.profName}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Descripción General</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Breve descripción de tu práctica..."
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Número de teléfono</Text>
            <TextInput
              style={styles.input}
              placeholder="+00 000 000 000"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Correo electrónico *</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
            <Text style={styles.buttonText}>Continuar</Text>
          </TouchableOpacity>
        </ScrollView>
        <CustomToast {...toastConfig} onHide={hideToast} />
      </View>
    );
  }

  const isVerified = verificationStatus === 'verified';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.field}>
          <Text style={styles.label}>Número de Cédula</Text>
          <View style={styles.inputWithButton}>
            <TextInput
              style={[styles.input, { flex: 1 }, errors.curp && styles.inputError]}
              placeholder="Introduce tu número de cédula profesional"
              value={formData.curp}
              onChangeText={(text) => setFormData({ ...formData, curp: text.toUpperCase() })}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[
                styles.verifyButton,
                verificationStatus === 'verifying' && styles.disabledButton
              ]}
              onPress={handleVerify}
              disabled={verificationStatus === 'verifying'}
            >
              {verificationStatus === 'verifying' ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.verifyButtonText}>Verificar</Text>
              )}
            </TouchableOpacity>
          </View>
          {errors.curp && <Text style={styles.errorText}>{errors.curp}</Text>}
          {renderVerificationStatus()}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Profesión *</Text>
          <TextInput
            style={[
              styles.input,
              errors.specialty && styles.inputError,
              styles.disabledInput
            ]}
            placeholder="Se llenará al verificar la cédula"
            value={formData.specialty}
            editable={false}
          />
          {errors.specialty && <Text style={styles.errorText}>{errors.specialty}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Carrera</Text>
          <TextInput
            style={[
              styles.input,
              styles.disabledInput
            ]}
            placeholder="Se llenará al verificar la cédula"
            value={formData.carrera}
            editable={false}
          />
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Institución</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Institución</Text>
          <TextInput
            style={[
              styles.input,
              styles.disabledInput
            ]}
            placeholder="Se llenará al verificar la cédula"
            value={formData.institucion}
            editable={false}
          />
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Información Profesional</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Nivel educativo</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={formData.nivelEducativo}
            editable={false}
            placeholder="Se llenará al verificar la cédula"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Área de conocimiento</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={formData.areaConocimiento}
            editable={false}
            placeholder="Se llenará al verificar la cédula"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Subárea de conocimiento</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={formData.subareaConocimiento}
            editable={false}
            placeholder="Se llenará al verificar la cédula"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Experiencia y detalles adicionales</Text>
          <TextInput
            style={[styles.input, styles.largeTextArea]}
            placeholder="Experiencia, estudios, etc."
            value={formData.profInfo}
            onChangeText={(text) => setFormData({ ...formData, profInfo: text })}
            multiline
            numberOfLines={6}
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => { setStep(1); onStepChange(1); }}
          >
            <Text style={styles.secondaryButtonText}>Atrás</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={handleFinish}>
            <Text style={styles.buttonText}>Finalizar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <CustomToast {...toastConfig} onHide={hideToast} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  photoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  photoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 4,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: Colors.error,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  largeTextArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    flex: 0.4,
  },
  secondaryButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primaryDark || '#5AC155',
    marginBottom: 15,
  },
  inputWithButton: {
    flexDirection: 'row',
    gap: 8,
  },
  verifyButton: {
    backgroundColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledInput: {
    backgroundColor: '#F0F0F0',
    color: '#9E9E9E',
    opacity: 0.7,
  },
  verifyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
});
