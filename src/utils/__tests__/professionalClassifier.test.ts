import {
  normalizeProfession,
  matchesPsychologyProfession,
  validateProfessionalCategory,
} from '../professionalClassifier';

/**
 * Suite de Pruebas para la Clasificación Profesional en KeeperGo
 */
export function runProfessionalClassifierTests() {
  console.log('====================================================');
  console.log('EJECUTANDO PRUEBAS DE CLASIFICACIÓN PROFESIONAL');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Pruebas de Normalización
  console.log('--- 1. Normalización de Texto ---');
  assert(
    normalizeProfession('Licenciatura en Psicología') === 'LICENCIATURA EN PSICOLOGIA',
    'Normaliza "Licenciatura en Psicología" a "LICENCIATURA EN PSICOLOGIA"'
  );
  assert(
    normalizeProfession('  PSICOLOGÍA   CLÍNICA!! ') === 'PSICOLOGIA CLINICA',
    'Remueve caracteres especiales, acentos y colapsa espacios en "  PSICOLOGÍA   CLÍNICA!! "'
  );
  assert(
    normalizeProfession('') === '',
    'Maneja cadena vacía retornando ""'
  );
  assert(
    normalizeProfession(null as any) === '',
    'Maneja entrada nula sin crashear'
  );

  // 2. Pruebas de Detección de Psicología
  console.log('\n--- 2. Detección de Psicología ---');
  assert(
    matchesPsychologyProfession('LICENCIATURA EN PSICOLOGÍA') === true,
    'Detecta "LICENCIATURA EN PSICOLOGÍA"'
  );
  assert(
    matchesPsychologyProfession('PSICOLOGÍA') === true,
    'Detecta "PSICOLOGÍA"'
  );
  assert(
    matchesPsychologyProfession('LICENCIATURA EN PSICOLOGIA') === true,
    'Detecta "LICENCIATURA EN PSICOLOGIA" sin acento'
  );
  assert(
    matchesPsychologyProfession('psicología clínica') === true,
    'Detecta "psicología clínica" en minúsculas'
  );
  assert(
    matchesPsychologyProfession('MAESTRÍA EN PSICOTERAPIA') === true,
    'Detecta "MAESTRÍA EN PSICOTERAPIA"'
  );
  assert(
    matchesPsychologyProfession('', 'PSICOPEDAGOGIA') === true,
    'Detecta Psicología cuando está en el campo de carrera'
  );

  // 3. Pruebas de Otras Profesiones (No Salud / No Psicología)
  console.log('\n--- 3. Otras Profesiones (No Salud) ---');
  const abogadoResult = validateProfessionalCategory({
    profesion: 'LICENCIATURA EN DERECHO',
    carrera: 'DERECHO',
  });
  assert(
    abogadoResult.isHealthProfessional === false && abogadoResult.healthCategory === null,
    'Abogado (DERECHO): isHealthProfessional: false, healthCategory: null'
  );

  const ingenieroResult = validateProfessionalCategory({
    profesion: 'INGENIERÍA EN SISTEMAS COMPUTACIONALES',
    carrera: 'SISTEMAS COMPUTACIONALES',
  });
  assert(
    ingenieroResult.isHealthProfessional === false && ingenieroResult.healthCategory === null,
    'Ingeniero (SISTEMAS): isHealthProfessional: false, healthCategory: null'
  );

  // 4. Pruebas de Categoría Salud Extensible
  console.log('\n--- 4. Otras Categorías de Salud ---');
  const medicoResult = validateProfessionalCategory({
    profesion: 'MEDICINA GENERAL',
    carrera: 'MEDICO CIRUJANO',
  });
  assert(
    medicoResult.isHealthProfessional === true && medicoResult.healthCategory === 'medicine',
    'Médico: isHealthProfessional: true, healthCategory: "medicine"'
  );

  const nutriologoResult = validateProfessionalCategory({
    profesion: 'LICENCIATURA EN NUTRICIÓN',
    carrera: 'NUTRICION',
  });
  assert(
    nutriologoResult.isHealthProfessional === true && nutriologoResult.healthCategory === 'nutrition',
    'Nutriólogo: isHealthProfessional: true, healthCategory: "nutrition"'
  );

  // 5. Pruebas de Datos Incompletos / Nulos
  console.log('\n--- 5. Datos Incompletos o Nulos ---');
  const nullDataResult = validateProfessionalCategory(null);
  assert(
    nullDataResult.isHealthProfessional === false && nullDataResult.healthCategory === null,
    'Entrada nula: no crashea y retorna isHealthProfessional: false'
  );

  const emptyDataResult = validateProfessionalCategory({ profesion: '', carrera: '' });
  assert(
    emptyDataResult.isHealthProfessional === false && emptyDataResult.healthCategory === null,
    'Campos vacíos: no crashea y retorna isHealthProfessional: false'
  );

  // Resumen
  console.log('\n====================================================');
  console.log(`RESUMEN DE PRUEBAS: ${passed} PASADAS, ${failed} FALLADAS`);
  console.log('====================================================');

  if (failed > 0) {
    throw new Error(`Fallaron ${failed} pruebas de clasificación profesional.`);
  }
}
