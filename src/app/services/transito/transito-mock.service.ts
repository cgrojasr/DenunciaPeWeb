import { Injectable } from '@angular/core';

export interface TipoInfraccion {
  codigo: string;
  nombre: string;
}

export interface DatosInfraccion {
  tipo: string;
  otroTipo: string;
  fecha: string;
  hora: string;
  descripcion: string;
  placa: string;
  marca: string;
  modelo: string;
  color: string;
  observaciones: string;
}

const CLAVE_BORRADOR = 'denunciaTransito.borrador';

@Injectable({ providedIn: 'root' })
export class TransitoMockService {
  obtenerTipos(): TipoInfraccion[] {
    return [
      { codigo: 'estacionamiento', nombre: 'Estacionamiento indebido' },
      { codigo: 'semaforo', nombre: 'Desobedecer un semáforo' },
      { codigo: 'velocidad', nombre: 'Exceso de velocidad' },
      { codigo: 'otro', nombre: 'Otro' },
    ];
  }

  obtenerBorrador(): DatosInfraccion | null {
    const borrador = sessionStorage.getItem(CLAVE_BORRADOR);
    return borrador ? JSON.parse(borrador) : null;
  }

  guardarBorrador(datos: DatosInfraccion): void {
    sessionStorage.setItem(CLAVE_BORRADOR, JSON.stringify(datos));
  }

  descartarBorrador(): void {
    sessionStorage.removeItem(CLAVE_BORRADOR);
  }
}
