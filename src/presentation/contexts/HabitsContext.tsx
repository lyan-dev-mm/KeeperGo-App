import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Activity {
  id: string;
  text: string;
  done: boolean;
}

export interface Habit {
  id: string;
  title: string;
  objetivo: string;
  semilla: string;
  icon: string;
  color: string;
  progress: boolean[]; // 7 posiciones: Lunes(0) ... Domingo(6)
  activities: Activity[];
}

interface HabitsContextValue {
  habits: Habit[];
  todayIndex: number;
  addHabit: (title?: string) => string;
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

export const WEEK_DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// Convierte Date.getDay() (0=domingo...6=sábado) a índice Lunes=0...Domingo=6
function getTodayIndex(): number {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

// IMPORTANTE: Ningún día inicia con palomita, solo se gana al completar TODAS las tareas del día
function createWeeklyProgress(): boolean[] {
  return Array.from({ length: 7 }, () => false);
}

const initialHabits: Habit[] = [
  {
    id: 'h1',
    title: 'Lectura',
    objetivo: 'Lograr leer por lo menos 3 libros por año.',
    semilla: 'Leer por lo menos 30 minutos por día',
    icon: 'book',
    color: '#FF8FAB',
    progress: createWeeklyProgress(),
    activities: [],
  },
  {
    id: 'h2',
    title: 'Aprender Inglés',
    objetivo: 'Alcanzar un nivel intermedio de inglés.',
    semilla: 'Estudiar una hora por día',
    icon: 'text-outline',
    color: '#B8C0FF',
    progress: createWeeklyProgress(),
    activities: [],
  },
];

export function HabitsProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);

  const addHabit = (title: string = 'Nuevo hábito'): string => {
    const id = `h${Date.now()}`;
    const newHabit: Habit = {
      id,
      title,
      objetivo: '',
      semilla: '',
      icon: 'star-outline',
      color: '#98D8C8',
      progress: createWeeklyProgress(),
      activities: [],
    };
    setHabits((prev) => [...prev, newHabit]);
    return id;
  };

  const renameHabit = (habitId: string, newTitle: string) => {
    setHabits((prev) => prev.map((h) => (h.id === habitId ? { ...h, title: newTitle } : h)));
  };

  const updateHabitField = (habitId: string, field: 'objetivo' | 'semilla', value: string) => {
    setHabits((prev) => prev.map((h) => (h.id === habitId ? { ...h, [field]: value } : h)));
  };

  const addActivity = (habitId: string, text: string) => {
    if (!text.trim()) return;
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const newActivity: Activity = { id: `a${Date.now()}`, text: text.trim(), done: false };
        return { ...h, activities: [...h.activities, newActivity] };
      })
    );
  };

  const toggleActivity = (habitId: string, activityId: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        
        const updatedActivities = h.activities.map((a) =>
          a.id === activityId ? { ...a, done: !a.done } : a
        );
        
        // Regla: Solo se marca el día de HOY si TODAS las actividades están completadas.
        const allDoneToday = updatedActivities.length > 0 && updatedActivities.every((a) => a.done);
        const todayIndex = getTodayIndex();
        
        // Copiamos el progreso actual (que inicia todo en false)
        const updatedProgress = [...h.progress];
        
        // Solo actualizamos el día de hoy. Los días pasados NO se tocan.
        updatedProgress[todayIndex] = allDoneToday;

        return { ...h, activities: updatedActivities, progress: updatedProgress };
      })
    );
  };

  const deleteActivity = (habitId: string, activityId: string) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId ? { ...h, activities: h.activities.filter((a) => a.id !== activityId) } : h
      )
    );
  };

  const deleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  };

  const deleteHabits = (habitIds: string[]) => {
    const idsToDelete = new Set(habitIds);
    setHabits((prev) => prev.filter((h) => !idsToDelete.has(h.id)));
  };

  const getHabitById = (habitId: string) => habits.find((h) => h.id === habitId);

  const value: HabitsContextValue = {
    habits,
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