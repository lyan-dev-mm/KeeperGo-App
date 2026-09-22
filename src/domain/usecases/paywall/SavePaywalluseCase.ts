// src/domain/usecases/paywall/SavePaywallUseCase.ts

import { PaywallResponse } from '../../entities/paywall/PaywallResponse';
import { IPaywallRepository } from '../../interfaces/IPaywallRepository';
import {
  FuncionalidadPremiumId,
  IntencionPago,
  PAYWALL_CONFIG,
} from '../../../../constants/paywallQuestions';

export interface SavePaywallData {
  userId: string;
  emailInstitucional: string;
  intencionPago: IntencionPago;
  pagariaPrecioActual: boolean;
  funcionalidadPremium: FuncionalidadPremiumId;
  intencionInstitucional: IntencionPago;
}

export class SavePaywallUseCase {
  constructor(private repository: IPaywallRepository) {}

  async execute(data: SavePaywallData): Promise<PaywallResponse> {
    const intencionesValidas: IntencionPago[] = ['si', 'tal_vez', 'no'];
    if (!intencionesValidas.includes(data.intencionPago)) {
      throw new Error('Intención de pago inválida');
    }
    if (!intencionesValidas.includes(data.intencionInstitucional)) {
      throw new Error('Intención institucional inválida');
    }

    const funcionalidadesValidas = PAYWALL_CONFIG.FUNCIONALIDADES_PREMIUM.map(
      (f) => f.id
    );
    if (!funcionalidadesValidas.includes(data.funcionalidadPremium)) {
      throw new Error('Funcionalidad premium inválida');
    }

    const response = new PaywallResponse({
      userId: data.userId,
      emailInstitucional: data.emailInstitucional,
      intencionPago: data.intencionPago,
      pagariaPrecioActual: data.pagariaPrecioActual,
      funcionalidadPremium: data.funcionalidadPremium,
      intencionInstitucional: data.intencionInstitucional,
      fecha: new Date(),
      completado: true,
    });

    return await this.repository.saveResponse(response);
  }
}