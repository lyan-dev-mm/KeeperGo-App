import { Ionicons } from '@expo/vector-icons';

export interface Specialist {
  id: string;
  name: string;
  specialty: string;
  distanceKm: number;
  bio: string;
  credentials: string[];
  yearsExperience: number;
  rating: number;
  avatarIcon: keyof typeof Ionicons.glyphMap;
}

export const SPECIALISTS: Specialist[] = [
  {
    id: '1',
    name: 'Dra. Ana Martínez',
    specialty: 'Ansiedad y estrés académico',
    distanceKm: 1.2,
    bio: 'Psicóloga clínica especializada en acompañar a estudiantes universitarios que enfrentan ansiedad, presión académica y agotamiento emocional.',
    credentials: ['Lic. en Psicología Clínica', 'Maestría en Terapia Cognitivo-Conductual'],
    yearsExperience: 8,
    rating: 4.9,
    avatarIcon: 'person-circle-outline',
  },
  {
    id: '2',
    name: 'Dr. Carlos Rodríguez',
    specialty: 'Terapia cognitivo-conductual',
    distanceKm: 2.5,
    bio: 'Enfoca su trabajo en herramientas prácticas para manejar pensamientos negativos, procrastinación y bloqueos emocionales.',
    credentials: ['Lic. en Psicología', 'Certificación en TCC'],
    yearsExperience: 6,
    rating: 4.7,
    avatarIcon: 'person-circle-outline',
  },
  {
    id: '3',
    name: 'Dra. Sofía Hernández',
    specialty: 'Adolescentes y jóvenes adultos',
    distanceKm: 3.1,
    bio: 'Especialista en acompañar procesos de identidad, autoestima y transición a la vida adulta en jóvenes.',
    credentials: ['Lic. en Psicología', 'Especialidad en Psicología del Desarrollo'],
    yearsExperience: 10,
    rating: 5.0,
    avatarIcon: 'person-circle-outline',
  },
  {
    id: '4',
    name: 'Dr. Luis Torres',
    specialty: 'Trastornos del ánimo',
    distanceKm: 4.8,
    bio: 'Psiquiatra con enfoque integral, combinando seguimiento médico y acompañamiento terapéutico para el manejo del ánimo.',
    credentials: ['Médico Psiquiatra', 'Subespecialidad en Trastornos del Ánimo'],
    yearsExperience: 12,
    rating: 4.6,
    avatarIcon: 'person-circle-outline',
  },
];

export function getSpecialistById(id: string): Specialist | undefined {
  return SPECIALISTS.find((s) => s.id === id);
}