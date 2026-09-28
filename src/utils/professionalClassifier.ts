import { ProfessionalData } from '../infrastructure/api/datosNonStopService';

/**
 * Categorías profesionales de salud soportadas por KeeperGo.
 */
export const PROFESSIONAL_CATEGORIES = {
  psychology: [
    'PSICOLOGIA',
    'PSICOLOGO',
    'PSICOLOGA',
    'PSICOTERAPIA',
    'PSICOTERAPEUTA',
    'PSICOANALISIS',
    'PSICOANALISTA',
    'PSICOPEDAGOGIA',
    'NEUROPSICOLOGIA',
  ],
  medicine: [
    'MEDICINA',
    'MEDICO',
    'MEDICA',
    'MEDICO CIRUJANO',
  ],
  dentistry: [
    'ODONTOLOGIA',
    'CIRUJANO DENTISTA',
    'ESTOMATOLOGIA',
  ],
  nursing: [
    'ENFERMERIA',
    'ENFERMERO',
    'ENFERMERA',
  ],
  nutrition: [
    'NUTRICION',
    'NUTRIOLOGO',
    'NUTRIOLOGA',
  ],
  physicalTherapy: [
    'FISIOTERAPIA',
    'REHABILITACION',
    'TERAPIA FISICA',
  ],
} as const;

export type HealthCategory = keyof typeof PROFESSIONAL_CATEGORIES;

/**
 * Resultado estructurado de la clasificación profesional.
 */
export interface ProfessionalClassificationResult {
  isHealthProfessional: boolean;
  healthCategory: HealthCategory | null;
  normalizedProfession: string;
  normalizedCareer: string;
}

/**
 * Normaliza el nombre de una profesión o carrera.
 * Convierte a mayúsculas, remueve acentos/diacríticos, elimina caracteres especiales y colapsa espacios.
 */
export function normalizeProfession(str: string = ''): string {
  if (!str) return '';

  return str
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
    .replace(/[^A-Z0-9\s]/g, ' ') // Elimina caracteres especiales por espacios
    .replace(/\s+/g, ' ') // Colapsa múltiples espacios
    .trim();
}

/**
 * Determina si el texto de la profesión o carrera corresponde a la rama de Psicología.
 */
export function matchesPsychologyProfession(professionText: string = '', careerText: string = ''): boolean {
  const normProf = normalizeProfession(professionText);
  const normCarr = normalizeProfession(careerText);

  const keywords = PROFESSIONAL_CATEGORIES.psychology;

  const matchesText = (text: string): boolean => {
    if (!text) return false;

    // Verifica si incluye cualquiera de los términos clave definidos
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return true;
      }
    }

    // Raíz de coincidencia para variaciones no explícitas (e.g. PSICOLOG..., PSICOTERAP...)
    if (text.includes('PSICOLOG') || text.includes('PSICOTERAP') || text.includes('PSICOANAL')) {
      return true;
    }

    return false;
  };

  return matchesText(normProf) || matchesText(normCarr);
}

/**
 * Evalúa los datos profesionales devueltos por la API para clasificar la profesión.
 * La clasificación es determinística, auditable y no depende de IA ni probabilidades.
 */
export function validateProfessionalCategory(
  professionalData?: Partial<ProfessionalData> | null
): ProfessionalClassificationResult {
  if (!professionalData) {
    return {
      isHealthProfessional: false,
      healthCategory: null,
      normalizedProfession: '',
      normalizedCareer: '',
    };
  }

  const rawProfession = professionalData.profesion || '';
  const rawCareer = professionalData.carrera || '';

  const normalizedProfession = normalizeProfession(rawProfession);
  const normalizedCareer = normalizeProfession(rawCareer);

  // Si ambos campos están vacíos, no se puede clasificar
  if (!normalizedProfession && !normalizedCareer) {
    return {
      isHealthProfessional: false,
      healthCategory: null,
      normalizedProfession: '',
      normalizedCareer: '',
    };
  }

  // 1. Verificación prioritaria de Psicología
  if (matchesPsychologyProfession(normalizedProfession, normalizedCareer)) {
    return {
      isHealthProfessional: true,
      healthCategory: 'psychology',
      normalizedProfession,
      normalizedCareer,
    };
  }

  // 2. Verificación de otras categorías de salud extensibles
  for (const [categoryKey, keywords] of Object.entries(PROFESSIONAL_CATEGORIES)) {
    if (categoryKey === 'psychology') continue; // Ya evaluado previamente

    const matchesCategory = (text: string): boolean => {
      if (!text) return false;
      return (keywords as readonly string[]).some((kw) => text.includes(kw));
    };

    if (matchesCategory(normalizedProfession) || matchesCategory(normalizedCareer)) {
      return {
        isHealthProfessional: true,
        healthCategory: categoryKey as HealthCategory,
        normalizedProfession,
        normalizedCareer,
      };
    }
  }

  // 3. Profesional no perteneciente a una categoría de salud reconocida
  return {
    isHealthProfessional: false,
    healthCategory: null,
    normalizedProfession,
    normalizedCareer,
  };
}
