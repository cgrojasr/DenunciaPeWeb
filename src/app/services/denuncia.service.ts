import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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

export interface RespuestaEnvioDenuncia {
  numeroDenuncia?: string;
}

export interface ResultadoEnvioDenuncia {
  numeroDenuncia: string | null;
  fechaRegistro: string;
}

@Injectable({
  providedIn: 'root',
})
export class DenunciaService {
  private estado: EstadoDenuncia = {};
  private resultadoEnvio: ResultadoEnvioDenuncia | null = null;

  constructor(private http: HttpClient) {}

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

  enviarDenuncia(estado: EstadoDenuncia): Observable<RespuestaEnvioDenuncia> {
    return this.http.post<RespuestaEnvioDenuncia>(`${environment.apiUrl}/denuncias`, estado);
  }

  guardarResultadoEnvio(resultado: ResultadoEnvioDenuncia): void {
    this.resultadoEnvio = resultado;
  }

  obtenerResultadoEnvio(): ResultadoEnvioDenuncia | null {
    return this.resultadoEnvio ? { ...this.resultadoEnvio } : null;
  }

  limpiarResultadoEnvio(): void {
    this.resultadoEnvio = null;
  }
}
