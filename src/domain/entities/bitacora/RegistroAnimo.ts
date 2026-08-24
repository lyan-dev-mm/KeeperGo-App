// src/domain/entities/RegistroAnimo.ts

interface RegistroAnimoProps {
  id?: string;
  userId: string;
  fecha: Date;
  emocion: string;
  emocionLabel?: string;
  color?: string;
  energia: number;
  energiaLabel?: string;
  nota?: string;
  sintomas?: string[];
  actividades?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  reflection?: string;
  latitud?: number;
  longitud?: number;
}

export class RegistroAnimo {
  // PROPIEDADES DE LA CLASE
  id: string;
  userId: string;
  fecha: Date;
  emocion: string;
  emocionLabel: string;
  color: string;
  energia: number;
  energiaLabel: string;
  nota: string;
  sintomas: string[];
  actividades: string[];
  createdAt: Date;
  updatedAt: Date;
  reflection: string;
  latitud?: number;
  longitud?: number;

  constructor({
    id,
    userId,
    fecha,
    emocion,
    emocionLabel = '',
    color = '#9CA3AF',  
    energia,
    energiaLabel = '',
    nota = '',
    sintomas = [],
    actividades = [],
    createdAt,
    updatedAt,
    reflection = '',
    latitud,
    longitud,
  }: RegistroAnimoProps) {
    
    this.id = id || `reg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.userId = userId;
    this.fecha = fecha;
    this.emocion = emocion;
    this.emocionLabel = emocionLabel;
    this.color = color;
    this.energia = energia;
    this.energiaLabel = energiaLabel;
    this.nota = nota;
    this.sintomas = sintomas;
    this.actividades = actividades;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
    this.reflection = reflection;
    this.latitud = latitud;
    this.longitud = longitud;
  }

  // MÉTODOS

  isValid(): boolean {
    return (
      !!this.userId &&
      !!this.emocion &&
      this.energia >= 1 &&
      this.energia <= 10 &&
      !!this.fecha
    );
  }

  getEmocionFormateada(): string {
    return this.emocionLabel || this.emocion.charAt(0).toUpperCase() + this.emocion.slice(1);
  }

  getNivelEnergia(): string {
    if (this.energia <= 3) return 'Baja';
    if (this.energia <= 6) return 'Media';
    return 'Alta';
  }

  getColor(): string {
    return this.color || '#9CA3AF';
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      fecha: typeof this.fecha === 'string' ? this.fecha : this.fecha.toISOString(),
      emocion: this.emocion,
      emocionLabel: this.emocionLabel,
      color: this.color,
      energia: this.energia,
      energiaLabel: this.energiaLabel,
      nota: this.nota,
      sintomas: this.sintomas,
      actividades: this.actividades,
      createdAt: typeof this.createdAt === 'string' ? this.createdAt : this.createdAt.toISOString(),
      updatedAt: typeof this.updatedAt === 'string' ? this.updatedAt : this.updatedAt.toISOString(),
      reflection: this.reflection,
      latitud: this.latitud,
      longitud: this.longitud,
    };
  }

  static fromJSON(data: any): RegistroAnimo {
    return new RegistroAnimo({
      ...data,
      fecha: new Date(data.fecha),
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
    });
  }
}

export default RegistroAnimo;