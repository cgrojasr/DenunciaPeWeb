import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Header } from '../../shared/header/header';
import { IndicadorPasos } from '../indicador-pasos/indicador-pasos';

@Component({
  standalone: true,
  imports: [Header, IndicadorPasos],
  selector: 'app-evidencia',
  styleUrl: './evidencia.css',
  templateUrl: './evidencia.html',
})
export class Evidencia {
  constructor(private router: Router) {}

  volver(): void {
    this.router.navigate(['/denuncia/localizacion']);
  }
}
