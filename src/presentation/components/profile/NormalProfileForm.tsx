import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Colors';
import { pickAndUploadImageToCloudinary } from '../../../infrastructure/cloudinary/cloudinaryUploadService';
import { getUserProfile } from '../../../infrastructure/firebase/userProfileService';
import { CustomToast, ToastType } from '../common/CustomToast';

const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

interface NormalProfileFormProps {
  onBack: () => void;
  onFinish: (data: any) => void;
}

export function NormalProfileForm({ onBack, onFinish }: NormalProfileFormProps) {
  const [existingGeneralInfo, setExistingGeneralInfo] = useState<{
    nombres: string;
    primerApellido: string;
    segundoApellido: string;
  }>({ nombres: '', primerApellido: '', segundoApellido: '' });

  const [username, setUsername] = useState('');
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

  useEffect(() => {
    let isMounted = true;
    getUserProfile()
      .then((profile) => {
        if (isMounted && profile) {
          if (profile.generalInfo) {
            setExistingGeneralInfo({
              nombres: profile.generalInfo.nombres || '',
              primerApellido: profile.generalInfo.primerApellido || '',
              segundoApellido: profile.generalInfo.segundoApellido || '',
            });
            if (profile.generalInfo.username) {
              setUsername(profile.generalInfo.username);
            }
            if (profile.generalInfo.shortDescription) {
              setBio(profile.generalInfo.shortDescription);
            }
          }
          if (profile.phone) {
            setPhone(profile.phone);
          }
          if (profile.profileImage) {
            setPhoto(profile.profileImage);
          }
        }
      })
      .catch((err) => {
        console.warn('No se pudo pre-cargar el perfil existente:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (message: string, type: ToastType) => {
    setToast({ visible: true, message, type });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!username.trim()) {
      newErrors.username = 'El nombre de usuario es obligatorio';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFinish = () => {
    if (validate()) {
      onFinish({
        profileType: 'normal',
        phone: phone || undefined,
        generalInfo: {
          nombres: existingGeneralInfo.nombres,
          primerApellido: existingGeneralInfo.primerApellido,
          segundoApellido: existingGeneralInfo.segundoApellido,
          username: username.trim(),
          shortDescription: bio,
        },
        profileImage: photo,
      });
    }
  };

  const pickImage = async () => {
    try {
      setIsUploading(true);

      const { pickImageFromLibrary } = require('../../../infrastructure/media/imagePickerService');
      const selectedImage = await pickImageFromLibrary();

      if (!selectedImage) {
        setIsUploading(false);
        return;
      }

      const mimeType = selectedImage.mimeType || '';
      if (!SUPPORTED_FORMATS.includes(mimeType.toLowerCase())) {
        showToast('Formato de imagen no soportado. Usa JPG, PNG o WEBP.', 'error');
        setIsUploading(false);
        return;
      }

      const { uploadImageToCloudinary } = require('../../../infrastructure/cloudinary/cloudinaryService');
      const uploadedImage = await uploadImageToCloudinary({
        uri: selectedImage.uri,
        fileName: selectedImage.fileName,
        mimeType: selectedImage.mimeType,
      });

      if (uploadedImage) {
        setPhoto({
          url: uploadedImage.secure_url,
          publicId: uploadedImage.public_id,
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
        <Text style={styles.label}>Nombre de usuario / Alias *</Text>
        <TextInput
          style={[styles.input, errors.username && styles.inputError]}
          placeholder="Tu alias público (ej. JuanP)"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
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
