import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Header } from '../../shared/header/header';
import { IndicadorPasos } from '../indicador-pasos/indicador-pasos';
import { DenunciaService, EvidenciaArchivo } from '../../services/denuncia.service';

const TAMANO_MAXIMO_ARCHIVO = 10 * 1024 * 1024;
const EXTENSIONES_PERMITIDAS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mov', 'avi', 'pdf', 'doc', 'docx', 'txt']);
const TIPOS_PERMITIDOS = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

@Component({
  standalone: true,
  imports: [CommonModule, Header, IndicadorPasos],
  selector: 'app-evidencia',
  styleUrl: './evidencia.css',
  templateUrl: './evidencia.html',
})
export class Evidencia implements OnInit {
  readonly tamanoMaximoArchivo = TAMANO_MAXIMO_ARCHIVO;
  archivos: EvidenciaArchivo[] = [];
  mensajeError: string | null = null;

  constructor(private router: Router, private denunciaService: DenunciaService) {}

  ngOnInit(): void {
    const estado = this.denunciaService.obtenerEstado();
    if (estado.evidencias) {
      this.archivos = [...estado.evidencias];
    }
  }

  seleccionarArchivos(event: Event): void {
    const input = event.target as HTMLInputElement;
    try {
      const archivosSeleccionados = Array.from(input.files ?? []);
      const archivosValidos: EvidenciaArchivo[] = [];
      const errores: string[] = [];

      for (const archivo of archivosSeleccionados) {
        const extension = archivo.name.split('.').pop()?.toLowerCase() ?? '';
        const formatoValido = EXTENSIONES_PERMITIDAS.has(extension) && TIPOS_PERMITIDOS.has(archivo.type);

        if (!formatoValido) {
          errores.push(`"${archivo.name}" tiene un formato no válido.`);
          continue;
        }

        if (archivo.size > TAMANO_MAXIMO_ARCHIVO) {
          errores.push(`"${archivo.name}" es demasiado grande. El tamaño máximo permitido es de 10 MB.`);
          continue;
        }

        if (!this.archivos.some((archivoActual) => archivoActual.nombre === archivo.name && archivoActual.tamano === archivo.size)) {
          archivosValidos.push({ nombre: archivo.name, tamano: archivo.size, tipo: archivo.type });
        }
      }

      this.archivos = [...this.archivos, ...archivosValidos];
      this.mensajeError = errores.length > 0 ? errores.join(' ') : null;
    } catch {
      this.mensajeError = 'Ocurrió un error inesperado al cargar el archivo. Intente nuevamente.';
    } finally {
      input.value = '';
    }
  }

  eliminarArchivo(archivoAEliminar: EvidenciaArchivo): void {
    this.archivos = this.archivos.filter((archivo) => archivo !== archivoAEliminar);
    this.mensajeError = null;
  }

  avanzarSiguientePaso(): void {
    if (this.archivos.length === 0) {
      this.mensajeError = 'Adjunte al menos un archivo válido para continuar.';
      return;
    }

    this.denunciaService.guardarEvidencias(this.archivos);
    this.router.navigate(['/denuncia/resumen']);
  }

  volver(): void {
    this.router.navigate(['/denuncia/localizacion']);
  }
}
