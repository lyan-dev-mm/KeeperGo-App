/**
 * Normaliza una cadena removiendo acentos/diacríticos, pasando a minúsculas,
 * eliminando puntuación y reduciendo espacios múltiples.
 */
export function normalizeString(str: string = ''): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
    .replace(/[^a-z0-9\s]/g, '') // Elimina signos de puntuación
    .replace(/\s+/g, ' ') // Colapsa espacios
    .trim();
}

/**
 * Valida si los datos del titular de la cédula retornados por la API DatosNonStop
 * coinciden de forma suficiente con el nombre y apellido(s) del usuario de Firebase.
 */
export function validateTitularIdentity(
  firebaseUser: {
    nombres?: string;
    primerApellido?: string;
    segundoApellido?: string;
    displayName?: string;
  },
  apiTitular: {
    nombre?: string;
    paterno?: string;
    materno?: string;
    nombreCompleto?: string;
  }
): boolean {
  const normFbNombres = normalizeString(firebaseUser.nombres || '');
  const normFbPrimer = normalizeString(firebaseUser.primerApellido || '');
  const normFbSegundo = normalizeString(firebaseUser.segundoApellido || '');

  const normApiNombre = normalizeString(apiTitular.nombre || '');
  const normApiPaterno = normalizeString(apiTitular.paterno || '');
  const normApiMaterno = normalizeString(apiTitular.materno || '');
  const normApiCompleto = normalizeString(apiTitular.nombreCompleto || '');

  // Si no tenemos ni nombre de pila ni primer apellido en Firebase, usar displayName como fallback
  if (!normFbNombres && !normFbPrimer && firebaseUser.displayName) {
    const normDisplayName = normalizeString(firebaseUser.displayName);
    if (!normDisplayName || !normApiCompleto) return false;

    // Verificar que las palabras clave del displayName estén en el nombre completo de la API
    const fbTokens = normDisplayName.split(' ').filter(t => t.length > 1);
    const matches = fbTokens.filter(t => normApiCompleto.includes(t));
    return matches.length >= Math.min(2, fbTokens.length);
  }

  // 1. Validar Nombres de pila
  const fbNameTokens = normFbNombres.split(' ').filter(t => t.length > 1);
  const apiNameTokens = (normApiNombre || normApiCompleto).split(' ').filter(t => t.length > 1);

  const hasNameMatch = fbNameTokens.length === 0 || fbNameTokens.some(token =>
    apiNameTokens.includes(token) || normApiNombre.includes(token) || normApiCompleto.includes(token)
  );

  if (!hasNameMatch) {
    return false;
  }

  // 2. Validar Primer Apellido (Paterno)
  if (normFbPrimer) {
    const isPaternoMatch = normApiPaterno
      ? normApiPaterno.includes(normFbPrimer) || normFbPrimer.includes(normApiPaterno)
      : normApiCompleto.includes(normFbPrimer);

    if (!isPaternoMatch) {
      return false;
    }
  }

  // 3. Validar Segundo Apellido (Materno) si está en Firebase
  if (normFbSegundo) {
    const isMaternoMatch = normApiMaterno
      ? normApiMaterno.includes(normFbSegundo) || normFbSegundo.includes(normApiMaterno)
      : normApiCompleto.includes(normFbSegundo);

    if (!isMaternoMatch) {
      return false;
    }
  }

  return true;
}

export const Validators = {
  validateEmail(value: string): string | null {
    if (!value) return 'El correo es obligatorio';
    const emailRegExp = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegExp.test(value)) return 'Correo electrónico inválido';
    return null;
  },

  validatePassword(value: string): string | null {
    if (!value) return 'La contraseña es obligatoria';
    if (value.length < 8) return 'Mínimo 8 caracteres';
    return null;
  },

  validateConfirmPassword(value: string, password: string): string | null {
    if (!value) return 'Confirma tu contraseña';
    if (value !== password) return 'Las contraseñas no coinciden';
    return null;
  },
};
