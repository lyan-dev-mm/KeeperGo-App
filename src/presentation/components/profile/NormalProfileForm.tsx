import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../constants/colors';
import { pickAndUploadImageToCloudinary } from '../../../infrastructure/cloudinary/cloudinaryUploadService';

interface NormalProfileFormProps {
  onBack: () => void;
  onFinish: (data: any) => void;
}

export function NormalProfileForm({ onBack, onFinish }: NormalProfileFormProps) {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState<{ url: string; publicId: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!username.trim()) newErrors.username = 'El nombre de usuario es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFinish = () => {
    if (validate()) {
      onFinish({
        profileType: 'normal',
        phone: phone || undefined,
        generalInfo: {
          username,
          shortDescription: bio
        },
        profileImage: photo
      });
    }
  };

  const pickImage = async () => {
    try {
      setIsUploading(true);
      const uploadedImage = await pickAndUploadImageToCloudinary();

      if (uploadedImage) {
        setPhoto({
          url: uploadedImage.secure_url,
          publicId: uploadedImage.public_id
        });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo subir la imagen');
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
        <Text style={styles.label}>Nombre de usuario *</Text>
        <TextInput
          style={[styles.input, errors.username && styles.inputError]}
          placeholder="@ejemplo"
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
