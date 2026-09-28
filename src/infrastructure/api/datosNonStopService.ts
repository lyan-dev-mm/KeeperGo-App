/**
 * Interface representing the professional data returned by the DatosNonStop API.
 */
export interface ProfessionalData {
  profesion: string;
  carrera: string;
  nivelEducativo: string;
  areaConocimiento: string;
  subareaConocimiento: string;
  institucion: string;
  // Datos del titular para validación de identidad
  nombre?: string;
  paterno?: string;
  materno?: string;
  nombreCompleto?: string;
}

/**
 * Result of the professional license verification process.
 */
export interface VerificationResult {
  status: 'found' | 'not_found' | 'error';
  data?: ProfessionalData;
  message?: string;
}

/**
 * Parámetros para la verificación fiscal de instituciones mediante RFC.
 */
export interface InstitutionRFCParams {
  rfc: string;
  legalName?: string;
  postalCode?: string;
}

/**
 * Datos fiscales procesados tras la consulta de la institución.
 */
export interface InstitutionVerificationData {
  rfc: string;
  razonSocial?: string;
  codigoPostal?: string;
  valid: boolean;
  estatusSAT?: string;
  tipoPersona?: 'moral' | 'fisica';
}

/**
 * Resultado estructurado del proceso de verificación fiscal de instituciones.
 */
export interface InstitutionVerificationResult {
  status: 'verified' | 'rejected' | 'not_found' | 'error';
  data?: InstitutionVerificationData;
  message?: string;
}

const SEP_API_URL = 'https://api.datosnonstop.com/v1/sep/cedula-numero';
const SAT_RFC_API_URL = 'https://api.datosnonstop.com/v1/sat/validar-rfc';
const API_KEY = process.env.EXPO_PUBLIC_DATOSNONSTOP_API_KEY;

/**
 * Service to interact with the DatosNonStop API for professional license & institutional RFC verification.
 */
export const datosNonStopService = {
  /**
   * Verifies a professional license number using the DatosNonStop API.
   *
   * @param licenseNumber - The professional license number to verify.
   * @returns A promise that resolves to a VerificationResult.
   */
  async verifyLicense(licenseNumber: string): Promise<VerificationResult> {
    if (!API_KEY) {
      console.error('[DatosNonStopService] API Key is missing in environment variables.');
      return {
        status: 'error',
        message: 'Configuración incompleta. Contacte a soporte.'
      };
    }

    try {
      const response = await fetch(`${SEP_API_URL}?numero=${licenseNumber}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json'
        }
      });

      const result = await response.json();

      if (response.status === 200 && result.status === 'found') {
        const d = result.data || {};
        const nombre = d.nombre || d.nombres || '';
        const paterno = d.paterno || d.apellido_paterno || d.apellidoPaterno || d.primer_apellido || '';
        const materno = d.materno || d.apellido_materno || d.apellidoMaterno || d.segundo_apellido || '';
        const nombreCompleto = d.nombre_completo || d.nombreCompleto || d.titular || [nombre, paterno, materno].filter(Boolean).join(' ');

        return {
          status: 'found',
          data: {
            profesion: d.profesion || '',
            carrera: d.carrera || '',
            nivelEducativo: d.nivel_educativo || d.nivelEducativo || '',
            areaConocimiento: d.area_conocimiento || d.areaConocimiento || '',
            subareaConocimiento: d.subarea_conocimiento || d.subareaConocimiento || '',
            institucion: d.institucion || '',
            nombre,
            paterno,
            materno,
            nombreCompleto
          }
        };
      } else if (result.status === 'not found' || result.status === 'not_found' || response.status === 404) {
        return {
          status: 'not_found',
          message: 'No se encontró información asociada a esta cédula profesional.'
        };
      } else {
        console.error('[DatosNonStopService] API Error:', result);
        return {
          status: 'error',
          message: 'No fue posible verificar la cédula profesional. Inténtalo nuevamente.'
        };
      }
    } catch (error) {
      console.error('[DatosNonStopService] Network Error:', error);
      return {
        status: 'error',
        message: 'Error de conexión. Verifica tu internet e inténtalo de nuevo.'
      };
    }
  },

  /**
   * Verifica los datos fiscales de una institución mediante la API Datos Non Stop (SAT validar-rfc).
   *
   * @param params - Parámetros fiscales de la institución (RFC, Razón Social, C.P. Fiscal).
   * @returns Un objeto InstitutionVerificationResult estructurado.
   */
  async verifyInstitutionRFC(params: InstitutionRFCParams): Promise<InstitutionVerificationResult> {
    if (!API_KEY) {
      console.error('[DatosNonStopService] API Key is missing in environment variables.');
      return {
        status: 'error',
        message: 'Configuración incompleta. Contacte a soporte.'
      };
    }

    const normRFC = params.rfc ? params.rfc.trim().toUpperCase() : '';
    if (!normRFC) {
      return {
        status: 'error',
        message: 'Ingresa un RFC institucional válido.'
      };
    }

    const payload = {
      rfc: normRFC,
      razon_social: params.legalName ? params.legalName.trim() : undefined,
      codigo_postal: params.postalCode ? params.postalCode.trim() : undefined,
    };

    try {
      const response = await fetch(SAT_RFC_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        const isValid = result.valido === true || result.valid === true || result.status === 'valid' || result.status === 'found' || result.status === 'verified' || response.status === 200;

        if (isValid && result.valido !== false && result.valid !== false && result.status !== 'invalid' && result.status !== 'rejected') {
          const d = result.data || result || {};
          return {
            status: 'verified',
            data: {
              rfc: normRFC,
              razonSocial: d.razon_social || d.razonSocial || params.legalName || '',
              codigoPostal: d.codigo_postal || d.codigoPostal || params.postalCode || '',
              valid: true,
              estatusSAT: d.estatus || d.estatus_sat || d.estatusSAT || 'ACTIVO',
              tipoPersona: normRFC.length === 12 ? 'moral' : 'fisica',
            },
            message: 'Institución verificada correctamente ante el SAT.'
          };
        } else {
          return {
            status: 'rejected',
            message: result.message || result.error || 'No pudimos verificar los datos fiscales de la institución. Revisa el RFC y la información proporcionada.'
          };
        }
      } else if (response.status === 400 || response.status === 404 || response.status === 422) {
        return {
          status: 'rejected',
          message: result.message || result.error || 'No pudimos verificar los datos fiscales de la institución. Revisa el RFC y la información proporcionada.'
        };
      } else {
        console.error('[DatosNonStopService] SAT RFC API Error:', response.status, result);
        return {
          status: 'error',
          message: 'No fue posible consultar el servicio de verificación fiscal en este momento. Inténtalo más tarde.'
        };
      }
    } catch (error) {
      console.error('[DatosNonStopService] Network/Connection Error:', error);
      return {
        status: 'error',
        message: 'No fue posible consultar el servicio de verificación en este momento. Revisa tu conexión e inténtalo más tarde.'
      };
    }
  }
};
