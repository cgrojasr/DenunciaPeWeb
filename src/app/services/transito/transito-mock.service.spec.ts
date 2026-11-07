import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { vi } from 'vitest';
import { AuthService } from '../../security/auth.service';
import { TransitoMockService } from './transito-mock.service';

describe('TransitoMockService', () => {
  it('elimina el borrador al cerrar sesión', () => {
    const cookies = { delete: vi.fn() };
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), { provide: CookieService, useValue: cookies }],
    });
    const transito = TestBed.inject(TransitoMockService);
    transito.guardarBorrador({
      tipo: '', otroTipo: '', fecha: '', hora: '', descripcion: '',
      placa: '', marca: '', modelo: '', color: '', observaciones: '',
    });
    TestBed.inject(AuthService).logout();
    expect(transito.obtenerBorrador()).toBeNull();
    expect(cookies.delete).toHaveBeenCalledTimes(3);
  });
});
