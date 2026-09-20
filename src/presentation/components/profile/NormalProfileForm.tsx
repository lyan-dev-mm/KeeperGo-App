import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Colors';
import { pickAndUploadImageToCloudinary } from '../../../infrastructure/cloudinary/cloudinaryUploadService';
import { CustomToast, ToastType } from '../common/CustomToast';

const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

interface NormalProfileFormProps {
  onBack: () => void;
  onFinish: (data: any) => void;
}

export function NormalProfileForm({ onBack, onFinish }: NormalProfileFormProps) {
  const [nombres, setNombres] = useState('');
  const [primerApellido, setPrimerApellido] = useState('');
  const [segundoApellido, setSegundoApellido] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState<{ url: string; publicId: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estado para el Toast
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ visible: true, message, type });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!nombres.trim()) newErrors.nombres = 'El nombre es obligatorio';
    if (!primerApellido.trim()) newErrors.primerApellido = 'El primer apellido es obligatorio';
    if (!segundoApellido.trim()) newErrors.segundoApellido = 'El segundo apellido es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFinish = () => {
    if (validate()) {
      onFinish({
        profileType: 'normal',
        phone: phone || undefined,
        generalInfo: {
          nombres,
          primerApellido,
          segundoApellido,
          shortDescription: bio
        },
        profileImage: photo
      });
    }
  };

  const pickImage = async () => {
    try {
      setIsUploading(true);

      // Importamos el servicio de selección para validar el formato antes de subir
      const { pickImageFromLibrary } = require('../../../infrastructure/media/imagePickerService');
      const selectedImage = await pickImageFromLibrary();

      if (!selectedImage) {
        setIsUploading(false);
        return;
      }

      // VALIDACIÓN DE FORMATO
      const mimeType = selectedImage.mimeType || '';
      if (!SUPPORTED_FORMATS.includes(mimeType.toLowerCase())) {
        showToast('Formato de imagen no soportado. Usa JPG, PNG o WEBP.', 'error');
        setIsUploading(false);
        return;
      }

      // Si el formato es correcto, procedemos a subir a Cloudinary
      const { uploadImageToCloudinary } = require('../../../infrastructure/cloudinary/cloudinaryService');
      const uploadedImage = await uploadImageToCloudinary({
        uri: selectedImage.uri,
        fileName: selectedImage.fileName,
        mimeType: selectedImage.mimeType,
      });

      if (uploadedImage) {
        setPhoto({
          url: uploadedImage.secure_url,
          publicId: uploadedImage.public_id
        });
        showToast('Imagen actualizada con éxito', 'success');
      }
    } catch (error: any) {
      showToast(error.message || 'No se pudo subir la imagen', 'error');
    } finally {
      setIsUploading(false);
    }
  };

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
          ) : photo ? (
            <Image source={{ uri: photo.url }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="camera-outline" size={40} color="#9E9E9E" />
              <Text style={styles.addPhotoText}>Agregar foto</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Nombres *</Text>
        <TextInput
          style={[styles.input, errors.nombres && styles.inputError]}
          placeholder="Tus nombres"
          value={nombres}
          onChangeText={setNombres}
        />
        {errors.nombres && <Text style={styles.errorText}>{errors.nombres}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Primer Apellido *</Text>
        <TextInput
          style={[styles.input, errors.primerApellido && styles.inputError]}
          placeholder="Tu primer apellido"
          value={primerApellido}
          onChangeText={setPrimerApellido}
        />
        {errors.primerApellido && <Text style={styles.errorText}>{errors.primerApellido}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Segundo Apellido *</Text>
        <TextInput
          style={[styles.input, errors.segundoApellido && styles.inputError]}
          placeholder="Tu segundo apellido"
          value={segundoApellido}
          onChangeText={setSegundoApellido}
        />
        {errors.segundoApellido && <Text style={styles.errorText}>{errors.segundoApellido}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Frase o descripción corta</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Algo sobre ti..."
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Número de teléfono</Text>
        <TextInput
          style={styles.input}
          placeholder="+00 000 000 000"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
        <Text style={styles.finishButtonText}>Finalizar</Text>
      </TouchableOpacity>

      <CustomToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
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
  finishButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  finishButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
