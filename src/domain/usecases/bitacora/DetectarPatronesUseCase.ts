// src/domain/usecases/bitacora/DetectarPatronesUseCase.ts

import { RegistroAnimo } from '../../entities/bitacora/RegistroAnimo';
import { IRegistroRepository } from '../../interfaces/IRegistroRepository';
import { PrevencionSesgos } from '../../../utils/bitacora/PrevencionSesgos';

// ============================================
//  DTOs (Data Transfer Objects) específicos de este Use Case
// ============================================

export interface AnalisisEmociones {
  feliz: number;
  tranquilo: number;
  neutral: number;
  triste: number;
  ansioso: number;
  molesto: number;
  felizPorcentaje?: number;
  tranquiloPorcentaje?: number;
  neutralPorcentaje?: number;
  tristePorcentaje?: number;
  ansiosoPorcentaje?: number;
  molestoPorcentaje?: number;
  total: number;
}

export interface AnalisisEnergia {
  promedio: number;
  tendencia: 'estable' | 'mejorando' | 'empeorando';
  variabilidad: number;
}

export interface CambioTendencia {
  emocion: string;
  cambio: number;
  direccion: 'aumento' | 'disminucion';
}

export interface Tendencias {
  cambios: CambioTendencia[];
  positiva: number;
}

export interface Alerta {
  tipo: string;
  nivel: 'bajo' | 'medio' | 'alto';
  mensaje: string;
  sugerencia: string;
  timestamp: string;
}

export interface Recomendacion {
  accion: string;
  detalle: string;
}

export interface AnalisisCompleto {
  alertas: Alerta[];
  resumen: string;
  recomendaciones: Recomendacion[];
  tieneAlertas: boolean;
}

// ============================================
// USE CASE
// ============================================

/**
 * Caso de uso: Detectar patrones emocionales
 * 
 * Analiza el historial de registros de ánimo para identificar
 * patrones y generar alertas tempranas.
 */
export class DetectarPatronesUseCase {
  private registroRepository: IRegistroRepository;

  constructor(registroRepository: IRegistroRepository) {
    this.registroRepository = registroRepository;
  }

  /**
   * Ejecuta el análisis de patrones
   */
  async execute(
    userId: string,
    registroActual: RegistroAnimo | null = null,
    historial: RegistroAnimo[] | null = null
  ): Promise<AnalisisCompleto> {
    // Si no se pasa historial, obtenerlo del repositorio
    if (!historial) {
      historial = await this.registroRepository.getRegistros(userId);
      historial = historial.sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
    }

    // Tomar últimos 14 días
    const historialReciente = historial.slice(0, 14);

    // 1. Análisis multi-factorial
    const analisis = {
      emociones: this.analizarEmociones(historialReciente),
      energia: this.analizarEnergia(historialReciente),
      tendencias: this.analizarTendencias(historialReciente),
      totalRegistros: historialReciente.length,
    };

    // 2. Evaluar con contexto
    const alertas = this.evaluarConContexto(analisis, registroActual);

    // 3. Validar alertas con prevención de sesgos
    const prevencion = new PrevencionSesgos();
    const alertasValidas = alertas.filter((alerta) =>
      prevencion.validarAlerta(alerta, historialReciente, {})
    );

    // 4. Reformular mensajes
    const alertasFinales = alertasValidas.map((alerta) => ({
      ...alerta,
      mensaje: prevencion.reformularMensaje(alerta.mensaje),
    }));

    return {
      alertas: alertasFinales,
      resumen: this.generarResumenEmpatico(alertasFinales, analisis),
      recomendaciones: this.generarRecomendaciones(alertasFinales),
      tieneAlertas: alertasFinales.length > 0,
    };
  }

  // ============================================
  // MÉTODOS PRIVADOS DE ANÁLISIS
  // ============================================

  private analizarEmociones(historial: RegistroAnimo[]): AnalisisEmociones {
    const conteo: AnalisisEmociones = {
      feliz: 0,
      tranquilo: 0,
      neutral: 0,
      triste: 0,
      ansioso: 0,
      molesto: 0,
      total: 0,
    };

    historial.forEach((r) => {
      const emocion = r.emocion as keyof AnalisisEmociones;
      if (conteo[emocion] !== undefined) {
        conteo[emocion]++;
      }
    });

    const total = historial.length || 1;
    return {
      ...conteo,
      total,
      felizPorcentaje: (conteo.feliz / total) * 100,
      tranquiloPorcentaje: (conteo.tranquilo / total) * 100,
      neutralPorcentaje: (conteo.neutral / total) * 100,
      tristePorcentaje: (conteo.triste / total) * 100,
      ansiosoPorcentaje: (conteo.ansioso / total) * 100,
      molestoPorcentaje: (conteo.molesto / total) * 100,
    };
  }

