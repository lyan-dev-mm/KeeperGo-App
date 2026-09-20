import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Colors';
import { pickAndUploadImageToCloudinary } from '../../../infrastructure/cloudinary/cloudinaryUploadService';

interface InstitutionProfileFormProps {
  onBack: () => void;
  onFinish: (data: any) => void;
  onStepChange: (step: number) => void;
}

export function InstitutionProfileForm({ onBack, onFinish, onStepChange }: InstitutionProfileFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    departments: [''],
    facilities: [''],
    contactEmail: '',
    phone: '',
    serviceHours: '',
    photo: null as { url: string; publicId: string } | null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addItem = (field: 'departments' | 'facilities') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ''],
    });
  };

  const updateItem = (field: 'departments' | 'facilities', index: number, value: string) => {
    const newList = [...formData[field]];
    newList[index] = value;
    setFormData({ ...formData, [field]: newList });
  };

  const removeItem = (field: 'departments' | 'facilities', index: number) => {
    const newList = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newList });
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      onStepChange(2);
    } else if (step === 2) {
      setStep(3);
      onStepChange(3);
    }
  };

  const handleFinish = () => {
    const { photo, name, description, address, departments, facilities, contactEmail, phone, serviceHours } = formData;
    onFinish({
      profileType: 'institution',
      institutionInfo: {
        institutionName: name,
        description,
        phone,
        address,
        department: departments.filter(d => d.trim() !== '').join(', '),
        facility: facilities.filter(f => f.trim() !== '').join(', '),
        email: contactEmail,
        serviceSchedule: {
          hours: serviceHours
        }
      },
      profileImage: photo
    });
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
          <Text style={styles.label}>Nombre de la Institución *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Nombre oficial"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Misión, visión o descripción..."
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
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
          <Text style={styles.label}>Dirección</Text>
          <TextInput
            style={styles.input}
            placeholder="Dirección física"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.buttonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (step === 2) {
    return (
      <View>
        <Text style={styles.sectionTitle}>Departamentos</Text>
        {formData.departments.map((item, index) => (
          <View key={`dept-${index}`} style={styles.dynamicRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder={`Departamento ${index + 1}`}
              value={item}
              onChangeText={(text) => updateItem('departments', index, text)}
            />
            {formData.departments.length > 1 && (
              <TouchableOpacity onPress={() => removeItem('departments', index)} style={styles.removeIcon}>
                <Ionicons name="trash-outline" size={20} color={Colors.error} />
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={() => addItem('departments')}>
          <Ionicons name="add" size={20} color={Colors.primary} />
          <Text style={styles.addButtonText}>Agregar departamento</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Instalaciones</Text>
        {formData.facilities.map((item, index) => (
          <View key={`fac-${index}`} style={styles.dynamicRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder={`Instalación ${index + 1}`}
              value={item}
              onChangeText={(text) => updateItem('facilities', index, text)}
            />
            {formData.facilities.length > 1 && (
              <TouchableOpacity onPress={() => removeItem('facilities', index)} style={styles.removeIcon}>
                <Ionicons name="trash-outline" size={20} color={Colors.error} />
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={() => addItem('facilities')}>
          <Ionicons name="add" size={20} color={Colors.primary} />
          <Text style={styles.addButtonText}>Agregar instalación</Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => { setStep(1); onStepChange(1); }}
          >
            <Text style={styles.secondaryButtonText}>Atrás</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
            <Text style={styles.buttonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.field}>
        <Text style={styles.label}>Correo de Contacto</Text>
        <TextInput
          style={styles.input}
          placeholder="contacto@institucion.com"
          value={formData.contactEmail}
          onChangeText={(text) => setFormData({ ...formData, contactEmail: text })}
          keyboardType="email-address"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Horarios de atención</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Lun-Vie 9:00 AM - 6:00 PM"
          value={formData.serviceHours}
          onChangeText={(text) => setFormData({ ...formData, serviceHours: text })}
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => { setStep(2); onStepChange(2); }}
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
  field: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  inputError: { borderColor: Colors.error },
  textArea: { height: 100, textAlignVertical: 'top' },
  errorText: { color: Colors.error, fontSize: 12, marginTop: 4 },
  dynamicRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  removeIcon: { marginLeft: 10, padding: 5 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: { color: Colors.primary, fontWeight: '600', marginLeft: 4 },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    flex: 1,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    flex: 0.4,
  },
  secondaryButtonText: { color: '#666', fontWeight: '600', fontSize: 16 },
});
