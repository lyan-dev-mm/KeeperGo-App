// src/domain/entities/autopercepcion/AutopercepcionResponse.ts

import { AUTOPERCEPCION_CONFIG } from '../../../../constants/surveyConfig';

export type AutopercepcionTipo = 'pretest' | 'postest';

export interface AutopercepcionResponseProps {
  id?: string;
  userId: string;
  emailInstitucional: string;
  tipo: AutopercepcionTipo;
  /** Respuestas 1-5. Para pretest: 7 respuestas. Para postest: 12. */
  respuestas: number[];
  fecha: Date;
  completado: boolean;
  /** Promedio simple de los ítems 1-7 (comparables entre pretest y postest) */
  indiceProductividad?: number;
  /** Promedio de los ítems 8-12. Solo postest. */
  indiceSatisfaccionModulos?: number | null;
}

export class AutopercepcionResponse {
  id: string;
  userId: string;
  emailInstitucional: string;
  tipo: AutopercepcionTipo;
  respuestas: number[];
  fecha: Date;
  completado: boolean;
  /** Promedio ítems 1-7. Comparable pretest vs postest. */
  indiceProductividad: number;
  /** Promedio ítems 8-12. Solo postest. `null` en pretest. */
  indiceSatisfaccionModulos: number | null;

  constructor({
    id,
    userId,
    emailInstitucional,
    tipo,
    respuestas,
    fecha,
    completado,
    indiceProductividad,
    indiceSatisfaccionModulos,
  }: AutopercepcionResponseProps) {
    this.id = id ?? `autopercepcion_${userId}_${tipo}`;
    this.userId = userId;
    this.emailInstitucional = emailInstitucional;
    this.tipo = tipo;
    this.respuestas = respuestas;
    this.fecha = fecha;
    this.completado = completado;

    const indices = this.calcularIndices(respuestas, tipo);
    this.indiceProductividad =
      indiceProductividad ?? indices.indiceProductividad;
    this.indiceSatisfaccionModulos =
      indiceSatisfaccionModulos ?? indices.indiceSatisfaccionModulos;
  }

  private calcularIndices(
    respuestas: number[],
    tipo: AutopercepcionTipo
  ): {
    indiceProductividad: number;
    indiceSatisfaccionModulos: number | null;
  } {
    const itemsEsperados =
      tipo === 'pretest'
        ? AUTOPERCEPCION_CONFIG.TOTAL_ITEMS_PRETEST
        : AUTOPERCEPCION_CONFIG.TOTAL_ITEMS_POSTEST;

    if (respuestas.length !== itemsEsperados) {
      return { indiceProductividad: 0, indiceSatisfaccionModulos: null };
    }

    // Ítems 1-7 → productividad (índices 0-6)
    const productividadSlice = respuestas.slice(0, 7);
    const indiceProductividad =
      productividadSlice.reduce((a, b) => a + b, 0) / productividadSlice.length;

    // Ítems 8-12 → satisfacción con módulos (índices 7-11)
    let indiceSatisfaccionModulos: number | null = null;
    if (tipo === 'postest' && respuestas.length >= 12) {
      const satisfaccionSlice = respuestas.slice(7, 12);
      indiceSatisfaccionModulos =
        satisfaccionSlice.reduce((a, b) => a + b, 0) / satisfaccionSlice.length;
    }

    return { indiceProductividad, indiceSatisfaccionModulos };
  }

  /**
   * Delta entre pretest y postest en el índice de productividad.
   * Positivo = mejoró. Negativo = empeoró.
   */
  static calcularDeltaProductividad(
    pretest: AutopercepcionResponse,
    postest: AutopercepcionResponse
  ): number {
    return postest.indiceProductividad - pretest.indiceProductividad;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      emailInstitucional: this.emailInstitucional,
      tipo: this.tipo,
      respuestas: this.respuestas,
      fecha: this.fecha.toISOString(),
      completado: this.completado,
      indiceProductividad: this.indiceProductividad,
      indiceSatisfaccionModulos: this.indiceSatisfaccionModulos,
    };
  }

  static fromJSON(data: any): AutopercepcionResponse {
    return new AutopercepcionResponse({
      ...data,
      fecha: new Date(data.fecha),
    });
  }
}