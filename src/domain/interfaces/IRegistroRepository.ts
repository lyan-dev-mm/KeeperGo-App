import { RegistroAnimo } from '../entities/bitacora/RegistroAnimo';

export interface IRegistroRepository {
  getRegistros(userId: string): Promise<RegistroAnimo[]>;
  getRegistroById(id: string): Promise<RegistroAnimo | null>;
  saveRegistro(registro: RegistroAnimo): Promise<RegistroAnimo>;
  deleteRegistro(id: string): Promise<boolean>;
  getRegistrosPorFecha(
    userId: string,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<RegistroAnimo[]>;

  getRegistroPorFecha(userId: string, fecha: Date): Promise<RegistroAnimo | null>;
  getRegistrosPorMes?(userId: string, year: number, month: number): Promise<RegistroAnimo[]>;
  deleteAllRegistros?(userId: string): Promise<boolean>;
  syncRegistros?(userId: string): Promise<{ sincronizados: number; errores: number }>;
}

    

export default IRegistroRepository;