  private analizarEnergia(historial: RegistroAnimo[]): AnalisisEnergia {
    if (historial.length === 0) {
      return { promedio: 0, tendencia: 'estable', variabilidad: 0 };
    }

    const energias = historial.map((r) => r.energia || 5);
    const promedio = energias.reduce((a, b) => a + b, 0) / energias.length;

    let tendencia: 'estable' | 'mejorando' | 'empeorando' = 'estable';
    if (energias.length >= 3) {
      let subidas = 0;
      let bajadas = 0;
      for (let i = 1; i < energias.length; i++) {
        if (energias[i] > energias[i - 1]) subidas++;
        if (energias[i] < energias[i - 1]) bajadas++;
      }
      if (subidas > bajadas * 1.5) tendencia = 'mejorando';
      if (bajadas > subidas * 1.5) tendencia = 'empeorando';
    }

    const sumaDiferencias = energias.reduce(
      (a, b) => a + Math.pow(b - promedio, 2),
      0
    );
    const variabilidad = Math.sqrt(sumaDiferencias / energias.length);

    return { promedio, tendencia, variabilidad };
  }

  private analizarTendencias(historial: RegistroAnimo[]): Tendencias {
    if (historial.length < 4) {
      return { cambios: [], positiva: 0 };
    }

    const mitad = Math.floor(historial.length / 2);
    const primeraMitad = historial.slice(0, mitad);
    const segundaMitad = historial.slice(mitad);

    const emocionesPrimera = this.analizarEmociones(primeraMitad);
    const emocionesSegunda = this.analizarEmociones(segundaMitad);

    const cambios: CambioTendencia[] = [];
    const emocionesLista = ['feliz', 'tranquilo', 'triste', 'ansioso', 'molesto'];

    emocionesLista.forEach((emo) => {
      const diff =
        (emocionesSegunda[`${emo}Porcentaje` as keyof AnalisisEmociones] || 0) -
        (emocionesPrimera[`${emo}Porcentaje` as keyof AnalisisEmociones] || 0);
      if (Math.abs(diff) > 15) {
        cambios.push({
          emocion: emo,
          cambio: diff,
          direccion: diff > 0 ? 'aumento' : 'disminucion',
        });
      }
    });

    const positivasPrimera =
      (emocionesPrimera.felizPorcentaje || 0) +
      (emocionesPrimera.tranquiloPorcentaje || 0);
    const positivasSegunda =
      (emocionesSegunda.felizPorcentaje || 0) +
      (emocionesSegunda.tranquiloPorcentaje || 0);

    return { cambios, positiva: positivasSegunda - positivasPrimera };
  }

  // ============================================
  // EVALUACIÓN DE ALERTAS
  // ============================================

