import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { CommunityRepositoryImpl } from '../../../data/repositories/comunidad/CommunityRepositoryImpl';
import { CreateCommunityUseCase } from '../../../domain/usecases/comunidad/CreateCommunityUseCase';
import { CommunityRule, CommunityVisibility } from '../../../domain/entities/comunidad/Community';
import AddRuleModal from '../../components/AddRuleModal';

const COLOR_PALETTE = ['#FF8FAB', '#20B2AA', '#FFD700', '#9370DB', '#FFA07A', '#B8C0FF', '#98F59C'];

const communityRepository = new CommunityRepositoryImpl();
const createCommunityUseCase = new CreateCommunityUseCase(communityRepository);

export default function CreateCommunityScreen() {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<CommunityVisibility>('public');
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [rules, setRules] = useState<CommunityRule[]>([]);
  const [isRuleModalVisible, setIsRuleModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddRule = (rule: CommunityRule) => {
    setRules((prev) => [...prev, rule]);
  };

  const handleRemoveRule = (index: number) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Falta el nombre', 'Ponle un nombre a tu comunidad antes de crearla.');
      return;
    }
    if (!user?.id) {
      Alert.alert('Error', 'Debes iniciar sesión para crear una comunidad.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newCommunityId = await createCommunityUseCase.execute(
        {
          name: name.trim(),
          description: description.trim(),
          visibility,
          color: selectedColor,
          coverImage: null,   // Sin imagen, solo color
          rules,
        },
        user.id
      );

      router.replace({
        pathname: '/(tabs)/community-detail',
        params: { id: newCommunityId },
      });
    } catch (error) {
      Alert.alert(
        'No se pudo crear la comunidad',
        error instanceof Error ? error.message : 'Intenta de nuevo en un momento.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#4A3E38" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear comunidad</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* --- VISTA PREVIA DE PORTADA --- */}
        <View style={[styles.coverPreview, { backgroundColor: selectedColor }]}>
          <Ionicons name="people" size={50} color="#FFFFFF" />
        </View>

        {/* --- COLOR DE RESPALDO --- */}
        <Text style={styles.sectionLabel}>Color del grupo</Text>
        <View style={styles.colorRow}>
          {COLOR_PALETTE.map((colorOption) => (
            <TouchableOpacity
              key={colorOption}
              style={[
                styles.colorSwatch,
                { backgroundColor: colorOption },
                selectedColor === colorOption && styles.colorSwatchSelected,
              ]}
              onPress={() => setSelectedColor(colorOption)}
            />
          ))}
        </View>

        {/* --- NOMBRE --- */}
        <Text style={styles.sectionLabel}>Nombre</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ej. Lectores del mundo"
          placeholderTextColor="#B0B0B0"
        />

        {/* --- DESCRIPCIÓN --- */}
        <Text style={styles.sectionLabel}>¿De qué va a tratar?</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Cuéntale a la gente de qué trata tu comunidad..."
          placeholderTextColor="#B0B0B0"
          multiline
        />

        {/* --- TIPO DE COMUNIDAD --- */}
        <Text style={styles.sectionLabel}>Tipo de comunidad</Text>
        <View style={styles.visibilityRow}>
          <TouchableOpacity
            style={[styles.visibilityChip, visibility === 'public' && styles.visibilityChipActive]}
            onPress={() => setVisibility('public')}
          >
            <Ionicons
              name="earth-outline"
              size={16}
              color={visibility === 'public' ? '#333333' : '#8A8A8A'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.visibilityText, visibility === 'public' && styles.visibilityTextActive]}>
              Libre
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.visibilityChip, visibility === 'private' && styles.visibilityChipActive]}
            onPress={() => setVisibility('private')}
          >
            <Ionicons
              name="lock-closed-outline"
              size={16}
              color={visibility === 'private' ? '#333333' : '#8A8A8A'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.visibilityText, visibility === 'private' && styles.visibilityTextActive]}>
              Privada
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.visibilityHint}>
          {visibility === 'public'
            ? 'Cualquiera podrá unirse de inmediato con el botón "Unirme".'
            : 'La gente tendrá que enviar una solicitud y tú decides si la aceptas.'}
        </Text>

        {/* --- REGLAS --- */}
        <Text style={styles.sectionLabel}>Reglas del grupo</Text>
        {rules.length === 0 ? (
          <Text style={styles.emptyRulesText}>Aún no agregas ninguna regla.</Text>
        ) : (
          <View style={styles.rulesList}>
            {rules.map((rule, index) => (
              <View key={`${rule.title}-${index}`} style={styles.ruleRow}>
                <View style={styles.ruleIconContainer}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#58C759" />
                </View>
                <View style={styles.ruleTextContainer}>
                  <Text style={styles.ruleTitle}>{rule.title}</Text>
                  {!!rule.description && <Text style={styles.ruleDescription}>{rule.description}</Text>}
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveRule(index)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={16} color="#C7C7C7" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.addRuleButton}
          onPress={() => setIsRuleModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={18} color="#58C759" />
          <Text style={styles.addRuleButtonText}>Agregar regla</Text>
        </TouchableOpacity>

        {/* --- BOTÓN CREAR --- */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Crear comunidad</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <AddRuleModal
        visible={isRuleModalVisible}
        onClose={() => setIsRuleModalVisible(false)}
        onSave={handleAddRule}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A3E38' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60 },
  coverPreview: {
    height: 150,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
    marginTop: 6,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    marginBottom: 8,
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: '#4A3E38',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 20,
  },
  inputMultiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  visibilityRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  visibilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 12,
  },
  visibilityChipActive: {
    backgroundColor: '#98F59C',
  },
  visibilityText: {
    color: '#8A8A8A',
    fontWeight: '600',
    fontSize: 13,
  },
  visibilityTextActive: {
    color: '#333333',
  },
  visibilityHint: {
    fontSize: 12,
    color: '#A0A0A0',
    marginBottom: 20,
  },
  emptyRulesText: {
    fontSize: 13,
    color: '#A0A0A0',
    marginBottom: 15,
  },
  rulesList: {
    marginBottom: 10,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  ruleIconContainer: {
    marginRight: 10,
    marginTop: 2,
  },
  ruleTextContainer: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  ruleDescription: {
    fontSize: 12,
    color: '#8A8A8A',
    lineHeight: 17,
  },
  addRuleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#58C759',
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 30,
  },
  addRuleButtonText: {
    color: '#58C759',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 6,
  },
  submitButton: {
    backgroundColor: '#58C759',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#A8DDA8',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});