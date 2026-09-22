// src/domain/entities/paywall/PaywallResponse.ts

import {
  FuncionalidadPremiumId,
  IntencionPago,
} from '../../../../constants/paywallQuestions';

export interface PaywallResponseProps {
  id?: string;
  userId: string;
  emailInstitucional: string;
  /** ¿Pagaría por Keeper Go después del piloto? */
  intencionPago: IntencionPago;
  /** ¿Pagaría $129 MXN/mes? */
  pagariaPrecioActual: boolean;
  /** Funcionalidad premium que más le motiva */
  funcionalidadPremium: FuncionalidadPremiumId;
  /** ¿Usaría Keeper Go si la universidad pagara? */
  intencionInstitucional: IntencionPago;
  fecha: Date;
  completado: boolean;
}

export class PaywallResponse {
  id: string;
  userId: string;
  emailInstitucional: string;
  intencionPago: IntencionPago;
  pagariaPrecioActual: boolean;
  funcionalidadPremium: FuncionalidadPremiumId;
  intencionInstitucional: IntencionPago;
  fecha: Date;
  completado: boolean;

  constructor({
    id,
    userId,
    emailInstitucional,
    intencionPago,
    pagariaPrecioActual,
    funcionalidadPremium,
    intencionInstitucional,
    fecha,
    completado,
  }: PaywallResponseProps) {
    this.id = id ?? `paywall_${userId}`;
    this.userId = userId;
    this.emailInstitucional = emailInstitucional;
    this.intencionPago = intencionPago;
    this.pagariaPrecioActual = pagariaPrecioActual;
    this.funcionalidadPremium = funcionalidadPremium;
    this.intencionInstitucional = intencionInstitucional;
    this.fecha = fecha;
    this.completado = completado;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      emailInstitucional: this.emailInstitucional,
      intencionPago: this.intencionPago,
      pagariaPrecioActual: this.pagariaPrecioActual,
      funcionalidadPremium: this.funcionalidadPremium,
      intencionInstitucional: this.intencionInstitucional,
      fecha: this.fecha.toISOString(),
      completado: this.completado,
    };
  }

  static fromJSON(data: any): PaywallResponse {
    return new PaywallResponse({
      ...data,
      fecha: new Date(data.fecha),
    });
  }
}