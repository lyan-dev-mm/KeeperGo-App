import { RegistroAnimo } from '../../entities/bitacora/RegistroAnimo';
import { IRegistroRepository } from '../../interfaces/IRegistroRepository';
import { PrevencionSesgos } from '../../../domain/utils/PrevencionSesgos';

//  DTOs (Data Transfer Objects) específicos de este Use Case

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
  // Marca la recomendación de buscar apoyo profesional para que la UI
  // pueda destacarla por separado (ej. como una tarjeta CTA) en vez de
  // mezclarla con el resto de sugerencias.
  prioritaria?: boolean;
}

export interface AnalisisCompleto {
  alertas: Alerta[];
  resumen: string;
  recomendaciones: Recomendacion[];
  tieneAlertas: boolean;
  // true si existe al menos una alerta de nivel 'alto': señal para que la UI
  // muestre el directorio de profesionales de salud mental.
  requiereProfesional: boolean;
}

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
   *
   * NOTA: `registroActual` ya no es un requisito para que el análisis corra.
   * Antes, si no había un registro recién guardado, `evaluarPatrones` cortaba
   * de inmediato y nunca se generaban alertas. Eso significaba que si el
   * usuario solo abría la Bitácora (sin registrar), un patrón de riesgo
   * existente en su historial no se mostraba. Ahora el análisis siempre se
   * ejecuta sobre `historialReciente`, haciendo el mecanismo realmente
   * preventivo y persistente, no solo reactivo a un guardado.
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

    // Tomar últimos 14 días (el arreglo queda reciente -> antiguo)
    const historialReciente = historial.slice(0, 14);

    // 1. Análisis multi-factorial
    const analisis = {
      emociones: this.analizarEmociones(historialReciente),
      energia: this.analizarEnergia(historialReciente),
      tendencias: this.analizarTendencias(historialReciente),
      totalRegistros: historialReciente.length,
    };

    // 2. Evaluar patrones (ya no depende de que exista un registroActual)
    const alertas = this.evaluarPatrones(analisis);

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

    const requiereProfesional = alertasFinales.some((a) => a.nivel === 'alto');

    return {
      alertas: alertasFinales,
      resumen: this.generarResumenEmpatico(alertasFinales, analisis),
      recomendaciones: this.generarRecomendaciones(alertasFinales, requiereProfesional),
      tieneAlertas: alertasFinales.length > 0,
      requiereProfesional,
    };
  }

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

    // `historial` viene reciente -> antiguo (hoy en el índice 0). Para medir
    // una tendencia en el tiempo necesitamos recorrerlo en orden cronológico
    // (antiguo -> reciente); antes se recorría en el orden original y la
    // tendencia salía invertida (ver conversación previa).
    const energias = historial.map((r) => r.energia || 5);
    const energiasCronologicas = [...energias].reverse();

    const promedio = energias.reduce((a, b) => a + b, 0) / energias.length;

    let tendencia: 'estable' | 'mejorando' | 'empeorando' = 'estable';
    if (energiasCronologicas.length >= 3) {
      let subidas = 0;
      let bajadas = 0;
      for (let i = 1; i < energiasCronologicas.length; i++) {
        if (energiasCronologicas[i] > energiasCronologicas[i - 1]) subidas++;
        if (energiasCronologicas[i] < energiasCronologicas[i - 1]) bajadas++;
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

    // Igual que en analizarEnergia: `historial` viene reciente -> antiguo,
    // así que la primera mitad del arreglo es en realidad el período MÁS
    // RECIENTE y la segunda mitad el período ANTERIOR. Se renombran las
    // variables para que la resta (reciente - anterior) refleje realmente
    // "qué tanto cambió el patrón últimamente", que es lo que se quiere medir.
    const mitad = Math.floor(historial.length / 2);
    const reciente = historial.slice(0, mitad);
    const anterior = historial.slice(mitad);

    const emocionesReciente = this.analizarEmociones(reciente);
    const emocionesAnterior = this.analizarEmociones(anterior);

    const cambios: CambioTendencia[] = [];
    const emocionesLista = ['feliz', 'tranquilo', 'triste', 'ansioso', 'molesto'];

    emocionesLista.forEach((emo) => {
      const diff =
        (emocionesReciente[`${emo}Porcentaje` as keyof AnalisisEmociones] || 0) -
        (emocionesAnterior[`${emo}Porcentaje` as keyof AnalisisEmociones] || 0);
      if (Math.abs(diff) > 15) {
        cambios.push({
          emocion: emo,
          cambio: diff,
          direccion: diff > 0 ? 'aumento' : 'disminucion',
        });
      }
    });

    const positivasReciente =
      (emocionesReciente.felizPorcentaje || 0) +
      (emocionesReciente.tranquiloPorcentaje || 0);
    const positivasAnterior =
      (emocionesAnterior.felizPorcentaje || 0) +
      (emocionesAnterior.tranquiloPorcentaje || 0);

    return { cambios, positiva: positivasReciente - positivasAnterior };
  }

  private evaluarPatrones(analisis: {
    emociones: AnalisisEmociones;
    energia: AnalisisEnergia;
    tendencias: Tendencias;
    totalRegistros: number;
  }): Alerta[] {
    const alertas: Alerta[] = [];

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
      return 'Gracias por compartir cómo te sientes. He notado que has estado en un rango emocional estable. Recuerda que todas las emociones son válidas y forman parte de la experiencia humana.';
    }

    if (alertas.length <= 2) {
      return 'He notado algunos patrones que podrían ser interesantes explorar. Recuerda que esto no te define, solo es información útil para tu bienestar.';
    }

    return 'He observado varios patrones que podrían indicar que estás pasando por un momento complejo. Quiero que sepas que es normal y que tienes herramientas para manejarlo. ';
  }

  private generarRecomendaciones(
    alertas: Alerta[],
    requiereProfesional: boolean
  ): Recomendacion[] {
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

    // Si al menos una alerta es de nivel 'alto', se antepone una
    // recomendación explícita de buscar apoyo profesional, marcada como
    // prioritaria para que la UI la muestre como un CTA destacado y no
    // mezclada entre el resto de sugerencias.
    if (requiereProfesional && !accionesRealizadas.has('profesional')) {
      recomendaciones.unshift({
        accion: 'Buscar apoyo profesional',
        detalle:
          'Varias señales sugieren que hablar con un profesional de salud mental podría ayudarte. Puedes ver especialistas cercanos a ti en el directorio de la app.',
        prioritaria: true,
      });
      accionesRealizadas.add('profesional');
    }

    return recomendaciones;
  }
}

export default DetectarPatronesUseCase;