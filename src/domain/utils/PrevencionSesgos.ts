// src/domain/utils/bitacora/PrevencionSesgos.ts

import { RegistroAnimo } from '../entities/bitacora/RegistroAnimo';

// ============================================
// INTERFACES Y TIPOS
// ============================================

interface Limites {
  minimoRegistros: number;
  periodoMinimo: number;
  contextoRequerido: boolean;
}

interface ResultadoValidacion {
  valid: boolean;
  motivo: string;
  contexto?: string;
}

interface Alerta {
  tipo: string;
  nivel: 'bajo' | 'medio' | 'alto';
  mensaje: string;
  sugerencia: string;
  timestamp: string;
}

// ============================================
// CLASE
// ============================================

/**
 * Utilidad para prevenir sesgos en los mensajes y alertas emocionales
 * 
 * Esta clase se encarga de:
 * - Validar que las alertas sean significativas (no basadas en pocos datos)
 * - Verificar la consistencia de los patrones
 * - Reformular mensajes para que sean empáticos y no victimizantes
 */
export class PrevencionSesgos {
  private limites: Limites;

  constructor() {
    this.limites = {
      minimoRegistros: 5, // No alertar con pocos datos
      periodoMinimo: 7, // Días mínimos para patrones
      contextoRequerido: true, // Siempre considerar contexto
    };
  }

  /**
   * Valida una alerta antes de mostrarla al usuario
   * @param alerta - Alerta a validar
   * @param historial - Historial de registros del usuario
   * @param contexto - Contexto adicional (eventos, fin de semana, etc.)
   * @returns true si la alerta es válida y debe mostrarse
   */
  validarAlerta(
    alerta: Alerta,
    historial: RegistroAnimo[],
    contexto: any
  ): boolean {
    const validaciones: ResultadoValidacion[] = [
      this.validarVolumenDatos(historial),
      this.validarConsistencia(historial),
      this.validarContexto(contexto),
      this.validarLenguaje(alerta.mensaje),
    ];

    return validaciones.every((v) => v.valid);
  }

  /**
   * Valida que haya suficientes datos para identificar un patrón
   * @param historial - Historial de registros
   * @returns Resultado de la validación
   */
  validarVolumenDatos(historial: RegistroAnimo[]): ResultadoValidacion {
    const dias = historial.length;
    
    // Contar días únicos en el historial
    const diasUnicos = new Set(
      historial.map((r) => new Date(r.fecha).toDateString())
    ).size;

    return {
      valid: dias >= this.limites.minimoRegistros && diasUnicos >= 3,
      motivo: 'Se necesitan más datos para identificar un patrón confiable',
    };
  }

  /**
   * Valida que el patrón sea consistente (no un día aislado)
   * @param historial - Historial de registros
   * @returns Resultado de la validación
   */
  validarConsistencia(historial: RegistroAnimo[]): ResultadoValidacion {
    // Verificar que el patrón sea consistente, no un día aislado
    const emociones = historial.map((r) => r.emocion);
    const conteo: Record<string, number> = emociones.reduce((acc, e) => {
      acc[e] = (acc[e] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const valores = Object.values(conteo);
    const max = Math.max(...valores);

    return {
      valid: max > 1,
      motivo: 'Los patrones necesitan consistencia para ser significativos',
    };
  }

  /**
   * Valida y enriquece el contexto
   * @param contexto - Contexto a validar
   * @returns Resultado de la validación con contexto enriquecido
   */
  validarContexto(contexto: any): ResultadoValidacion {
    // Considerar si hay eventos especiales, fines de semana, etc.
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const esFinDeSemana = diaSemana === 0 || diaSemana === 6;

    return {
      valid: true, // Siempre válido, pero con contexto
      motivo: 'Contexto considerado',
      contexto: esFinDeSemana ? 'Fin de semana' : 'Día laboral',
    };
  }

  /**
   * Valida que el lenguaje no sea victimizante o categorizante
   * @param mensaje - Mensaje a validar
   * @returns Resultado de la validación
   */
  validarLenguaje(mensaje: string): ResultadoValidacion {
    // Verificar que mensaje existe
    if (!mensaje || typeof mensaje !== 'string') {
      return {
        valid: true, // Si no hay mensaje, considerarlo válido
        motivo: 'Mensaje vacío o inválido',
      };
    }

    // Verificar que el lenguaje no sea victimizante
    const palabrasProhibidas = ['siempre', 'nunca', 'todo', 'nada', 'eres'];
    const contiene = palabrasProhibidas.some((p) =>
      mensaje.toLowerCase().includes(p)
    );

    return {
      valid: !contiene,
      motivo: 'El lenguaje debe ser descriptivo, no categorizante',
    };
  }

  /**
   * Reformula un mensaje para que sea más empático
   * @param mensajeOriginal - Mensaje original
   * @returns Mensaje reformulado
   */
  reformularMensaje(mensajeOriginal: string): string {
    // Verificar que mensaje existe
    if (!mensajeOriginal || typeof mensajeOriginal !== 'string') {
      return 'Gracias por compartir cómo te sientes.';
    }

    const reformulaciones: Record<string, string> = {
      siempre: 'a menudo',
      nunca: 'no siempre',
      todo: 'generalmente',
      nada: 'no todo',
      eres: 'sientes que',
    };

    let mensaje = mensajeOriginal;
    Object.keys(reformulaciones).forEach((palabra) => {
      mensaje = mensaje.replace(
        new RegExp(palabra, 'gi'),
        reformulaciones[palabra]
      );
    });

    return mensaje;
  }
}

export default PrevencionSesgos;