
import React, { JSX } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, ENERGY_COLORS } from '../../../../constants/colors';
import { Emocion } from '../../../domain/entities/bitacora/Emocion';
import { RegistroAnimo } from '../../../domain/entities/bitacora/RegistroAnimo'

export interface DayInfoCardProps {
  registro: RegistroAnimo | null | undefined;
  fecha: Date;
  onEdit?: () => void;
  onRegister?: () => void;
  isToday?: boolean;
  isFuture?: boolean;
}

export default function DayInfoCard({ 
  registro, 
  fecha, 
  onEdit, 
  onRegister,
  isToday,
  isFuture,
}: DayInfoCardProps): JSX.Element {
  //  DÍA FUTURO 
  
  const getEnergyColor = (energia: number): string => {
    if (energia >= 8) return ENERGY_COLORS.high;
    if (energia >= 4) return ENERGY_COLORS.medium;
    return ENERGY_COLORS.low;
  };

  const getEnergyLabel = (energia: number): string => {
    if (energia >= 8) return 'Alta';
    if (energia >= 4) return 'Media';
    return 'Baja';
  };

  const getCurvePosition = (energia: number): string => {
    const positions: Record<number, string> = {
      1: '5%',
      2: '10%',
      3: '18%',
      4: '28%',
      5: '40%',
      6: '52%',
      7: '62%',
      8: '72%',
      9: '85%',
      10: '95%',
    };
    return positions[Math.round(energia)] || '50%';
  };

  // Formatear fecha
  const formattedDate = fecha.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  
  if (isFuture) {
    return (
      <View style={[styles.container, styles.futureContainer]}>
        <View style={styles.futureContent}>
          <View style={styles.futureIconContainer}>
            <Feather name="calendar" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.futureTitle}>Día en el futuro</Text>
          <Text style={styles.futureText}>
            {fecha.toLocaleDateString('es-MX', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </Text>
        </View>
      </View>
    );
  }

  // SIN REGISTRO 
  if (!registro) {
    return (
      <TouchableOpacity 
        style={styles.container}
        onPress={onRegister}
        activeOpacity={0.8}
      >
        <View style={styles.emptyContent}>
          
          <View style={styles.emptyIconContainer}>
            <Feather name="edit-2" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.emptyTitle}>
            {isToday ? 'Registrar emoción de hoy' : 'Registrar emoción'}
          </Text>
          <Text style={styles.emptySubtitle}>¿Cómo te sientes hoy?</Text>
        </View>
      </TouchableOpacity>
    );
  }

  const emotionData = Emocion.getById(registro.emocion);
  const energyColor = getEnergyColor(registro.energia);

  return (
    <View style={styles.container}>
      {/* Fecha */}
      <Text style={styles.dateText}>
        {fecha.toLocaleDateString('es-MX', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        })}
      </Text>

      {/* Contenido principal */}
      <View style={styles.mainContent}>
        {/* Círculo de emoción */}
        <View style={[styles.emotionCircle, { backgroundColor: registro.color || COLORS.primaryDark }]}>
          {emotionData?.image ? (
            <Image 
              source={emotionData.image}
              style={styles.emotionImage}
              resizeMode="contain"
            />
          ) : (
            <Feather name="smile" size={32} color="#FFFFFF" />
          )}
        </View>

        {/* Información */}
        <View style={styles.infoContainer}>
          <Text style={styles.emotionLabel}>
            {registro.emocionLabel || registro.emocion}
          </Text>
          
          {/* BARRA DE ENERGÍA CURVA */}
          <View style={styles.curveContainer}>
            <View style={styles.curveBackground}>
              <View 
                style={[
                  styles.curveFill, 
                  { 
                    width: getCurvePosition(registro.energia) as any,
                    backgroundColor: energyColor,
                  } as any,
                ]} 
              />
            </View>
            <View style={styles.curveLabelContainer}>
              <View style={styles.curveValueContainer}>
                <Feather name="zap" size={14} color={COLORS.white} />
                <Text style={[styles.curveValue, { color: COLORS.secondary }]}>
                  {registro.energia}/10
                </Text>
              </View>
              <Text style={[styles.curveLabel, { color: COLORS.white }]}>
                {getEnergyLabel(registro.energia)}
              </Text>
            </View>
          </View>

          {registro.nota && (
            <Text style={styles.noteText} numberOfLines={2}>
              {registro.nota}
            </Text>
          )}
        </View>
      </View>

      {/* Acciones */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={onEdit}>
          <Feather name="edit-2" size={16} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.detailsButton]}>
          <Feather name="bar-chart-2" size={16} color="#FFFFFF" />
          <Text style={styles.detailsButtonText}>Ver más</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ===== CONTENEDOR PRINCIPAL =====
  container: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  dateText: {
    fontSize: 13.2,
    color: COLORS.white,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  
  // ===== CON REGISTRO =====
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  emotionCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  emotionImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
  },
  emotionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },

  // ===== BARRA CURVA =====
  curveContainer: {
    marginTop: 2,
    marginBottom: 4,
    paddingRight: 4,
  },
  curveBackground: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  curveFill: {
    height: '100%',
    borderRadius: 3,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  curveLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  curveValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  curveValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  curveLabel: {
    fontSize: 12,
    fontWeight: '500',
  },

  noteText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 2,
  },

  // ===== ACCIONES =====
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  detailsButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },

  // ===== SIN REGISTRO =====
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  emptyDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 8,
  },
  emptyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptySubtitle: {
    fontSize: 13,
    color: 'rgba(253, 248, 248, 0.94)',
    marginTop: 2,
  },

  // ===== DÍA FUTURO =====
  futureContainer: {
    backgroundColor: COLORS.primary, 
  },
  futureContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  futureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  futureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  futureText: {
    fontSize: 13,
    color: 'rgba(253, 248, 248, 0.94)',
    marginTop: 2,
  },
});