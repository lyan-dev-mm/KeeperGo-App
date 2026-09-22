// src/domain/entities/piloto/PilotoStatus.ts

export interface PilotoStatusProps {
  userId: string;
  completado: boolean;
  fechaInicio: Date | null;
  fechaCierre: Date | null;
  version: string;
}

export class PilotoStatus {
  userId: string;
  completado: boolean;
  fechaInicio: Date | null;
  fechaCierre: Date | null;
  version: string;

  constructor({
    userId,
    completado,
    fechaInicio,
    fechaCierre,
    version,
  }: PilotoStatusProps) {
    this.userId = userId;
    this.completado = completado;
    this.fechaInicio = fechaInicio;
    this.fechaCierre = fechaCierre;
    this.version = version;
  }

  toJSON() {
    return {
      userId: this.userId,
      completado: this.completado,
      fechaInicio: this.fechaInicio?.toISOString() ?? null,
      fechaCierre: this.fechaCierre?.toISOString() ?? null,
      version: this.version,
    };
  }

  static fromJSON(data: any): PilotoStatus {
    return new PilotoStatus({
      userId: data.userId,
      completado: data.completado,
      fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : null,
      fechaCierre: data.fechaCierre ? new Date(data.fechaCierre) : null,
      version: data.version,
    });
  }
}