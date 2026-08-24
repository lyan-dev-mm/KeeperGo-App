// src/presentation/components/bitacora/EmotionCalendar.jsx

import React, { useState, useEffect, JSX } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { COLORS } from '../../../../constants/colors'
import { Emocion } from '../../../domain/entities/bitacora/Emocion';
import { RegistroAnimo } from '../../../domain/entities/bitacora/RegistroAnimo'

const { width } = Dimensions.get('window');
const DAY_SIZE = width / 7 - 8;

export interface DayData {
  id: string;
  day: number;
  month: number;
  year: number;
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  registro: RegistroAnimo | null;
}

export interface EmotionCalendarProps {
  registros?: RegistroAnimo[];
  onDayPress?: (date: Date) => void;
  onEmotionPress?: (registro: RegistroAnimo, date: Date) => void;
  selectedDate?: Date;
}

export default function EmotionCalendar({ 
  registros = [], 
  onDayPress,
  onEmotionPress,
  selectedDate = new Date() 
}: EmotionCalendarProps): JSX.Element {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [days, setDays] = useState<DayData[]>([]);

  useEffect(() => {
    generateDays();
  }, [currentMonth, registros]);

  const generateDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // ===== 1. Calcular el primer día del mes =====
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    
    
    // ===== 2. Día de la semana del primer día (0 = Domingo) =====
    let startDayOfWeek = firstDayOfMonth.getDay();
    
    // ===== 3. Crear array de días (siempre 42 = 6 filas x 7 días) =====
    const totalDays = 42;
    const daysArray = [];
    
    // ===== 4. Días del mes anterior =====
    const prevMonthDate = new Date(year, month, 0);
    const prevMonthDays = prevMonthDate.getDate();
    
    // Si el mes empieza en Domingo (0), no hay días del mes anterior
    // Si empieza en Lunes (1), hay 1 día del mes anterior, etc.
    const daysFromPrevMonth = startDayOfWeek === 0 ? 0 : startDayOfWeek;
    
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const dayNumber = prevMonthDays - i;
      const date = new Date(year, month - 1, dayNumber);
      daysArray.push({
        id: `prev-${i}`,
        day: dayNumber,
        month: month - 1,
        year: year,
        date: date,
        isCurrentMonth: false,
        isToday: false,
        registro: null,
      });
    }
    
    // ===== 5. Días del mes actual =====
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isTodayDate = isToday(date);
      const registro = findRegistroForDate(date);
      
      daysArray.push({
        id: `current-${i}`,
        day: i,
        month: month,
        year: year,
        date: date,
        isCurrentMonth: true,
        isToday: isTodayDate,
        registro: registro,
      });
    }
    
    // ===== 6. Días del mes siguiente (para completar 42) =====
    const remainingDays = totalDays - daysArray.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      daysArray.push({
        id: `next-${i}`,
        day: i,
        month: month + 1,
        year: year,
        date: date,
        isCurrentMonth: false,
        isToday: false,
        registro: null,
      });
    }
    
    setDays(daysArray);
  };

  const findRegistroForDate = (date: Date): RegistroAnimo | null => {
     if (!registros || !Array.isArray(registros) || registros.length === 0) {
      return null;
    }
    const  regEncontrado = registros.find((r) => {
      const rDate = new Date(r.fecha);
      return (
          rDate.getDate() === date.getDate() &&
         rDate.getMonth() === date.getMonth() &&
         rDate.getFullYear() === date.getFullYear()
        );
      });
    return regEncontrado || null;
  };

  const isToday = (date:Date) : boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() && 
      date.getFullYear() === today.getFullYear()
    );
  };

  const changeMonth = (increment: number): void => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + increment);
    setCurrentMonth(newMonth);
  };

  const isSelectedDate = (date: Date) : boolean => {
    if (!selectedDate || !date) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

  return (
    <View style={styles.container}>
      {/* Header del mes */}
      <View style={styles.headerRow}>
        <TouchableOpacity 
          onPress={() => changeMonth(-1)} 
          style={styles.navButton}
          activeOpacity={0.6}
        >
          <Text style={styles.navText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        <TouchableOpacity 
          onPress={() => changeMonth(1)} 
          style={styles.navButton}
          activeOpacity={0.6}
        >
          <Text style={styles.navText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Días de la semana */}
      <View style={styles.weekDaysRow}>
        {dayNames.map((day, index) => (
          <Text key={index} style={styles.weekDayText}>{day}</Text>
        ))}
      </View>

      {/* Grid de días */}
      <View style={styles.daysGrid}>
        {days.map((day, index) => {
          const isSelected = day.date && isSelectedDate(day.date);
          const emotionData = day.registro 
            ? Emocion.getById(day.registro.emocion) 
            : null;
          return (
            <TouchableOpacity
              key={day.id || index}
              style={[
                styles.dayCell,
                !day.isCurrentMonth && styles.otherMonthCell,
                isSelected && styles.selectedCell,
              ]}
              onPress={() => {
                if (day.date && day.isCurrentMonth) {
                  onDayPress?.(day.date);
                }
              }}
              disabled={!day.isCurrentMonth}
              activeOpacity={0.6}
            >
             {day.registro && emotionData ? (
              <TouchableOpacity style={styles.emotionDayContainer}
              onPress={() => {
                // Al tocar emocion abrir detalle
                if(onEmotionPress && day.registro && day.date){
                  onEmotionPress(day.registro, day.date);
                }
              }}
              activeOpacity={0.7}
              >
                  <Image 
                    source={emotionData.image}
                    style={styles.emotionDayImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.emotionDayNumber}>
                    {day.day}
                  </Text>
                </TouchableOpacity>
              ) : ( 

              // Días sin emoción
              <Text style={[
                styles.dayText,
                !day.isCurrentMonth && styles.otherMonthText,
                day.isToday && styles.todayText,
                isSelected && styles.selectedDayText,
              ]}>
                {day.day}
              </Text>
             )}
              {day.isToday && !day.registro && (
                <View style={styles.todayDot} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  //  FILA 1
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 1,
    backgroundColor: COLORS.primary, 
    borderRadius: 12,
    marginBottom: 0,
  },
  navButton: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  navText: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: '400',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
    
  },
  weekDays: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 2,
  },

  // FILA 2
  weekDaysRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 2,
    backgroundColor: COLORS.secondary, 
    borderRadius: 8,
    marginTop: 0,
    marginBottom: 0,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    color: COLORS.gray[400],
    fontWeight: '500',
  },
  // GRID de días
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 4,
  },
  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  otherMonthCell: {
    opacity: 0.3,
  },
  selectedCell: {
    backgroundColor: '#F5F3FF',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  dayText: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '400',
  },
  otherMonthText: {
    color: COLORS.gray[400],
  },
  todayText: {
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  selectedDayText: {
    fontWeight: '700',
    color: COLORS.primaryDark,
    
  },
  emotionIndicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  emotionEmoji: {
    fontSize: 12,
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 2,
  },
  // DÍA CON EMOCIÓN
  emotionDayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  emotionDayImage: {
    width: 30,         
    height: 30,         
    borderRadius: 14,
  },
  emotionDayNumber: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    fontSize: 9,
    color: COLORS.gray[400],
    fontWeight: '400',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 16,
    textAlign: 'center',
  },  
});