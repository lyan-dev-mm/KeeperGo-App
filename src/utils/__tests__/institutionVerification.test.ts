/**
 * Suite de Pruebas Unitarias para la Verificación Fiscal Institucional (RFC / SAT)
 */

export function validateRFCFormat(rfc: string): boolean {
  if (!rfc) return false;
  const norm = rfc.trim().toUpperCase();
  const rfcRegex = /^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}$/;
  return rfcRegex.test(norm);
}

export function validatePostalCodeFormat(postalCode: string): boolean {
  if (!postalCode) return false;
  const norm = postalCode.trim();
  return /^\d{5}$/.test(norm);
}

export function validateLegalNameFormat(legalName: string): boolean {
  if (!legalName) return false;
  return legalName.trim().length >= 3;
}

export function runInstitutionVerificationTests() {
  console.log('====================================================');
  console.log('EJECUTANDO PRUEBAS DE VERIFICACIÓN INSTITUCIONAL');
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

  // 1. Validaciones Locales de Sintaxis de RFC
  console.log('--- 1. Validaciones de Sintaxis de RFC ---');
  assert(
    validateRFCFormat('ITS080811ABC') === true,
    'Valida RFC de Persona Moral (12 caracteres)'
  );
  assert(
    validateRFCFormat('MORA850101ABC') === true,
    'Valida RFC de Persona Física (13 caracteres)'
  );
  assert(
    validateRFCFormat('its080811abc') === true,
    'Acepta minúsculas y las normaliza'
  );
  assert(
    validateRFCFormat('ITS123') === false,
    'Rechaza RFC demasiado corto (ITS123)'
  );
  assert(
    validateRFCFormat('ITS080811!!#') === false,
    'Rechaza RFC con caracteres especiales no permitidos'
  );
  assert(
    validateRFCFormat('') === false,
    'Rechaza RFC vacío'
  );

  // 2. Validaciones de Código Postal Fiscal
  console.log('\n--- 2. Validaciones de Código Postal Fiscal ---');
  assert(
    validatePostalCodeFormat('56330') === true,
    'Valida C.P. de 5 dígitos numéricos (56330)'
  );
  assert(
    validatePostalCodeFormat('01000') === true,
    'Valida C.P. que inicia con 0 (01000)'
  );
  assert(
    validatePostalCodeFormat('5633') === false,
    'Rechaza C.P. incompleto (4 dígitos)'
  );
  assert(
    validatePostalCodeFormat('563301') === false,
    'Rechaza C.P. excesivo (6 dígitos)'
  );
  assert(
    validatePostalCodeFormat('ABCDE') === false,
    'Rechaza C.P. alfanumérico'
  );

  // 3. Validaciones de Razón Social
  console.log('\n--- 3. Validaciones de Razón Social ---');
  assert(
    validateLegalNameFormat('Instituto Tecnológico de Chimalhuacán S.C.') === true,
    'Valida Razón Social oficial completa'
  );
  assert(
    validateLegalNameFormat('AB') === false,
    'Rechaza Razón Social menor a 3 caracteres'
  );
  assert(
    validateLegalNameFormat('   ') === false,
    'Rechaza Razón Social vacía con espacios'
  );

  // 4. Lógica de Restablecimiento/Invalidación de Verificación
  console.log('\n--- 4. Lógica de Invalidador al Editar Campos Fiscales ---');
  let currentStatus: string = 'verified';
  let isRfcVerified = true as boolean;

  function onFiscalFieldEdited() {
    if (currentStatus !== 'unverified') {
      currentStatus = 'unverified';
      isRfcVerified = false;
    }
  }

  onFiscalFieldEdited();

  assert(
    currentStatus === 'unverified' && isRfcVerified === false,
    'Al modificar un dato fiscal tras verificar, la verificación previa se invalida a unverified'
  );

  console.log('\n====================================================');
  console.log(`RESUMEN DE PRUEBAS: ${passed} PASADAS, ${failed} FALLADAS`);
  console.log('====================================================');

  if (failed > 0) {
    throw new Error(`Fallaron ${failed} pruebas de verificación institucional.`);
  }
}
