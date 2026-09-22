// src/domain/entities/sus/SUSResponse.ts

import { SUS_CONFIG } from '../../../../constants/surveyConfig';

export type SUSNivel =
  | 'bajo'        // 0-50
  | 'promedio'    // 51-68
  | 'bueno'       // 69-80
  | 'excelente';  // 81-100

export interface SUSResponseProps {
  id?: string;
  userId: string;
  emailInstitucional: string;
  respuestas: number[]; // 10 respuestas (1-5)
  fecha: Date;
  completado: boolean;
  puntuacion?: number;  // 0-100
}

export class SUSResponse {
  id: string;
  userId: string;
  emailInstitucional: string;
  respuestas: number[];
  fecha: Date;
  completado: boolean;
  puntuacion: number;

  constructor({
    id,
    userId,
    emailInstitucional,
    respuestas,
    fecha,
    completado,
    puntuacion,
  }: SUSResponseProps) {
    // ID determinístico: un documento por usuario.
    this.id = id ?? `sus_${userId}`;
    this.userId = userId;
    this.emailInstitucional = emailInstitucional;
    this.respuestas = respuestas;
    this.fecha = fecha;
    this.completado = completado;
    this.puntuacion = puntuacion ?? this.calcularPuntuacion(respuestas);
  }

  /**
   * Fórmula oficial de Brooke (1996):
   * - Ítems impares (1-based: 1,3,5,7,9): valor = respuesta - 1
   * - Ítems pares  (1-based: 2,4,6,8,10): valor = 5 - respuesta
   * - Suma de los 10 valores → rango 0-40
   * - Multiplicar × 2.5 → rango 0-100
   */
  private calcularPuntuacion(respuestas: number[]): number {
    if (respuestas.length !== SUS_CONFIG.TOTAL_ITEMS) return 0;

    let suma = 0;
    for (let i = 0; i < respuestas.length; i++) {
      const r = respuestas[i];
      if (r < SUS_CONFIG.ESCALA_MIN || r > SUS_CONFIG.ESCALA_MAX) {
        return 0; // dato inválido → puntuación 0 (defensivo)
      }
      // i=0 → ítem 1 (impar) ; i=1 → ítem 2 (par) ...
      const esImpar = (i + 1) % 2 === 1;
      suma += esImpar ? r - 1 : 5 - r;
    }

    return suma * 2.5;
  }

  getNivel(): SUSNivel {
    if (this.puntuacion <= 50) return 'bajo';
    if (this.puntuacion <= 68) return 'promedio';
    if (this.puntuacion <= 80) return 'bueno';
    return 'excelente';
  }

  /**
   * ¿Está por encima del promedio según Sauro (2011)?
   */
  estaSobrePromedio(): boolean {
    return this.puntuacion > SUS_CONFIG.UMBRAL_PROMEDIO;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      emailInstitucional: this.emailInstitucional,
      respuestas: this.respuestas,
      fecha: this.fecha.toISOString(),
      completado: this.completado,
      puntuacion: this.puntuacion,
    };
  }

  static fromJSON(data: any): SUSResponse {
    return new SUSResponse({
      ...data,
      fecha: new Date(data.fecha),
    });
  }
}