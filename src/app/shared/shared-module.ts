import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndicadorPasos } from './indicador-pasos/indicador-pasos';

@NgModule({
  declarations: [],
  imports: [CommonModule, IndicadorPasos],
  exports: [IndicadorPasos],
})
export class SharedModule {}
