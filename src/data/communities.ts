// src/data/communities.ts
export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  imageColor: string; // Color de fondo para la portada
  members: number;
  initials: string[]; // Iniciales de los integrantes de muestra
}

export const communitiesData: Community[] = [
  {
    id: 'c1',
    name: 'Lectores del mundo',
    description: 'Un espacio para compartir recomendaciones de libros, reseñas y lecturas colectivas.',
    category: 'Lectura',
    imageColor: '#FF9F9F',
    members: 1240,
    initials: ['AM', 'JR', 'LP', 'MG'],
  },
  {
    id: 'c2',
    name: 'Repostería Creativa',
    description: 'Comparte tus recetas, trucos de repostería y fotos de tus pasteles favoritos.',
    category: 'Repostería',
    imageColor: '#FBCEB1',
    members: 854,
    initials: ['LP', 'RG', 'SL'],
  },
  {
    id: 'c3',
    name: 'Canto y Coros',
    description: 'Ejercicios vocales, consejos para cuidar tu voz y técnicas para mejorar tu canto.',
    category: 'Música',
    imageColor: '#B5EAD7',
    members: 512,
    initials: ['MC', 'JL', 'DP'],
  },
  {
    id: 'c4',
    name: 'Inglés Fluido',
    description: 'Práctica de conversación, vocabulario diario y recursos para dominar el inglés.',
    category: 'Idiomas',
    imageColor: '#C7CEEA',
    members: 2010,
    initials: ['AK', 'PB', 'RD'],
  },
  {
    id: 'c5',
    name: 'Yoga y Meditación',
    description: 'Rutinas para encontrar calma, flexibilidad y bienestar mental diario.',
    category: 'Bienestar',
    imageColor: '#E2F0CB',
    members: 780,
    initials: ['VS', 'LT', 'MN'],
  },
  {
    id: 'c6',
    name: 'Francés Básico',
    description: 'Aprende desde cero con ejercicios sencillos y prácticas guiadas.',
    category: 'Idiomas',
    imageColor: '#FFDAC1',
    members: 433,
    initials: ['CE', 'AL', 'PP'],
  },
  {
    id: 'c7',
    name: 'Running 5K',
    description: 'Comparte tus marcas, retos de distancia y motivación para correr cada semana.',
    category: 'Deporte',
    imageColor: '#B5EAD7',
    members: 950,
    initials: ['RT', 'DA', 'SG'],
  },
  {
    id: 'c8',
    name: 'Cine Club',
    description: 'Debates sobre estrenos, clásicos del cine y recomendaciones de series.',
    category: 'Entretenimiento',
    imageColor: '#E0BBE4',
    members: 1100,
    initials: ['FV', 'BH', 'KM'],
  },
  {
    id: 'c9',
    name: 'Guitarra para principiantes',
    description: 'Acordes básicos, ritmos y tus primeras canciones para tocar en casa.',
    category: 'Música',
    imageColor: '#FEC8D8',
    members: 300,
    initials: ['GS', 'WC', 'LL'],
  },
];