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
}

/**
 * Result of the professional license verification process.
 */
export interface VerificationResult {
  status: 'found' | 'not_found' | 'error';
  data?: ProfessionalData;
  message?: string;
}

const API_URL = 'https://api.datosnonstop.com/v1/sep/cedula-numero';
const API_KEY = process.env.EXPO_PUBLIC_DATOSNONSTOP_API_KEY;

/**
 * Service to interact with the DatosNonStop API for professional license verification.
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
      const response = await fetch(`${API_URL}?numero=${licenseNumber}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json'
        }
      });

      const result = await response.json();

      if (response.status === 200 && result.status === 'found') {
        return {
          status: 'found',
          data: {
            profesion: result.data.profesion || '',
            carrera: result.data.carrera || '',
            nivelEducativo: result.data.nivel_educativo || result.data.nivelEducativo || '',
            areaConocimiento: result.data.area_conocimiento || result.data.areaConocimiento || '',
            subareaConocimiento: result.data.subarea_conocimiento || result.data.subareaConocimiento || '',
            institucion: result.data.institucion || ''
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
  }
};
