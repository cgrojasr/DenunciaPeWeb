import { TestBed } from '@angular/core/testing';
import { DenunciaService } from './denuncia.service';

describe('DenunciaService', () => {
  let service: DenunciaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DenunciaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save and retrieve initial data', () => {
    service.guardarDatosIniciales({
      narracion: 'Robo en la avenida principal',
      lugar: { referencia: 'Frente al parque' },
    });

    const estado = service.obtenerEstado();
    expect(estado.narracion).toBe('Robo en la avenida principal');
    expect(estado.lugar?.referencia).toBe('Frente al parque');
  });

  it('should save and retrieve location', () => {
    service.guardarUbicacion({
      latitud: -12.046374,
      longitud: -77.042793,
      direccion: 'Av. Abancay 123, Lima',
      referenciaAdicional: 'Esq. con Jr. Cuzco',
    });

    const ubicacion = service.obtenerUbicacion();
    expect(ubicacion?.latitud).toBe(-12.046374);
    expect(ubicacion?.longitud).toBe(-77.042793);
    expect(ubicacion?.direccion).toBe('Av. Abancay 123, Lima');
  });

  it('should clear state', () => {
    service.guardarUbicacion({
      latitud: -12.046374,
      longitud: -77.042793,
      direccion: 'Av. Abancay 123, Lima',
    });

    service.limpiar();
    expect(service.obtenerEstado()).toEqual({});
    expect(service.obtenerUbicacion()).toBeUndefined();
  });
});
