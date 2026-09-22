
import { DASS21Response, DASS21Tipo } from '../entities/dass21/DASS21Response';

export interface IDASS21Repository {
  saveResponse(response: DASS21Response): Promise<DASS21Response>;
  getResponses(userId: string): Promise<DASS21Response[]>;
  getResponseByTipo(userId: string, tipo: DASS21Tipo): Promise<DASS21Response | null>;
  hasCompletedInicial(userId: string): Promise<boolean>;
  hasCompletedFinal(userId: string): Promise<boolean>;
}