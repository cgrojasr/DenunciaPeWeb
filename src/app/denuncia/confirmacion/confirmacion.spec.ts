import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { Confirmacion } from './confirmacion';
import { DenunciaService } from '../../services/denuncia.service';
import { environment } from '../../../environments/environment';

describe('Confirmacion', () => {
  let component: Confirmacion;
  let fixture: ComponentFixture<Confirmacion>;
  let router: Router;
  let denunciaService: DenunciaService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Confirmacion],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    router = TestBed.inject(Router);
    denunciaService = TestBed.inject(DenunciaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  const crearComponente = () => {
    fixture = TestBed.createComponent(Confirmacion);
    component = fixture.componentInstance;
  };

  it('should create', () => {
    crearComponente();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show the report number, success message and date when the server responded correctly', () => {
    denunciaService.guardarResultadoEnvio({
      numeroDenuncia: 'DEN-2026-0001',
      fechaRegistro: '2026-09-21T10:00:00.000Z',
    });

    crearComponente();
    fixture.detectChanges();

    expect(component.exito).toBe(true);
    expect(component.numeroDenuncia).toBe('DEN-2026-0001');
    expect(component.fechaRegistro).toBeTruthy();
    expect(component.errorNumero).toBe(false);
    expect(component.errorInesperado).toBe(false);
  });

  it('should show an error and not allow finishing when the response has no report number', () => {
    denunciaService.guardarResultadoEnvio({
      numeroDenuncia: null,
      fechaRegistro: '2026-09-21T10:00:00.000Z',
    });

    crearComponente();
    fixture.detectChanges();

    expect(component.errorNumero).toBe(true);
    expect(component.exito).toBe(false);

    component.finalizar();
    expect(component.numeroDenuncia).toBeNull();
  });

  it('should show an unexpected error when there is no confirmation result available', () => {
    crearComponente();
    fixture.detectChanges();

    expect(component.errorInesperado).toBe(true);
    expect(component.exito).toBe(false);
  });

  it('should show the full confirmation and allow finishing after a successful retry', () => {
    crearComponente();
    fixture.detectChanges();
    expect(component.errorInesperado).toBe(true);

    const navigateSpy = vi.spyOn(router, 'navigate');

    component.reintentar();
    httpMock.expectOne(`${environment.apiUrl}/denuncias`).flush({ numeroDenuncia: 'DEN-2026-0002' });

    expect(component.exito).toBe(true);
    expect(component.numeroDenuncia).toBe('DEN-2026-0002');
    expect(component.errorInesperado).toBe(false);

    component.finalizar();
    expect(navigateSpy).toHaveBeenCalledWith(['/home']);
  });
});
