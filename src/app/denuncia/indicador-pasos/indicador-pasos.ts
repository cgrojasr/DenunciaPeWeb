import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface Paso {
  numero: number;
  titulo: string;
}

@Component({
  standalone: true,
  selector: 'app-indicador-pasos',
  imports: [CommonModule],
  styleUrl: './indicador-pasos.css',
  templateUrl: './indicador-pasos.html',
})
export class IndicadorPasos {
  @Input() pasoActual = 1;

  pasos: Paso[] = [
    { numero: 1, titulo: '1. Datos' },
    { numero: 2, titulo: '2. Ubicación' },
    { numero: 3, titulo: '3. Evidencias' },
  ];
}
