import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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

export interface DenunciaResumen {
  id: number;
  fechaDenuncia: string;
  idTipoDenuncia: number | null;
  referencia?: string | null;
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
    return this.http
      .post<{ id: number }>(`${environment.apiUrl}/denuncias`, this.construirSolicitud(estado))
      .pipe(map((respuesta) => ({ numeroDenuncia: String(respuesta.id) })));
  }

  private construirSolicitud(estado: EstadoDenuncia) {
    const documento = estado.denunciante?.documento ?? '';
    const fechaIncidente = new Date(`${estado.incidente?.fecha}T${estado.incidente?.hora}`);

    return {
      fechaDenuncia: new Date().toISOString(),
      narracion: estado.narracion,
      denunciante: {
        tipoDocumento: /^\d{8}$/.test(documento) ? 'DNI' : 'CE',
        nroDocumento: documento,
        nombres: estado.denunciante?.nombres,
        apellidos: estado.denunciante?.apellidos,
        nroTelefono: estado.contacto?.telefono,
        direccion: estado.contacto?.direccion,
        ubigeo: estado.contacto?.distrito,
      },
      denunciado: {
        nombreApelativo: estado.denunciado?.nombreOApodo || null,
        caracteristica: estado.denunciado?.caracteristicas || null,
      },
      incidente: {
        fechaIncidente: fechaIncidente.toISOString(),
        ubigeoIncidente: estado.contacto?.distrito,
        direccionIncidente: estado.ubicacion?.direccion,
        latitud: String(estado.ubicacion?.latitud ?? ''),
        longitud: String(estado.ubicacion?.longitud ?? ''),
        referencia: estado.lugar?.referencia,
      },
      evidencias: (estado.evidencias ?? []).map((e) => ({
        nombreArchivo: e.nombre,
        url: `archivo://${encodeURIComponent(e.nombre)}`,
      })),
    };
  }

  obtenerPorNroDocumento(nroDocumento: string): Observable<DenunciaResumen[]> {
    return this.http.get<DenunciaResumen[]>(
      `${environment.apiUrl}/denuncias/denunciante/${encodeURIComponent(nroDocumento)}`,
    );
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