  private evaluarConContexto(
    analisis: {
      emociones: AnalisisEmociones;
      energia: AnalisisEnergia;
      tendencias: Tendencias;
      totalRegistros: number;
    },
    registroActual: RegistroAnimo | null
  ): Alerta[] {
    const alertas: Alerta[] = [];

    if (!registroActual || !registroActual.emocion) {
      return alertas;
    }

    // 1. Patrón de emociones negativas
    const negativas = ['triste', 'ansioso', 'molesto'];
    const porcentajeNegativas = negativas.reduce((acc, emo) => {
      return acc + (analisis.emociones[`${emo}Porcentaje` as keyof AnalisisEmociones] || 0);
    }, 0);

    if (porcentajeNegativas > 50 && analisis.totalRegistros >= 5) {
      alertas.push({
        tipo: 'patron_emocional',
        nivel: porcentajeNegativas > 70 ? 'alto' : 'medio',
        mensaje: `He notado que en el ${Math.round(porcentajeNegativas)}% de los días has registrado emociones desafiantes. Esto es parte de la experiencia humana y no te define. ¿Qué te gustaría hacer con esta información?`,
        sugerencia:
          'Recuerda que las emociones son pasajeras. Practicar la autocompasión puede ayudarte a manejarlas mejor.',
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Tendencia de energía
    if (
      analisis.energia.tendencia === 'empeorando' &&
      analisis.energia.promedio < 5 &&
      analisis.totalRegistros >= 5
    ) {
      alertas.push({
        tipo: 'energia',
        nivel: 'medio',
        mensaje:
          'Noto que tu energía ha ido disminuyendo gradualmente. Escuchar a tu cuerpo y descansar es importante.',
        sugerencia:
          '¿Has considerado hacer una pausa activa o practicar respiración profunda?',
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Cambios significativos en emociones
    analisis.tendencias.cambios.forEach((cambio) => {
      if (cambio.emocion === 'triste' && cambio.direccion === 'aumento' && cambio.cambio > 20) {
        alertas.push({
          tipo: 'cambio_emocional',
          nivel: 'medio',
          mensaje: `He notado un aumento en los días de tristeza. Es válido sentirse así. ¿Hay algo que te esté afectando?`,
          sugerencia:
            'Hablar con alguien de confianza puede ayudar a procesar estas emociones.',
          timestamp: new Date().toISOString(),
        });
      }
    });

    // 4. Ausencia de emociones positivas
    const positivas = ['feliz', 'tranquilo'];
    const porcentajePositivas = positivas.reduce((acc, emo) => {
      return acc + (analisis.emociones[`${emo}Porcentaje` as keyof AnalisisEmociones] || 0);
    }, 0);

    if (porcentajePositivas < 20 && analisis.totalRegistros > 5) {
      alertas.push({
        tipo: 'ausencia_positividad',
        nivel: 'medio',
        mensaje:
          'Hace tiempo que no registras emociones positivas. ¿Qué crees que podría ayudarte a conectar con momentos de bienestar?',
        sugerencia:
          'Intenta identificar pequeñas cosas que te generen alegría, por mínimas que sean.',
        timestamp: new Date().toISOString(),
      });
    }

    // 5. Patrón de ansiedad
    const ansiedadPorcentaje = analisis.emociones.ansiosoPorcentaje || 0;
    if (ansiedadPorcentaje > 30 && analisis.totalRegistros >= 5) {
      alertas.push({
        tipo: 'patron_ansiedad',
        nivel: ansiedadPorcentaje > 50 ? 'alto' : 'medio',
        mensaje:
          'La ansiedad es una respuesta natural del cuerpo. He notado que aparece con cierta frecuencia. ¿Qué te gustaría hacer para manejarla?',
        sugerencia:
          'La respiración profunda y el mindfulness pueden ayudar a regular la ansiedad.',
        timestamp: new Date().toISOString(),
      });
    }

    return alertas;
  }

  // ============================================
  // GENERACIÓN DE RESPUESTAS
  // ============================================

  private generarResumenEmpatico(
    alertas: Alerta[],
    analisis: {
      emociones: AnalisisEmociones;
      energia: AnalisisEnergia;
      tendencias: Tendencias;
      totalRegistros: number;
    }
  ): string {
    if (!alertas || alertas.length === 0) {
      return 'Gracias por compartir cómo te sientes. He notado que has estado en un rango emocional estable. Recuerda que todas las emociones son válidas y forman parte de la experiencia humana. 🌟';
    }

    if (alertas.length <= 2) {
      return 'He notado algunos patrones que podrían ser interesantes explorar. Recuerda que esto no te define, solo es información útil para tu bienestar. 💭';
    }

    return 'He observado varios patrones que podrían indicar que estás pasando por un momento complejo. Quiero que sepas que es normal y que tienes herramientas para manejarlo. 🌱';
  }

  private generarRecomendaciones(alertas: Alerta[]): Recomendacion[] {
    const recomendaciones: Recomendacion[] = [];
    const accionesRealizadas = new Set<string>();

    alertas.forEach((alerta) => {
      switch (alerta.tipo) {
        case 'patron_emocional':
          if (!accionesRealizadas.has('autocompasion')) {
            recomendaciones.push({
              accion: 'Practicar autocompasión',
              detalle:
                'Recuerda que tener emociones desafiantes es parte de ser humano. Date permiso para sentir.',
            });
            accionesRealizadas.add('autocompasion');
          }
          break;
        case 'energia':
          if (!accionesRealizadas.has('energia')) {
            recomendaciones.push({
              accion: 'Cuidar tu energía',
              detalle:
                'Considera incorporar pequeños descansos en tu día y priorizar actividades que te recarguen.',
            });
            accionesRealizadas.add('energia');
          }
          break;
        case 'patron_ansiedad':
          if (!accionesRealizadas.has('respiracion')) {
            recomendaciones.push({
              accion: 'Técnicas de respiración',
              detalle:
                'Prueba la técnica 4-7-8: inhala 4s, retén 7s, exhala 8s. Repite 3 veces.',
            });
            accionesRealizadas.add('respiracion');
          }
          break;
        case 'ausencia_positividad':
          if (!accionesRealizadas.has('alegria')) {
            recomendaciones.push({
              accion: 'Cultivar momentos de alegría',
              detalle:
                'Intenta identificar 3 cosas pequeñas que te generen bienestar cada día.',
            });
            accionesRealizadas.add('alegria');
          }
          break;
        case 'cambio_emocional':
          if (!accionesRealizadas.has('apoyo')) {
            recomendaciones.push({
              accion: 'Buscar apoyo',
              detalle:
                'Hablar con alguien de confianza puede ayudarte a procesar lo que estás sintiendo.',
            });
            accionesRealizadas.add('apoyo');
          }
          break;
      }
    });

    return recomendaciones;
  }
}

export default DetectarPatronesUseCase;