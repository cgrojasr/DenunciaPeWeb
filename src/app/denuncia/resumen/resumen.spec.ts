import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { Resumen } from './resumen';
import { DenunciaService } from '../../services/denuncia.service';
import { environment } from '../../../environments/environment';

describe('Resumen', () => {
  let component: Resumen;
  let fixture: ComponentFixture<Resumen>;
  let router: Router;
  let denunciaService: DenunciaService;
  let httpMock: HttpTestingController;

  const estadoCompleto = {
    denunciante: { nombres: 'Juan', apellidos: 'Perez', documento: '12345678' },
    contacto: {
      telefono: '987654321',
      direccion: 'Av. Las Flores 123',
      region: '15',
      provincia: '1501',
      distrito: '150101',
    },
    narracion: 'Ocurrió un incidente detallado con más de veinte caracteres.',
    incidente: { fecha: '2026-09-14', hora: '14:30' },
    lugar: { referencia: 'Cerca al mercado central' },
    denunciado: {},
    ubicacion: { latitud: -12.05, longitud: -77.04, direccion: 'Av. Arequipa 1234' },
    evidencias: [{ nombre: 'evidencia.pdf', tamano: 100, tipo: 'application/pdf' }],
  };

  const completarEstadoValido = () => {
    denunciaService.guardarDatosIniciales(estadoCompleto);
    denunciaService.guardarUbicacion(estadoCompleto.ubicacion);
    denunciaService.guardarEvidencias(estadoCompleto.evidencias);
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Resumen],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    router = TestBed.inject(Router);
    denunciaService = TestBed.inject(DenunciaService);
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Resumen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show validation errors when the state is incomplete', () => {
    fixture.detectChanges();

    expect(component.errores.length).toBeGreaterThan(0);
    expect(component.esValido).toBe(false);
  });

  it('should be valid and enable submit when all data is present and well formatted', () => {
    completarEstadoValido();

    const nuevaFixture = TestBed.createComponent(Resumen);
    nuevaFixture.detectChanges();

    expect(nuevaFixture.componentInstance.errores).toEqual([]);
    expect(nuevaFixture.componentInstance.esValido).toBe(true);
  });

  it('should not send the report and should highlight the affected fields when data is invalid', () => {
    fixture.detectChanges();

    component.enviarDenuncia();

    expect(component.camposInvalidos.denunciante).toBe(true);
    expect(component.camposInvalidos.evidencias).toBe(true);
    httpMock.expectNone(`${environment.apiUrl}/denuncias`);
  });

  it('should show a communication error message and allow retrying when the request fails', () => {
    completarEstadoValido();

    const nuevaFixture = TestBed.createComponent(Resumen);
    nuevaFixture.detectChanges();
    const comp = nuevaFixture.componentInstance;

    comp.enviarDenuncia();
    const peticion = httpMock.expectOne(`${environment.apiUrl}/denuncias`);
    peticion.error(new ProgressEvent('error'), { status: 0, statusText: 'Connection lost' });

    expect(comp.enviando).toBe(false);
    expect(comp.errorEnvio).toContain('No se pudo enviar la denuncia');
    expect(comp.enviado).toBe(false);
    expect(comp.esValido).toBe(true);
  });

  it('should register the report and show the confirmation screen after a successful retry', () => {
    completarEstadoValido();

    const nuevaFixture = TestBed.createComponent(Resumen);
    nuevaFixture.detectChanges();
    const comp = nuevaFixture.componentInstance;

    comp.enviarDenuncia();
    httpMock.expectOne(`${environment.apiUrl}/denuncias`).error(new ProgressEvent('error'));
    expect(comp.errorEnvio).toBeTruthy();

    comp.enviarDenuncia();
    httpMock.expectOne(`${environment.apiUrl}/denuncias`).flush({ numeroDenuncia: 'DEN-2026-0001' });

    expect(comp.enviado).toBe(true);
    expect(comp.numeroDenuncia).toBe('DEN-2026-0001');
    expect(denunciaService.obtenerEstado()).toEqual({});
  });

  it('should navigate back to evidencia when clicking volver', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    fixture.detectChanges();

    component.volver();

    expect(navigateSpy).toHaveBeenCalledWith(['/denuncia/evidencia']);
  });

  it('should navigate to /home when clicking irAInicio', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    fixture.detectChanges();

    component.irAInicio();

    expect(navigateSpy).toHaveBeenCalledWith(['/home']);
  });
});

