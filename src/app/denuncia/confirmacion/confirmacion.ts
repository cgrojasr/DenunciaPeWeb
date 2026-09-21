import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { Header } from '../../shared/header/header';
import { DenunciaService, ResultadoEnvioDenuncia } from '../../services/denuncia.service';

@Component({
  standalone: true,
  imports: [CommonModule, Header],
  selector: 'app-confirmacion',
  styleUrl: './confirmacion.css',
  templateUrl: './confirmacion.html',
})
export class Confirmacion implements OnInit {
  numeroDenuncia: string | null = null;
  fechaRegistro: Date | null = null;
  errorNumero = false;
  errorInesperado = false;
  reintentando = false;

  constructor(
    private denunciaService: DenunciaService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.cargarConfirmacion();
  }

  get exito(): boolean {
    return !!this.numeroDenuncia;
  }

  cargarConfirmacion(): void {
    this.errorInesperado = false;
    try {
      const resultado = this.denunciaService.obtenerResultadoEnvio();
      if (!resultado) {
        this.errorInesperado = true;
        return;
      }
      this.procesarResultado(resultado);
    } catch {
      this.errorInesperado = true;
    }
  }

  reintentar(): void {
    if (this.reintentando) {
      return;
    }

    this.reintentando = true;
    this.errorInesperado = false;

    const estado = this.denunciaService.obtenerEstado();

    this.denunciaService
      .enviarDenuncia(estado)
      .pipe(catchError(() => of(null)))
      .subscribe((respuesta) => {
        this.reintentando = false;

        if (!respuesta) {
          this.errorInesperado = true;
          this.errorNumero = false;
          return;
        }

        const resultado: ResultadoEnvioDenuncia = {
          numeroDenuncia: respuesta.numeroDenuncia ?? null,
          fechaRegistro: new Date().toISOString(),
        };

        this.denunciaService.guardarResultadoEnvio(resultado);
        this.procesarResultado(resultado);

        if (resultado.numeroDenuncia) {
          this.denunciaService.limpiar();
        }
      });
  }

  finalizar(): void {
    if (!this.numeroDenuncia) {
      return;
    }

    this.denunciaService.limpiarResultadoEnvio();
    this.router.navigate(['/home']);
  }

  private procesarResultado(resultado: ResultadoEnvioDenuncia): void {
    if (!resultado.numeroDenuncia) {
      this.errorNumero = true;
      this.numeroDenuncia = null;
      this.fechaRegistro = null;
      return;
    }

    this.errorNumero = false;
    this.numeroDenuncia = resultado.numeroDenuncia;
    this.fechaRegistro = new Date(resultado.fechaRegistro);
  }
}
