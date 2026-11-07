import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IndicadorPasos } from '../../shared/indicador-pasos/indicador-pasos';
import { TransitoMockService } from '../../services/transito/transito-mock.service';
import { Header } from '../../shared/header/header';

const obligatorio: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim() ? null : { required: true };

const descripcionDetallada: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim().length >= 20
    ? null
    : { detalleInsuficiente: true };

const fechaHoraValida: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const fecha: string = control.get('fecha')?.value;
  const hora: string = control.get('hora')?.value;
  if (!fecha || !hora) return null;

  const fechaMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  const horaMatch = /^(\d{2}):(\d{2})$/.exec(hora);
  if (!fechaMatch || !horaMatch) return { fechaHoraInvalida: true };

  const [, anio, mes, dia] = fechaMatch.map(Number);
  const [, horas, minutos] = horaMatch.map(Number);
  const ocurrencia = new Date(anio, mes - 1, dia, horas, minutos);
  if (
    ocurrencia.getFullYear() !== anio || ocurrencia.getMonth() !== mes - 1 ||
    ocurrencia.getDate() !== dia || ocurrencia.getHours() !== horas ||
    ocurrencia.getMinutes() !== minutos
  ) return { fechaHoraInvalida: true };

  return ocurrencia.getTime() > Date.now() ? { fechaHoraFutura: true } : null;
};

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, Header, IndicadorPasos],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register implements OnInit {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly transito = inject(TransitoMockService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly tipos = this.transito.obtenerTipos();
  readonly form = this.fb.group({
    tipo: ['', [obligatorio, (control: AbstractControl) =>
      !control.value || this.tipos.some((tipo) => tipo.codigo === control.value)
        ? null : { tipoDesconocido: true }]],
    otroTipo: [''],
    fecha: ['', obligatorio],
    hora: ['', obligatorio],
    descripcion: ['', [obligatorio, descripcionDetallada]],
    placa: ['', [obligatorio, Validators.pattern(/^(?:[A-Za-z0-9]{6}|[A-Za-z0-9]{3}-[A-Za-z0-9]{3}|[A-Za-z0-9]{4}-[A-Za-z0-9]{2})$/)]],
    marca: [''],
    modelo: [''],
    color: [''],
    observaciones: [''],
  }, { validators: fechaHoraValida });
  submitted = false;
  errorBorrador = '';

  ngOnInit(): void {
    try {
      const borrador = this.transito.obtenerBorrador();
      if (borrador) this.form.patchValue(borrador, { emitEvent: false });
    } catch (error) {
      console.error('No se pudo recuperar el borrador de tránsito:', error);
      this.errorBorrador = 'No se pudo recuperar el borrador. Revise el almacenamiento del navegador.';
    }

    this.actualizarOtroTipo();
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.actualizarOtroTipo();
      this.guardarBorrador();
    });
  }

  private actualizarOtroTipo(): void {
    const otroTipo = this.form.controls.otroTipo;
    if (this.form.controls.tipo.value === 'otro') {
      otroTipo.setValidators(obligatorio);
    } else {
      otroTipo.clearValidators();
    }
    otroTipo.updateValueAndValidity({ emitEvent: false });
  }

  private guardarBorrador(): boolean {
    try {
      this.transito.guardarBorrador(this.form.getRawValue());
      this.errorBorrador = '';
      return true;
    } catch (error) {
      console.error('No se pudo guardar el borrador de tránsito:', error);
      this.errorBorrador = 'No se pudo guardar el borrador. Revise el almacenamiento del navegador.';
      return false;
    }
  }

  mostrarError(nombre: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[nombre];
    return control.invalid && (this.submitted || control.touched);
  }

  descartar(): void {
    try {
      this.transito.descartarBorrador();
      this.form.reset(undefined, { emitEvent: false });
      this.actualizarOtroTipo();
      this.submitted = false;
      this.errorBorrador = '';
    } catch (error) {
      console.error('No se pudo descartar el borrador de tránsito:', error);
      this.errorBorrador = 'No se pudo descartar el borrador. Revise el almacenamiento del navegador.';
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    if (this.form.invalid) return;

    const datos = this.form.getRawValue();
    this.form.patchValue({
      ...datos,
      otroTipo: datos.tipo === 'otro' ? datos.otroTipo.trim() : '',
      descripcion: datos.descripcion.trim(),
      placa: datos.placa.toUpperCase(),
      marca: datos.marca.trim(),
      modelo: datos.modelo.trim(),
      color: datos.color.trim(),
      observaciones: datos.observaciones.trim(),
    }, { emitEvent: false });
    if (this.guardarBorrador()) void this.router.navigate(['/transito/ubicacion']);
  }
}
