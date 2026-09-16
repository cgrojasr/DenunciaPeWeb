import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { Evidencia } from './evidencia';
import { DenunciaService } from '../../services/denuncia.service';

describe('Evidencia', () => {
  let component: Evidencia;
  let fixture: ComponentFixture<Evidencia>;
  let denunciaService: DenunciaService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Evidencia],
      providers: [provideRouter([])],
    }).compileComponents();

    denunciaService = TestBed.inject(DenunciaService);
    fixture = TestBed.createComponent(Evidencia);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept a valid evidence file', () => {
    const input = document.createElement('input');
    input.type = 'file';
    const file = new File(['contenido'], 'evidencia.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [file] });

    component.seleccionarArchivos({ target: input } as unknown as Event);

    expect(component.archivos).toHaveLength(1);
    expect(component.archivos[0].nombre).toBe('evidencia.pdf');
    expect(component.mensajeError).toBeNull();
  });

  it('should reject an invalid evidence format', () => {
    const input = document.createElement('input');
    input.type = 'file';
    const file = new File(['contenido'], 'programa.exe', { type: 'application/octet-stream' });
    Object.defineProperty(input, 'files', { value: [file] });

    component.seleccionarArchivos({ target: input } as unknown as Event);

    expect(component.archivos).toHaveLength(0);
    expect(component.mensajeError).toContain('formato no válido');
  });

  it('should reject an evidence file larger than the allowed limit', () => {
    const input = document.createElement('input');
    input.type = 'file';
    const file = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'video.mp4', { type: 'video/mp4' });
    Object.defineProperty(input, 'files', { value: [file] });

    component.seleccionarArchivos({ target: input } as unknown as Event);

    expect(component.archivos).toHaveLength(0);
    expect(component.mensajeError).toContain('demasiado grande');
  });

  it('should show an unexpected error and reset the input to allow retry', () => {
    const input = document.createElement('input');
    input.type = 'file';
    Object.defineProperty(input, 'files', {
      get: () => {
        throw new Error('Error de lectura del navegador');
      },
    });

    component.seleccionarArchivos({ target: input } as unknown as Event);

    expect(component.mensajeError).toContain('error inesperado');
    expect(input.value).toBe('');
  });

  it('should not navigate without a valid evidence file', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.avanzarSiguientePaso();

    expect(navigateSpy).not.toHaveBeenCalled();
    expect(component.mensajeError).toContain('al menos un archivo válido');
  });

  it('should save evidence files and navigate to /denuncia/resumen', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    const input = document.createElement('input');
    input.type = 'file';
    const file = new File(['contenido'], 'evidencia.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [file] });
    component.seleccionarArchivos({ target: input } as unknown as Event);

    component.avanzarSiguientePaso();

    expect(navigateSpy).toHaveBeenCalledWith(['/denuncia/resumen']);
    expect(denunciaService.obtenerEstado().evidencias).toHaveLength(1);
  });

  it('should restore evidence files previously saved in the service', async () => {
    denunciaService.guardarEvidencias([{ nombre: 'foto.jpg', tamano: 500, tipo: 'image/jpeg' }]);

    const nuevaFixture = TestBed.createComponent(Evidencia);
    nuevaFixture.detectChanges();
    await nuevaFixture.whenStable();

    expect(nuevaFixture.componentInstance.archivos).toHaveLength(1);
    expect(nuevaFixture.componentInstance.archivos[0].nombre).toBe('foto.jpg');
  });
});
