
import { EMOCIONES_DATA, COLORS } from '../../../../constants/colors';

interface EmocionData {
  id: string;
  label: string;
  color: string;
  image: any;
  emoji: string;
}

/**
 * Entidad de Emoción
 * Contiene la lógica de negocio relacionada con las emociones
 */
export class Emocion {
  id: string;
  label: string;
  color: string;
  image: any;
  emoji: string;
  createdAt: Date;

  /**
   * Constructor de una emoción
   * @param {EmocionData} data - Datos de la emoción
   */
  constructor({ id, label, color, image, emoji }: EmocionData) {
    this.id = id;
    this.label = label;
    this.color = color;
    this.image = image;
    this.emoji = emoji;
    this.createdAt = new Date();
  }

  /**
   * Obtiene el color de la emoción
   * @returns {string} Color en hex
   */
  getColor(): string {
    return this.color || COLORS.gray[400];
  }

  /**
   * Obtiene el label formateado
   * @returns {string} Label con primera letra mayúscula
   */
  getFormattedLabel(): string {
    return this.label.charAt(0).toUpperCase() + this.label.slice(1);
  }

  /**
   * Verifica si la emoción es positiva
   * @returns {boolean}
   */
  isPositive(): boolean {
    return ['feliz', 'tranquilo'].includes(this.id);
  }

  /**
   * Verifica si la emoción es negativa
   * @returns {boolean}
   */
  isNegative(): boolean {
    return ['triste', 'ansioso', 'molesto'].includes(this.id);
  }

  /**
   * Obtiene el nivel de energía recomendado para esta emoción
   * @returns {string} 'low', 'medium', 'high'
   */
  getEnergyLevel(): 'low' | 'medium' | 'high' {
    const energyMap: Record<string, 'low' | 'medium' | 'high'> = {
      feliz: 'high',
      tranquilo: 'medium',
      neutral: 'medium',
      triste: 'low',
      ansioso: 'high',
      molesto: 'high',
    };
    return energyMap[this.id] || 'medium';
  }

  /**
   * Convierte la entidad a un objeto plano
   * @returns {Object}
   */
  toJSON(): EmocionData {
    return {
      id: this.id,
      label: this.label,
      color: this.color,
      image: this.image,
      emoji: this.emoji,
    };
  }

  /**
   * Obtiene todas las emociones disponibles
   * @returns {Emocion[]} Array de instancias de Emocion
   */
  static getAll(): Emocion[] {
    return EMOCIONES_DATA.map((data: EmocionData) => new Emocion(data));
  }

  /**
   * Obtiene una emoción por su ID
   * @param {string} id - ID de la emoción
   * @returns {Emocion|null} Instancia de Emocion o null
   */
  static getById(id: string): Emocion | null {
    const data = EMOCIONES_DATA.find((e: EmocionData) => e.id === id);
    return data ? new Emocion(data) : null;
  }

  /**
   * Obtiene el color de una emoción por su ID
   * @param {string} id - ID de la emoción
   * @returns {string} Color en hex
   */
  static getColorById(id: string): string {
    const emotion = EMOCIONES_DATA.find((e: EmocionData) => e.id === id);
    return emotion ? emotion.color : COLORS.gray[400];
  }

  /**
   * Obtiene la imagen de una emoción por su ID
   * @param {string} id - ID de la emoción
   * @returns {any} Imagen require o null
   */
  static getImageById(id: string): any {
    const emotion = EMOCIONES_DATA.find((e: EmocionData) => e.id === id);
    return emotion ? emotion.image : null;
  }

  /**
   * Obtiene el emoji de una emoción por su ID
   * @param {string} id - ID de la emoción
   * @returns {string} Emoji
   */
  static getEmojiById(id: string): string {
    const emotion = EMOCIONES_DATA.find((e: EmocionData) => e.id === id);
    return emotion ? emotion.emoji : '🤔';
  }

  /**
   * Obtiene el label de una emoción por su ID
   * @param {string} id - ID de la emoción
   * @returns {string} Label de la emoción
   */
  static getLabelById(id: string): string {
    const emotion = EMOCIONES_DATA.find((e: EmocionData) => e.id === id);
    return emotion ? emotion.label : 'Desconocido';
  }

  /**
   * Obtiene solo las emociones positivas
   * @returns {Emocion[]}
   */
  static getPositive(): Emocion[] {
    return EMOCIONES_DATA
      .filter((e: EmocionData) => ['feliz', 'tranquilo'].includes(e.id))
      .map((data: EmocionData) => new Emocion(data));
  }

  /**
   * Obtiene solo las emociones negativas
   * @returns {Emocion[]}
   */
  static getNegative(): Emocion[] {
    return EMOCIONES_DATA
      .filter((e: EmocionData) => ['triste', 'ansioso', 'molesto'].includes(e.id))
      .map((data: EmocionData) => new Emocion(data));
  }

  /**
   * Obtiene el mapa de colores para el calendario
   * @returns {Record<string, string>} { id: color }
   */
  static getColorMap(): Record<string, string> {
    return EMOCIONES_DATA.reduce((acc: Record<string, string>, e: EmocionData) => {
      acc[e.id] = e.color;
      return acc;
    }, {});
  }

  /**
   * Obtiene el mapa de imágenes para el calendario
   * @returns {Record<string, any>} { id: image }
   */
  static getImageMap(): Record<string, any> {
    return EMOCIONES_DATA.reduce((acc: Record<string, any>, e: EmocionData) => {
      acc[e.id] = e.image;
      return acc;
    }, {});
  }

  /**
   * Obtiene el mapa de emojis para el calendario
   * @returns {Record<string, string>} { id: emoji }
   */
  static getEmojiMap(): Record<string, string> {
    return EMOCIONES_DATA.reduce((acc: Record<string, string>, e: EmocionData) => {
      acc[e.id] = e.emoji;
      return acc;
    }, {});
  }
}

export default Emocion;