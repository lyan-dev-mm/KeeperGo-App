import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth'; // Asegúrate de que esta sea la ruta correcta a tu hook useAuth
import { HabitRepositoryImpl } from '../../data/repositories/habitos/HabitRepositoryImpl';
import { HabitEntity, HabitActivity } from '../../domain/entities/habitos/Habit';

export type Habit = HabitEntity;

interface HabitsContextValue {
  habits: Habit[];
  loading: boolean;
  todayIndex: number;
  addHabit: (title?: string) => Promise<string>;
  renameHabit: (habitId: string, newTitle: string) => void;
  updateHabitField: (habitId: string, field: 'objetivo' | 'semilla', value: string) => void;
  addActivity: (habitId: string, text: string) => void;
  toggleActivity: (habitId: string, activityId: string) => void;
  deleteActivity: (habitId: string, activityId: string) => void;
  deleteHabit: (habitId: string) => void;
  deleteHabits: (habitIds: string[]) => void;
  getHabitById: (habitId: string) => Habit | undefined;
}

const HabitsContext = createContext<HabitsContextValue | null>(null);
const habitRepository = new HabitRepositoryImpl();

export const WEEK_DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function getTodayIndex(): number {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}
// Calcula la fecha del Lunes de la semana actual a las 00:00 y la convierte a texto "YYYY-MM-DD"
function getCurrentWeekStartDate(): string {
  const today = new Date();
  const jsDay = today.getDay(); // 0=Domingo, 1=Lunes, ... 6=Sábado
  const diffToMonday = jsDay === 0 ? -6 : 1 - jsDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  
  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, '0');
  const day = String(monday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Verifica si hay que resetear la semana y devuelve el hábito actualizado
function checkAndResetWeeklyProgress(habit: Habit): { habit: Habit; needsUpdate: boolean } {
  const currentWeek = getCurrentWeekStartDate();
  // Si el hábito no tiene weekStartDate (es viejo o nuevo) o es de una semana anterior
  if (habit.weekStartDate !== currentWeek) {
    return {
      habit: {
        ...habit,
        progress: Array.from({ length: 7 }, () => false),
        weekStartDate: currentWeek,
      },
      needsUpdate: true,
    };
  }
  return { habit, needsUpdate: false };
}

export function HabitsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth(); // Obtenemos el usuario autenticado
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

   useEffect(() => {
    const loadHabits = async () => {
      if (!user?.id) {
        setHabits([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const result = await habitRepository.getHabitsByUser(user.id);
        
        // Verificamos cada hábito: ¿necesita resetear la semana?
        const habitsWithCheck = result.map((habit) => checkAndResetWeeklyProgress(habit));
        
        // Guardamos en Firebase los hábitos que necesitaban reset
        for (const { habit, needsUpdate } of habitsWithCheck) {
          if (needsUpdate) {
            habitRepository.updateHabit(habit.id, {
              progress: habit.progress,
              weekStartDate: habit.weekStartDate,
            }).catch(console.error);
          }
        }
        
        setHabits(habitsWithCheck.map((h) => h.habit));
      } catch (error) {
        console.error('Error al cargar hábitos:', error);
      } finally {
        setLoading(false);
      }
    };
    loadHabits();
  }, [user?.id]);

  const addHabit = async (title: string = 'Nuevo hábito'): Promise<string> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    // Generamos un ID temporal para la UI
    const tempId = `h${Date.now()}`;
    const newHabit: Habit = {
      id: tempId,
      userId: user.id,
      title,
      objetivo: '',
      semilla: '',
      icon: 'star-outline',
      color: '#98D8C8',
      progress: Array.from({ length: 7 }, () => false),
      activities: [],
    };

    // Actualización optimista (la UI lo muestra de inmediato)
    setHabits((prev) => [...prev, newHabit]);

    try {
      // Esperamos a que Firebase cree el hábito y nos devuelva el ID real
      const createdHabit = await habitRepository.createHabit(user.id, {
        title,
        objetivo: '',
        semilla: '',
        icon: 'star-outline',
        color: '#98D8C8',
         weekStartDate: getCurrentWeekStartDate(),
      });

      // Reemplazamos el hábito temporal por el real en el estado
      setHabits((prev) => prev.map((h) => (h.id === tempId ? createdHabit : h)));
      
      // Devolvemos el ID REAL de Firebase
      return createdHabit.id;
    } catch (error) {
      console.error('Error al crear hábito:', error);
      // Si falla, removemos el hábito temporal de la UI
      setHabits((prev) => prev.filter((h) => h.id !== tempId));
      throw error;
    }
  };

  const renameHabit = (habitId: string, newTitle: string) => {
    setHabits((prev) => prev.map((h) => (h.id === habitId ? { ...h, title: newTitle } : h)));
    habitRepository.updateHabit(habitId, { title: newTitle }).catch(console.error);
  };

  const updateHabitField = (habitId: string, field: 'objetivo' | 'semilla', value: string) => {
    setHabits((prev) => prev.map((h) => (h.id === habitId ? { ...h, [field]: value } : h)));
    habitRepository.updateHabit(habitId, { [field]: value }).catch(console.error);
  };

  const addActivity = (habitId: string, text: string) => {
    if (!text.trim()) return;
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const newActivity: HabitActivity = { id: `a${Date.now()}`, text: text.trim(), done: false };
        const updatedActivities = [...h.activities, newActivity];
        habitRepository.updateHabit(habitId, { activities: updatedActivities }).catch(console.error);
        return { ...h, activities: updatedActivities };
      })
    );
  };

  const toggleActivity = (habitId: string, activityId: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;

        // Verificación por si cambió la semana mientras la app estaba abierta
        const { habit: currentHabit } = checkAndResetWeeklyProgress(h);
        
        const updatedActivities = currentHabit.activities.map((a) =>
          a.id === activityId ? { ...a, done: !a.done } : a
        );
        
        const allDoneToday = updatedActivities.length > 0 && updatedActivities.every((a) => a.done);
        const todayIndex = getTodayIndex();
        const updatedProgress = [...currentHabit.progress];
        if (allDoneToday) {
  updatedProgress[todayIndex] = true;
}
        // Guardamos activities, progress Y weekStartDate
        habitRepository.updateHabit(habitId, { 
          activities: updatedActivities, 
          progress: updatedProgress,
          weekStartDate: getCurrentWeekStartDate(),
        }).catch(console.error);

        return { 
          ...currentHabit, 
          activities: updatedActivities, 
          progress: updatedProgress,
          weekStartDate: getCurrentWeekStartDate(),
        };
      })
    );
  };

  const deleteActivity = (habitId: string, activityId: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const updatedActivities = h.activities.filter((a) => a.id !== activityId);
        habitRepository.updateHabit(habitId, { activities: updatedActivities }).catch(console.error);
        return { ...h, activities: updatedActivities };
      })
    );
  };

  const deleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    habitRepository.deleteHabit(habitId).catch(console.error);
  };

  const deleteHabits = (habitIds: string[]) => {
    const idsToDelete = new Set(habitIds);
    setHabits((prev) => prev.filter((h) => !idsToDelete.has(h.id)));
    habitRepository.deleteHabits(habitIds).catch(console.error);
  };

  const getHabitById = (habitId: string) => habits.find((h) => h.id === habitId);

  const value: HabitsContextValue = {
    habits,
    loading,
    todayIndex: getTodayIndex(),
    addHabit,
    renameHabit,
    updateHabitField,
    addActivity,
    toggleActivity,
    deleteActivity,
    deleteHabit,
    deleteHabits,
    getHabitById,
  };

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits(): HabitsContextValue {
  const ctx = useContext(HabitsContext);
  if (!ctx) {
    throw new Error('useHabits debe usarse dentro de <HabitsProvider>');
  }
  return ctx;
}