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
    const cleanLicense = licenseNumber ? licenseNumber.trim().replace(/\s+/g, '') : '';
    if (!cleanLicense) {
      return {
        status: 'error',
        message: 'Ingresa un número de cédula profesional válido.'
      };
    }

    if (!API_KEY) {
      console.error('[DatosNonStopService] API Key no configurada en las variables de entorno.');
      return {
        status: 'error',
        message: 'Configuración incompleta. Contacte a soporte.'
      };
    }

    try {
      const response = await fetch(SEP_API_URL, {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          numeroCedula: cleanLicense
        })
      });

      const contentType = response.headers.get('content-type') || '';
      const rawText = await response.text();

      let result: any = null;
      if (contentType.includes('application/json')) {
        try {
          result = JSON.parse(rawText);
        } catch {
          // Fallback handled safely by checking !result
        }
      }

      // Si la respuesta HTTP falló o el servidor devolvió un cuerpo no-JSON (ej. HTTP 404 page not found)
      if (!result || (!response.ok && response.status !== 200 && response.status !== 404)) {
        return {
          status: 'error',
          message: 'No pudimos verificar la cédula en este momento. Revisa tu conexión e inténtalo nuevamente.'
        };
      }

      if (response.status === 200 && (result.status === 'found' || result.status === 'success' || result.data)) {
        const d = result.data || result || {};
        const nombre = d.nombre || d.nombres || '';
        const paterno = d.paterno || d.apellido_paterno || d.apellidoPaterno || d.primer_apellido || '';
        const materno = d.materno || d.apellido_materno || d.apellidoMaterno || d.segundo_apellido || '';
        const nombreCompleto = d.nombre_completo || d.nombreCompleto || d.titular || [nombre, paterno, materno].filter(Boolean).join(' ');

        return {
          status: 'found',
          data: {
            profesion: d.profesion || d.carrera || '',
            carrera: d.carrera || d.profesion || '',
            nivelEducativo: d.nivel_educativo || d.nivelEducativo || '',
            areaConocimiento: d.area_conocimiento || d.areaConocimiento || '',
            subareaConocimiento: d.subarea_conocimiento || d.subareaConocimiento || '',
            institucion: d.institucion || d.des_institucion || '',
            nombre,
            paterno,
            materno,
            nombreCompleto
          }
        };
      } else if (result.status === 'not found' || result.status === 'not_found' || result.found === false) {
        return {
          status: 'not_found',
          message: 'No encontramos esta cédula profesional. Verifica el número e inténtalo nuevamente.'
        };
      } else {
        return {
          status: 'error',
          message: 'No pudimos verificar la cédula en este momento. Revisa tu conexión e inténtalo nuevamente.'
        };
      }
    } catch (error) {
      console.error('[DatosNonStopService] Network Error:', error);
      return {
        status: 'error',
        message: 'No pudimos verificar la cédula en este momento. Revisa tu conexión e inténtalo nuevamente.'
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
      console.error('[DatosNonStopService] API Key no configurada en las variables de entorno.');
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
          'x-api-key': API_KEY,
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const contentType = response.headers.get('content-type') || '';
      const rawText = await response.text();

      let result: any = null;
      if (contentType.includes('application/json')) {
        try {
          result = JSON.parse(rawText);
        } catch {
          // Fallback handled safely by checking !result
        }
      }

      if (!result) {
        return {
          status: 'error',
          message: `No fue posible verificar el RFC (HTTP ${response.status}).`
        };
      }

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
