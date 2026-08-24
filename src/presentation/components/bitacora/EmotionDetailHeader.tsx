
import React, { JSX } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons'; 
import { COLORS } from '../../../../constants/colors';


export interface EmotionDetailHeaderProps {
  /** Título del header */
  title: string;
  /** Función para volver atrás */
  onBack: () => void;
  /** Función para editar */
  onEdit: () => void;
  /** Función para eliminar */
  onDelete: () => void;
  /** (Opcional) Mostrar botón de editar, por defecto true */
  showEdit?: boolean;
  /** (Opcional) Mostrar botón de eliminar, por defecto true */
  showDelete?: boolean;
}

export default function EmotionDetailHeader({ 
  title,                    
  onBack,                  
  onEdit,                   
  onDelete,    
  showEdit = true,
  showDelete = true,           
}: EmotionDetailHeaderProps): JSX.Element {
  return (
    <View style={styles.header}>

      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backIcon}>‹</Text>
      </TouchableOpacity>

      <Text style={styles.headerTitle}>{title}</Text>

       <View style={styles.headerActions}>
         <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
          <Feather name="edit-2" size={20} color={COLORS.gray[400]} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
          <Feather name="trash-2" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
    //borderBottomWidth: 1,
    //borderBottomColor: COLORS.gray[200],
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: 8,
    minWidth: 44,
  },
  backIcon: {
    fontSize: 40,
    color: COLORS.primaryDark,
    fontWeight: '300',
    lineHeight: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.title_black,
    flex: 1,
    textAlign: 'center',
  },
   headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    minWidth: 36,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 20,
  },
  editToggleButton: {
    padding: 8,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editToggleText: {
    fontSize: 22,
  },
});