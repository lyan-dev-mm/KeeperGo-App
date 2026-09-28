declare var process: any;

import { runInstitutionVerificationTests } from './institutionVerification.test';

try {
  runInstitutionVerificationTests();
  console.log('\n¡Todas las pruebas de verificación institucional pasaron exitosamente!');
  if (typeof process !== 'undefined' && process.exit) {
    process.exit(0);
  }
} catch (error: any) {
  console.error('\nError durante la ejecución de las pruebas:', error?.message || error);
  if (typeof process !== 'undefined' && process.exit) {
    process.exit(1);
  }
}
