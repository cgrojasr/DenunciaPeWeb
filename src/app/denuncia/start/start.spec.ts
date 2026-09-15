import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { Start } from './start';
import { DenunciaService } from '../../services/denuncia.service';

describe('Start', () => {
  let component: Start;
  let fixture: ComponentFixture<Start>;
  let router: Router;
  let denunciaService: DenunciaService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Start],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    router = TestBed.inject(Router);
    denunciaService = TestBed.inject(DenunciaService);
    fixture = TestBed.createComponent(Start);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not navigate if form is invalid on submit', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onSubmit();
    expect(component.submitted).toBe(true);
    expect(component.form.invalid).toBe(true);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should save data and navigate to /denuncia/localizacion when form is valid', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.form.patchValue({
      denunciante: {
        nombres: 'Juan',
        apellidos: 'Perez',
      },
      contacto: {
        telefono: '987654321',
        direccion: 'Av. Las Flores 123',
        region: '15',
        provincia: '1501',
        distrito: '150101',
      },
      narracion: 'Ocurrió un incidente detallado con más de veinte caracteres.',
      incidente: {
        fecha: '2026-09-14',
        hora: '14:30',
      },
      lugar: {
        referencia: 'Cerca al mercado central',
      },
    });

    component.onSubmit();

    expect(component.form.valid).toBe(true);
    expect(navigateSpy).toHaveBeenCalledWith(['/denuncia/localizacion']);

    const estado = denunciaService.obtenerEstado();
    expect(estado.narracion).toContain('Ocurrió un incidente detallado');
    expect(estado.lugar?.referencia).toBe('Cerca al mercado central');
  });
});
