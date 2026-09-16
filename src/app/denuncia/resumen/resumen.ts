import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { Header } from '../../shared/header/header';
import { IndicadorPasos } from '../indicador-pasos/indicador-pasos';
import { DenunciaService, EstadoDenuncia } from '../../services/denuncia.service';
import { environment } from '../../../environments/environment';

export interface CamposInvalidos {
  denunciante: boolean;
  contacto: boolean;
  narracion: boolean;
  incidente: boolean;
  lugar: boolean;
  ubicacion: boolean;
  evidencias: boolean;
}

interface RespuestaEnvioDenuncia {
  numeroDenuncia: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, Header, IndicadorPasos],
  selector: 'app-resumen',
  styleUrl: './resumen.css',
  templateUrl: './resumen.html',
})
export class Resumen implements OnInit {
  estado: EstadoDenuncia = {};
  errores: string[] = [];
  camposInvalidos: CamposInvalidos = {
    denunciante: false,
    contacto: false,
    narracion: false,
    incidente: false,
    lugar: false,
    ubicacion: false,
    evidencias: false,
  };
  enviando = false;
  errorEnvio: string | null = null;
  enviado = false;
  numeroDenuncia: string | null = null;

  constructor(
    private denunciaService: DenunciaService,
    private router: Router,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.estado = this.denunciaService.obtenerEstado();
    const resultado = this.validarEstado(this.estado);
    this.errores = resultado.errores;
    this.camposInvalidos = resultado.camposInvalidos;
  }

  get esValido(): boolean {
    return this.errores.length === 0;
  }

  // Verifica presencia y formato de cada campo obligatorio y señala qué sección afecta cada error
  private validarEstado(estado: EstadoDenuncia): { errores: string[]; camposInvalidos: CamposInvalidos } {
    const errores: string[] = [];
    const camposInvalidos: CamposInvalidos = {
      denunciante: false,
      contacto: false,
      narracion: false,
      incidente: false,
      lugar: false,
      ubicacion: false,
      evidencias: false,
    };

    const denunciante = estado.denunciante;
    if (!denunciante?.nombres?.trim() || !denunciante?.apellidos?.trim() || !denunciante?.documento?.trim()) {
      errores.push('Los datos del denunciante están incompletos.');
      camposInvalidos.denunciante = true;
    }

    const contacto = estado.contacto;
    if (!contacto?.telefono || !/^[0-9]{9}$/.test(contacto.telefono)) {
      errores.push('El número telefónico de contacto no tiene un formato válido (9 dígitos).');
      camposInvalidos.contacto = true;
    }
    if (!contacto?.direccion?.trim()) {
      errores.push('La dirección de contacto es obligatoria.');
      camposInvalidos.contacto = true;
    }
    if (!contacto?.region || !contacto?.provincia || !contacto?.distrito) {
      errores.push('La región, provincia y distrito de contacto son obligatorios.');
      camposInvalidos.contacto = true;
    }

    if (!estado.narracion || estado.narracion.trim().length < 20) {
      errores.push('La narración de los hechos debe tener al menos 20 caracteres.');
      camposInvalidos.narracion = true;
    }

    if (!estado.incidente?.fecha) {
      errores.push('La fecha del incidente es obligatoria.');
      camposInvalidos.incidente = true;
    }
    if (!estado.incidente?.hora) {
      errores.push('La hora del incidente es obligatoria.');
      camposInvalidos.incidente = true;
    }

    if (!estado.lugar?.referencia?.trim()) {
      errores.push('La referencia del lugar del suceso es obligatoria.');
      camposInvalidos.lugar = true;
    }

    if (!estado.ubicacion?.direccion?.trim()) {
      errores.push('La ubicación del incidente en el mapa es obligatoria.');
      camposInvalidos.ubicacion = true;
    }

    if (!estado.evidencias || estado.evidencias.length === 0) {
      errores.push('Debe adjuntar al menos una evidencia.');
      camposInvalidos.evidencias = true;
    }

    return { errores, camposInvalidos };
  }

  volver(): void {
    this.router.navigate(['/denuncia/evidencia']);
  }

  enviarDenuncia(): void {
    if (!this.esValido || this.enviando) {
      return;
    }

    this.enviando = true;
    this.errorEnvio = null;

    this.http
      .post<RespuestaEnvioDenuncia>(`${environment.apiUrl}/denuncias`, this.estado)
      .pipe(catchError(() => of(null)))
      .subscribe((respuesta) => {
        this.enviando = false;

        if (!respuesta) {
          this.errorEnvio = 'No se pudo enviar la denuncia. Verifique su conexión e intente nuevamente.';
          return;
        }

        this.numeroDenuncia = respuesta.numeroDenuncia;
        this.enviado = true;
        this.denunciaService.limpiar();
      });
  }

  irAInicio(): void {
    this.router.navigate(['/home']);
  }
}

