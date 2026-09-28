declare var process: any;

import { runProfessionalClassifierTests } from './professionalClassifier.test';

try {
  runProfessionalClassifierTests();
  console.log('\n¡Todas las pruebas pasaron exitosamente!');
  if (typeof process !== 'undefined' && process.exit) {
    process.exit(0);
  }
} catch (error: any) {
  console.error('\nError durante la ejecución de las pruebas:', error?.message || error);
  if (typeof process !== 'undefined' && process.exit) {
    process.exit(1);
  }
}
