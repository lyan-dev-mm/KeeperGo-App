import { httpsCallable } from 'firebase/functions';
import { functions } from './firebaseConfig';

export type VerificationStatus = 'not_verified' | 'verifying' | 'verified' | 'not_found' | 'error';

export interface VerificationResult {
  success: boolean;
  verified: boolean;
  error?: string;
}

/**
 * Llama a la Cloud Function para verificar la cédula profesional mediante la CURP.
 */
export async function verifyCURP(curp: string): Promise<VerificationResult> {
  try {
    const verifyFunction = httpsCallable<{ curp: string }, VerificationResult>(
      functions,
      'verifyProfessionalLicense'
    );

    const result = await verifyFunction({ curp });
    return result.data;
  } catch (error: any) {
    console.error('Error en verifyCURP:', error);
    return {
      success: false,
      verified: false,
      error: error.message || 'Error desconocido al verificar la cédula.',
    };
  }
}
