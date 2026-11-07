import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { TransitoMockService } from '../../services/transito/transito-mock.service';
import { Register } from './register';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let transito: TransitoMockService;
  let router: Router;

  const datosValidos = {
    tipo: 'semaforo',
    otroTipo: '',
    fecha: '2020-01-01',
    hora: '12:00',
    descripcion: 'El vehículo pasó con luz roja.',
    placa: 'abc-123',
    marca: 'Toyota',
    modelo: 'Corolla',
    color: 'Blanco',
    observaciones: '',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([])],
    }).compileComponents();
    transito = TestBed.inject(TransitoMockService);
    transito.descartarBorrador();
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    transito.descartarBorrador();
  });

  it('impide continuar y señala los campos obligatorios pendientes', () => {
    const navegar = vi.spyOn(router, 'navigate');
    component.onSubmit();
    fixture.detectChanges();

    expect(navegar).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('campos señalados');
    for (const id of ['tipo', 'fecha', 'hora', 'descripcion', 'placa']) {
      expect(fixture.nativeElement.querySelector(`#${id}`).classList.contains('is-invalid')).toBe(true);
    }
    for (const id of ['marca', 'modelo', 'color']) {
      const input: HTMLInputElement = fixture.nativeElement.querySelector(`#${id}`);
      expect(input.classList.contains('is-invalid')).toBe(false);
      expect(input.required).toBe(false);
      expect(fixture.nativeElement.querySelector(`label[for="${id}"]`).textContent).toContain('(opcional)');
    }
  });

  it('guarda los datos válidos y avanza al siguiente paso', () => {
    const navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.form.setValue(datosValidos);
    component.onSubmit();

    expect(transito.obtenerBorrador()).toEqual({ ...datosValidos, placa: 'ABC-123' });
    expect(navegar).toHaveBeenCalledWith(['/transito/ubicacion']);
  });

  it('descarta el borrador y limpia el formulario', () => {
    component.form.setValue(datosValidos);
    component.submitted = true;
    component.descartar();

    expect(transito.obtenerBorrador()).toBeNull();
    expect(component.form.controls.placa.value).toBe('');
    expect(component.submitted).toBe(false);
  });

  it('mantiene los datos e informa si no se puede descartar el borrador', () => {
    component.form.setValue(datosValidos);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(transito, 'descartarBorrador').mockImplementation(() => { throw new Error('storage'); });
    component.descartar();

    expect(component.form.controls.placa.value).toBe(datosValidos.placa);
    expect(component.errorBorrador).toContain('No se pudo descartar');
  });

  it('permite continuar sin marca, modelo ni color y conserva los valores vacíos', () => {
    const navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.form.setValue({ ...datosValidos, marca: '', modelo: '', color: '' });
    component.onSubmit();

    expect(transito.obtenerBorrador()).toEqual({
      ...datosValidos, placa: 'ABC-123', marca: '', modelo: '', color: '',
    });
    expect(navegar).toHaveBeenCalledWith(['/transito/ubicacion']);
  });

  it('valida la placa y permite formatos con y sin guion', () => {
    component.form.setValue(datosValidos);
    const placa = component.form.controls.placa;
    for (const valor of ['ABC-12', 'ABC 123', 'AB-1234', 'ABC-1234', '   ']) {
      placa.setValue(valor);
      expect(placa.invalid).toBe(true);
    }
    for (const valor of ['ABC123', 'abc-123', '1234-AB']) {
      placa.setValue(valor);
      expect(placa.valid).toBe(true);
    }
    placa.setValue('inválida');
    component.onSubmit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#placa-error').textContent).toContain('placa válida');
  });

  it('exige una descripción de al menos 20 caracteres sin contar espacios exteriores', () => {
    component.form.setValue({ ...datosValidos, descripcion: '  texto breve  ' });
    component.onSubmit();
    fixture.detectChanges();
    expect(component.form.controls.descripcion.invalid).toBe(true);
    expect(fixture.nativeElement.querySelector('#descripcion-error').textContent).toContain('20 caracteres');
    component.form.controls.descripcion.setValue('12345678901234567890');
    expect(component.form.controls.descripcion.valid).toBe(true);
  });

  it('exige especificar la infracción solo cuando se selecciona Otro', () => {
    component.form.setValue({ ...datosValidos, tipo: 'otro', otroTipo: '  ' });
    component.onSubmit();
    fixture.detectChanges();
    expect(component.form.controls.otroTipo.invalid).toBe(true);
    expect(fixture.nativeElement.querySelector('#otroTipo-error')).not.toBeNull();
    component.form.controls.otroTipo.setValue('Otra infracción');
    expect(component.form.valid).toBe(true);
    component.form.controls.tipo.setValue('semaforo');
    component.form.controls.otroTipo.setValue('');
    expect(component.form.valid).toBe(true);
  });

  it('rechaza tipos de infracción fuera del catálogo', () => {
    component.form.setValue({ ...datosValidos, tipo: 'desconocido' });
    expect(component.form.controls.tipo.invalid).toBe(true);
  });

  it('rechaza fecha y hora futuras y fechas imposibles', () => {
    component.form.setValue(datosValidos);
    const ahora = new Date();
    const futuro = new Date(ahora.getFullYear() + 1, 0, 1, 12, 0);
    component.form.patchValue({ fecha: `${futuro.getFullYear()}-01-01`, hora: '12:00' });
    expect(component.form.hasError('fechaHoraFutura')).toBe(true);
    component.onSubmit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#fechaHora-error').textContent).toContain('no sean futuras');
    component.form.patchValue({ fecha: '2020-02-30', hora: '12:00' });
    expect(component.form.hasError('fechaHoraInvalida')).toBe(true);
    component.form.patchValue({ fecha: '2020-01-01', hora: '12:00' });
    expect(component.form.valid).toBe(true);
  });

  it('compara la hora con el momento actual cuando la fecha es hoy', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 6, 12, 30));
    component.form.setValue({ ...datosValidos, fecha: '2026-11-06', hora: '12:31' });
    expect(component.form.hasError('fechaHoraFutura')).toBe(true);
    component.form.controls.hora.setValue('12:30');
    expect(component.form.valid).toBe(true);
    vi.useRealTimers();
  });

  it('recupera un borrador incompleto al volver al formulario', () => {
    component.form.patchValue({ tipo: 'otro', otroTipo: 'Ciclovía', marca: 'Marca' });
    const otraVista = TestBed.createComponent(Register);
    otraVista.detectChanges();
    expect(otraVista.componentInstance.form.controls.otroTipo.value).toBe('Ciclovía');
    expect(otraVista.componentInstance.form.controls.marca.value).toBe('Marca');
    otraVista.componentInstance.form.controls.otroTipo.setValue('');
    expect(otraVista.componentInstance.form.controls.otroTipo.invalid).toBe(true);
    otraVista.destroy();
  });

  it('informa los errores de almacenamiento y no avanza si falla el guardado', () => {
    const navegar = vi.spyOn(router, 'navigate');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(transito, 'guardarBorrador').mockImplementation(() => { throw new Error('storage'); });
    component.form.setValue(datosValidos);
    component.onSubmit();
    fixture.detectChanges();
    expect(navegar).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('No se pudo guardar el borrador');
  });
});
