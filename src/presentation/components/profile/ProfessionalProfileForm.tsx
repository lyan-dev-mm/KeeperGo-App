import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Colors';
import { verifyCURP, VerificationStatus } from '../../../infrastructure/firebase/professionalVerificationService';
import { pickAndUploadImageToCloudinary } from '../../../infrastructure/cloudinary/cloudinaryUploadService';

interface ProfessionalProfileFormProps {
  onBack: () => void;
  onFinish: (data: any) => void;
  onStepChange: (step: number) => void;
}

export function ProfessionalProfileForm({ onBack, onFinish, onStepChange }: ProfessionalProfileFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    profName: '',
    specialty: '',
    profInfo: '',
    description: '',
    phone: '',
    licenseId: '',
    curp: '',
    photo: null as { url: string; publicId: string } | null,
    professionalVerified: false,
  });
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('not_verified');
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.profName.trim()) newErrors.profName = 'El nombre profesional es obligatorio';
    if (!formData.specialty.trim()) newErrors.specialty = 'La especialidad es obligatoria';
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
    const { photo, profName, specialty, profInfo, description, phone, licenseId, curp, professionalVerified } = formData;
    onFinish({
      profileType: 'professional',
      phone: phone || undefined,
      professionalInfo: {
        professionalName: profName,
        specialty: specialty,
        description: description,
        professionalDetails: profInfo,
        licenseNumber: licenseId,
        curp: curp,
        professionalVerified: professionalVerified
      },
      profileImage: photo
    });
  };

  const validateCURP = (curp: string) => {
    const curpRegex = /^[A-Z]{4}[0-9]{6}[H,M][A-Z]{5}[A-Z0-9]{2}$/;
    return curpRegex.test(curp.toUpperCase());
  };

  const handleVerify = async () => {
    Alert.alert(
      'Servicio no disponible',
      'La verificación automática de cédula profesional está temporalmente desactivada hasta contar con las credenciales necesarias.'
    );
    /*
    Lógica desactivada temporalmente:
    if (!formData.curp.trim()) { ... }
    ...
    */
  };

  const renderVerificationStatus = () => {
    switch (verificationStatus) {
      case 'verifying':
        return (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.statusText}>Verificando cédula...</Text>
          </View>
        );
      case 'verified':
        return (
          <View style={styles.statusContainer}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <View>
              <Text style={[styles.statusText, { color: '#4CAF50', fontWeight: 'bold' }]}>
                ✓ Cédula profesional verificada
              </Text>
              <Text style={styles.statusSubtext}>
                La CURP proporcionada tiene una cédula profesional registrada.
              </Text>
            </View>
          </View>
        );
      case 'not_found':
        return (
          <View style={styles.statusContainer}>
            <Ionicons name="warning" size={20} color="#FF9800" />
            <View>
              <Text style={[styles.statusText, { color: '#FF9800', fontWeight: 'bold' }]}>
                ⚠ No se encontró una cédula profesional
              </Text>
              <Text style={styles.statusSubtext}>
                No encontramos una cédula profesional registrada para la CURP proporcionada.
              </Text>
            </View>
          </View>
        );
      case 'error':
        return (
          <View style={styles.statusContainer}>
            <Ionicons name="close-circle" size={20} color="#F44336" />
            <Text style={[styles.statusText, { color: '#F44336' }]}>
              ✕ Ocurrió un error durante la verificación
            </Text>
          </View>
        );
      default:
        return (
          <View style={styles.statusContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#9E9E9E" />
            <Text style={styles.statusText}>Servicio de verificación desactivado temporalmente</Text>
          </View>
        );
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
      Alert.alert('Error', error.message || 'No se pudo subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  if (step === 1) {
    return (
      <View>
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
          <Text style={styles.label}>Especialidad *</Text>
          <TextInput
            style={[styles.input, errors.specialty && styles.inputError]}
            placeholder="Ej: Psicología Clínica, Nutrición"
            value={formData.specialty}
            onChangeText={(text) => setFormData({ ...formData, specialty: text })}
          />
          {errors.specialty && <Text style={styles.errorText}>{errors.specialty}</Text>}
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

        <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.buttonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.field}>
        <Text style={styles.label}>Información Profesional</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Experiencia, estudios, etc."
          value={formData.profInfo}
          onChangeText={(text) => setFormData({ ...formData, profInfo: text })}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Número de Colegiatura / Licencia</Text>
        <TextInput
          style={styles.input}
          placeholder="ID Profesional"
          value={formData.licenseId}
          onChangeText={(text) => setFormData({ ...formData, licenseId: text })}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.field}>
        <Text style={styles.label}>CURP</Text>
        <View style={styles.inputWithButton}>
          <TextInput
            style={[styles.input, { flex: 1 }, errors.curp && styles.inputError]}
            placeholder="Introduce tu CURP"
            value={formData.curp}
            onChangeText={(text) => setFormData({ ...formData, curp: text.toUpperCase() })}
            autoCapitalize="characters"
            maxLength={18}
          />
          <TouchableOpacity
            style={[
              styles.verifyButton,
              styles.disabledButton
            ]}
            onPress={handleVerify}
            disabled={true}
          >
            <Text style={styles.verifyButtonText}>Desactivado</Text>
          </TouchableOpacity>
        </View>
        {errors.curp && <Text style={styles.errorText}>{errors.curp}</Text>}
        {renderVerificationStatus()}
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
    </View>
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
  },
  disabledButton: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  statusSubtext: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    paddingRight: 20,
  },
});
