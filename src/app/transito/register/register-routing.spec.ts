import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { vi } from 'vitest';
import { routes } from '../../app.routes';
import { TransitoMockService } from '../../services/transito/transito-mock.service';
import { Ubicacion } from '../ubicacion/ubicacion';
import { Register } from './register';

describe('Navegación del registro de tránsito', () => {
  it('abre el componente de ubicación y conserva el borrador', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const transito = TestBed.inject(TransitoMockService);
    transito.descartarBorrador();
    const harness = await RouterTestingHarness.create();
    const registro = await harness.navigateByUrl('/transito/register', Register);
    registro.form.setValue({
      tipo: 'semaforo', otroTipo: '', fecha: '2020-01-01', hora: '12:00',
      descripcion: 'El vehículo pasó con luz roja.', placa: 'ABC-123',
      marca: '', modelo: '', color: '', observaciones: '',
    });

    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate');
    registro.onSubmit();
    expect(navegar).toHaveBeenCalledWith(['/transito/ubicacion']);
    await navegar.mock.results[0].value;
    harness.detectChanges();

    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(Ubicacion);
    expect(transito.obtenerBorrador()?.placa).toBe('ABC-123');
    transito.descartarBorrador();
  });
});
