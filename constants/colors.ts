
export const COLORS = {
  // Colores primarios
  primary: '#A0ED85', // '#9DDC9A',
  primaryDark: '#5AC155', 
  secondary: '#E0FFD5', // 8ECCBA
  secondaryDark: '#A0ED85',
  background: '#F5F0E8',
  title_black: '#514343',
  error: '#F44336',
  success: '#4CAF50',
  white: '#FFFFFF',
  black87: 'rgba(0,0,0,0.87)',

  cian: '#5073FF', 
  blue_dark: '#5073FF', 
  blue: '#5BB6FF',
  blue_second: '#90CAF9', 
  blue_sec_dark: '#CAE7FF',


  // Colores de emociones
  emotions: {
    feliz: '#EEBA5A',     // Amarillo
    neutral: '#9CA3AF',   // Gris
    triste: '#75BBCB',    // Azul
    tranquilo: '#7FC69E', //73FFAF
    ansioso: '#C05FD9',   // Morado
    molesto: '#FF5151',   // Rojo
  },

  // Neutros
  black: '#1A1A1A',
  gray: {
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

// Colores para la barra de energía 
export const ENERGY_COLORS = {
  low: '#7ed381',    // Verde (1-3)
  medium: '#fbcb47', // Amarillo (4-7)
  high: '#ff7b71',   // Rojo (8-10)
};

export const EMOCIONES = [
  { 
    id: 'triste', 
    label: 'Tristeza', 
    color: COLORS.emotions.triste, 
    image: require('../assets/images/emocion-tristeza.png'), 
    emoji: '😢' 
  },
  { 
    id: 'neutral', 
    label: 'Neutral', 
    color: COLORS.emotions.neutral, 
    image: require('../assets/images/emocion-neutral.png'), 
    emoji: '😐' 
  },
  { 
    id: 'tranquilo', 
    label: 'Calma', 
    color: COLORS.emotions.tranquilo, 
    image: require('../assets/images/emocion-calma.png'), 
    emoji: '😌' 
  },
  { 
    id: 'feliz', 
    label: 'Alegría', 
    color: COLORS.emotions.feliz, 
    image: require('../assets/images/emocion-felicidad.png'), 
    emoji: '😊' 
  },
  { 
    id: 'ansioso', 
    label: 'Ansiedad', 
    color: COLORS.emotions.ansioso, 
    image: require('../assets/images/emocion-preocupacion.png'), 
    emoji: '😰' 
  },
  { 
    id: 'molesto', 
    label: 'Enojo', 
    color: COLORS.emotions.molesto, 
    image: require('../assets/images/emocion-ira.png'), 
    emoji: '😤' 
  },
];

export const EMOCIONES_DATA = EMOCIONES;

export const Colors = {
  primary: COLORS.primary,
  secondary: COLORS.secondary,
  error: COLORS.error,
  success: COLORS.success,
  white: COLORS.white,
  black87: COLORS.black87,
  grey: COLORS.gray,
};

