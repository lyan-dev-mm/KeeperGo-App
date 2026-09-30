import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../constants/colors';
import { pickAndUploadImageToCloudinary } from '../../../infrastructure/cloudinary/cloudinaryUploadService';
import { datosNonStopService } from '../../../infrastructure/api/datosNonStopService';

interface InstitutionProfileFormProps {
  onBack: () => void;
  onFinish: (data: any) => void;
  onStepChange: (step: number) => void;
}

export function InstitutionProfileForm({ onBack, onFinish, onStepChange }: InstitutionProfileFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    legalName: '',
    rfc: '',
    postalCode: '',
    description: '',
    address: '',
    departments: [''],
    facilities: [''],
    contactEmail: '',
    phone: '',
    serviceHours: '',
    photo: null as { url: string; publicId: string } | null,
  });

  const [verificationStatus, setVerificationStatus] = useState<
    'unverified' | 'verifying' | 'verified' | 'rejected' | 'error'
  >('unverified');

  const [verificationDetails, setVerificationDetails] = useState<{
    rfcVerified: boolean;
    legalNameVerified: boolean;
    taxAddressVerified: boolean;
    message?: string;
  }>({
    rfcVerified: false,
    legalNameVerified: false,
    taxAddressVerified: false,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFiscalFieldChange = (field: 'legalName' | 'rfc' | 'postalCode', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Si cambia un dato fiscal tras haber sido verificado, invalidar la verificación previa
    if (verificationStatus !== 'unverified') {
      setVerificationStatus('unverified');
      setVerificationDetails({
        rfcVerified: false,
        legalNameVerified: false,
        taxAddressVerified: false,
      });
    }
  };

  const validateFiscalData = () => {
    const newErrors: Record<string, string> = {};

    const normRFC = formData.rfc.trim().toUpperCase();
    if (!normRFC) {
      newErrors.rfc = 'El RFC es obligatorio para verificar la institución.';
    } else {
      const rfcRegex = /^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}$/;
      if (!rfcRegex.test(normRFC)) {
        newErrors.rfc = 'Ingresa un RFC válido (12 car. Persona Moral o 13 car. Física).';
      }
    }

    if (!formData.legalName.trim()) {
      newErrors.legalName = 'La Razón Social oficial es obligatoria para la verificación.';
    } else if (formData.legalName.trim().length < 3) {
      newErrors.legalName = 'La Razón Social debe tener al menos 3 caracteres.';
    }

    const normCP = formData.postalCode.trim();
    if (!normCP) {
      newErrors.postalCode = 'El Código Postal Fiscal es obligatorio.';
    } else if (!/^\d{5}$/.test(normCP)) {
      newErrors.postalCode = 'El Código Postal debe constar de 5 dígitos numéricos.';
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre comercial de la institución es obligatorio.';
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyInstitution = async () => {
    if (!validateFiscalData()) {
      Alert.alert('Datos Fiscales Incompletos', 'Por favor corrige los campos fiscales antes de solicitar la verificación.');
      return;
    }

    setVerificationStatus('verifying');
    setErrors(prev => ({ ...prev, rfc: '', legalName: '', postalCode: '' }));

    try {
      const result = await datosNonStopService.verifyInstitutionRFC({
        rfc: formData.rfc.trim().toUpperCase(),
        legalName: formData.legalName.trim(),
        postalCode: formData.postalCode.trim(),
      });

      if (result.status === 'verified') {
        setVerificationStatus('verified');
        setVerificationDetails({
          rfcVerified: true,
          legalNameVerified: true,
          taxAddressVerified: true,
          message: result.message,
        });
        Alert.alert('¡Verificación Exitosa!', 'La institución ha sido verificada correctamente ante el SAT.');
      } else if (result.status === 'rejected') {
        setVerificationStatus('rejected');
        setVerificationDetails({
          rfcVerified: false,
          legalNameVerified: false,
          taxAddressVerified: false,
          message: result.message,
        });
        Alert.alert('Verificación Rechazada', result.message || 'No pudimos verificar los datos fiscales de la institución.');
      } else {
        setVerificationStatus('error');
        Alert.alert('Inconveniente de Servicio', result.message || 'No fue posible consultar el servicio en este momento.');
      }
    } catch (err: any) {
      setVerificationStatus('error');
      Alert.alert('Error de Conexión', err.message || 'Error inesperado durante la verificación.');
    }
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
    const {
      photo, name, legalName, rfc, postalCode, description, address,
      departments, facilities, contactEmail, phone, serviceHours
    } = formData;

    onFinish({
      profileType: 'institution',
      profileCompleted: true,
      institutionInfo: {
        institutionName: name,
        legalName: legalName.trim() || undefined,
        rfc: rfc.trim().toUpperCase() || undefined,
        description,
        phone,
        address,
        department: departments.filter(d => d.trim() !== '').join(', '),
        facility: facilities.filter(f => f.trim() !== '').join(', '),
        email: contactEmail,
        taxAddress: postalCode.trim()
          ? {
              postalCode: postalCode.trim(),
              fullAddress: address || undefined,
            }
          : undefined,
        serviceSchedule: {
          hours: serviceHours
        },
        verification: {
          status:
            verificationStatus === 'verified'
              ? 'verified'
              : verificationStatus === 'rejected'
                ? 'rejected'
                : 'unverified',
          rfcVerified: verificationDetails.rfcVerified,
          legalNameVerified: verificationDetails.legalNameVerified,
          taxAddressVerified: verificationDetails.taxAddressVerified,
          verifiedAt:
            verificationStatus === 'verified'
              ? new Date().toISOString()
              : null,
          verificationMethod:
            verificationStatus === 'verified'
              ? 'datos_non_stop'
              : undefined,
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

  const renderVerificationStatusBox = () => {
    switch (verificationStatus) {
      case 'verifying':
        return (
          <View style={styles.statusBoxInfo}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.statusTextInfo}>Verificando RFC con Datos Non Stop / SAT...</Text>
          </View>
        );
      case 'verified':
        return (
          <View style={styles.statusBoxSuccess}>
            <View style={styles.statusRow}>
              <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
              <Text style={styles.statusTitleSuccess}>✓ Datos fiscales verificados ante el SAT</Text>
            </View>
            <Text style={styles.statusDetailText}>✓ RFC: {formData.rfc.toUpperCase()}</Text>
            <Text style={styles.statusDetailText}>✓ Razón Social: {formData.legalName}</Text>
          </View>
        );
      case 'rejected':
        return (
          <View style={styles.statusBoxWarning}>
            <View style={styles.statusRow}>
              <Ionicons name="alert-circle" size={20} color="#C62828" />
              <Text style={styles.statusTitleWarning}>Verificación No Completada</Text>
            </View>
            <Text style={styles.statusNoticeText}>
              {verificationDetails.message || 'No pudimos verificar los datos fiscales de la institución. Revisa el RFC y la información proporcionada.'}
            </Text>
          </View>
        );
      case 'error':
        return (
          <View style={styles.statusBoxWarning}>
            <View style={styles.statusRow}>
              <Ionicons name="cloud-offline" size={20} color="#E65100" />
              <Text style={[styles.statusTitleWarning, { color: '#E65100' }]}>Servicio no disponible</Text>
            </View>
            <Text style={styles.statusNoticeText}>
              No fue posible consultar el servicio de verificación en este momento. Puedes guardar tu perfil e intentarlo más tarde.
            </Text>
          </View>
        );
      default:
        return null;
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
          <Text style={styles.label}>Nombre de la Institución (Comercial) *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Nombre comercial de la institución"
            value={formData.name}
            onChangeText={(text) => {
              setFormData({ ...formData, name: text });
              if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
            }}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Identificación Fiscal (SAT)</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Razón Social Oficial *</Text>
          <TextInput
            style={[styles.input, errors.legalName && styles.inputError]}
            placeholder="Ej: Instituto Tecnológico de Chimalhuacán S.C."
            value={formData.legalName}
            onChangeText={(text) => handleFiscalFieldChange('legalName', text)}
          />
          {errors.legalName && <Text style={styles.errorText}>{errors.legalName}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>RFC *</Text>
          <TextInput
            style={[styles.input, errors.rfc && styles.inputError]}
            placeholder="Ej: ITS080811ABC (12 Moral o 13 Física)"
            value={formData.rfc}
            onChangeText={(text) => handleFiscalFieldChange('rfc', text.toUpperCase())}
            autoCapitalize="characters"
          />
          {errors.rfc && <Text style={styles.errorText}>{errors.rfc}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Código Postal Fiscal *</Text>
          <TextInput
            style={[styles.input, errors.postalCode && styles.inputError]}
            placeholder="Ej: 56330"
            value={formData.postalCode}
            onChangeText={(text) => handleFiscalFieldChange('postalCode', text)}
            keyboardType="numeric"
            maxLength={5}
          />
          {errors.postalCode && <Text style={styles.errorText}>{errors.postalCode}</Text>}
        </View>

        <TouchableOpacity
          style={[
            styles.verifyButton,
            verificationStatus === 'verifying' && styles.disabledButton
          ]}
          onPress={handleVerifyInstitution}
          disabled={verificationStatus === 'verifying'}
        >
          {verificationStatus === 'verifying' ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.verifyButtonText}>Verificar institución ante el SAT</Text>
          )}
        </TouchableOpacity>

        {renderVerificationStatusBox()}

        <View style={styles.divider} />

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
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 15 },
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
  verifyButton: {
    backgroundColor: '#333',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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
  statusBoxInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    gap: 8,
  },
  statusTextInfo: {
    fontSize: 12,
    color: '#1565C0',
  },
  statusBoxSuccess: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  statusBoxWarning: {
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusTitleSuccess: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusTitleWarning: {
    color: '#C62828',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusDetailText: {
    color: '#333333',
    fontSize: 13,
    marginTop: 4,
  },
  statusNoticeText: {
    color: '#5D4037',
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
  },
});
