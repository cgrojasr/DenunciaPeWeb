import { Injectable } from '@angular/core';

export interface DatosDenunciante {
  nombres: string;
  apellidos: string;
  documento: string;
}

export interface DatosContacto {
  telefono: string;
  direccion: string;
  distrito: string;
  provincia: string;
  region: string;
}

export interface DatosIncidente {
  fecha: string;
  hora: string;
}

export interface DatosLugar {
  referencia: string;
}

export interface DatosDenunciado {
  nombreOApodo?: string;
  caracteristicas?: string;
}

export interface UbicacionIncidente {
  latitud: number | null;
  longitud: number | null;
  direccion: string;
  referenciaAdicional?: string;
}

export interface EvidenciaArchivo {
  nombre: string;
  tamano: number;
  tipo: string;
}

export interface EstadoDenuncia {
  denunciante?: DatosDenunciante;
  contacto?: DatosContacto;
  narracion?: string;
  incidente?: DatosIncidente;
  lugar?: DatosLugar;
  denunciado?: DatosDenunciado;
  ubicacion?: UbicacionIncidente;
  evidencias?: EvidenciaArchivo[];
}

@Injectable({
  providedIn: 'root',
})
export class DenunciaService {
  private estado: EstadoDenuncia = {};

  guardarDatosIniciales(datos: Partial<EstadoDenuncia>): void {
    this.estado = {
      ...this.estado,
      ...datos,
    };
  }

  guardarUbicacion(ubicacion: UbicacionIncidente): void {
    this.estado = {
      ...this.estado,
      ubicacion,
    };
  }

  guardarEvidencias(evidencias: EvidenciaArchivo[]): void {
    this.estado = {
      ...this.estado,
      evidencias,
    };
  }

  obtenerEstado(): EstadoDenuncia {
    return { ...this.estado };
  }

  obtenerUbicacion(): UbicacionIncidente | undefined {
    return this.estado.ubicacion;
  }

  limpiar(): void {
    this.estado = {};
  }
}
