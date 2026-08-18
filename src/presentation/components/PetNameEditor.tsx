import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PetNameEditorProps {
  name: string;
  onSave: (newName: string) => void;
}

export function PetNameEditor({ name, onSave }: PetNameEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  const handleSave = () => {
    const trimmed = draft.trim();
    if (trimmed.length > 0) {
      onSave(trimmed);
    } else {
      setDraft(name);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <View style={styles.pill}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          autoFocus
          maxLength={20}
          onSubmitEditing={handleSave}
        />
        <TouchableOpacity onPress={handleSave}>
          <Ionicons name="checkmark" size={20} color="#4CAF50" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.pill}>
      <Text style={styles.name}>{name}</Text>
      <TouchableOpacity
        onPress={() => {
          setDraft(name);
          setEditing(true);
        }}
      >
        <Ionicons name="pencil" size={16} color="#9E9E9E" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  name: { fontSize: 16, fontWeight: 'bold', color: 'rgba(0,0,0,0.87)', marginRight: 8 },
  input: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(0,0,0,0.87)',
    marginRight: 8,
    minWidth: 100,
    padding: 0,
  },
});