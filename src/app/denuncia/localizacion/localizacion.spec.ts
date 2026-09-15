import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Localizacion } from './localizacion';
import { DenunciaService } from '../../services/denuncia.service';
import { GoogleMapsLoaderService } from '../../services/google-maps-loader.service';

describe('Localizacion', () => {
  let component: Localizacion;
  let fixture: ComponentFixture<Localizacion>;
  let router: Router;
  let denunciaService: DenunciaService;
  let mapsLoader: GoogleMapsLoaderService;

  beforeEach(async () => {
    class MockMap {
      setCenter = vi.fn();
      setZoom = vi.fn();
      setOptions = vi.fn();
      addListener = vi.fn().mockReturnValue({ remove: vi.fn() });
      getCenter = vi.fn().mockReturnValue({ lat: () => -12.046374, lng: () => -77.042793 });
      getZoom = vi.fn().mockReturnValue(15);
    }

    class MockMarker {
      setPosition = vi.fn();
      setOptions = vi.fn();
      setMap = vi.fn();
      setTitle = vi.fn();
      addListener = vi.fn().mockReturnValue({ remove: vi.fn() });
      getPosition = vi.fn().mockReturnValue({ lat: () => -12.046374, lng: () => -77.042793 });
    }

    (window as any).google = {
      maps: {
        Map: MockMap,
        Marker: MockMarker,
        Animation: { DROP: 1 },
        Geocoder: class {
          geocode(
            request: { location?: { lat: number; lng: number }; address?: string },
            callback: (results: any[], status: string) => void,
          ) {
            if (request.location) {
              callback(
                [
                  {
                    formatted_address: 'Av. Arequipa 1234, Lima, Perú',
                    geometry: {
                      location: {
                        lat: () => request.location!.lat,
                        lng: () => request.location!.lng,
                      },
                    },
                  },
                ],
                'OK',
              );
            } else if (request.address) {
              callback(
                [
                  {
                    formatted_address: 'Av. Javier Prado 500, San Isidro, Perú',
                    geometry: {
                      location: {
                        lat: () => -12.091234,
                        lng: () => -77.034567,
                      },
                    },
                  },
                ],
                'OK',
              );
            }
          }
        },
        GeocoderStatus: {
          OK: 'OK',
          ZERO_RESULTS: 'ZERO_RESULTS',
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [Localizacion],
      providers: [provideRouter([])],
    }).compileComponents();

    router = TestBed.inject(Router);
    denunciaService = TestBed.inject(DenunciaService);
    mapsLoader = TestBed.inject(GoogleMapsLoaderService);
    vi.spyOn(mapsLoader, 'load').mockResolvedValue();

    fixture = TestBed.createComponent(Localizacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and load Google Maps API', () => {
    expect(component.apiCargada).toBe(true);
    expect(component.center).toEqual(component.defaultCenter);
  });

  it('should update coordinates and address on map click', () => {
    const mockEvent = {
      latLng: {
        lat: () => -12.05,
        lng: () => -77.04,
      },
    } as any;

    component.onMapClick(mockEvent);

    expect(component.markerPosition).toEqual({ lat: -12.05, lng: -77.04 });
    expect(component.form.get('latitud')?.value).toBe(-12.05);
    expect(component.form.get('longitud')?.value).toBe(-77.04);
    expect(component.form.get('direccion')?.value).toBe('Av. Arequipa 1234, Lima, Perú');
  });

  it('should update coordinates and address on marker drag end', () => {
    const mockEvent = {
      latLng: {
        lat: () => -12.10,
        lng: () => -77.02,
      },
    } as any;

    component.onMarkerDragEnd(mockEvent);

    expect(component.markerPosition).toEqual({ lat: -12.10, lng: -77.02 });
    expect(component.form.get('latitud')?.value).toBe(-12.10);
    expect(component.form.get('longitud')?.value).toBe(-77.02);
    expect(component.form.get('direccion')?.value).toBe('Av. Arequipa 1234, Lima, Perú');
  });

  it('should use geolocation when user clicks automatic geolocation', () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((success) => {
        success({
          coords: {
            latitude: -12.08,
            longitude: -77.05,
          },
        });
      }),
    };
    (navigator as any).geolocation = mockGeolocation;

    component.usarUbicacionActual();

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    expect(component.markerPosition).toEqual({ lat: -12.08, lng: -77.05 });
    expect(component.form.get('latitud')?.value).toBe(-12.08);
    expect(component.form.get('longitud')?.value).toBe(-77.05);
    expect(component.form.get('direccion')?.value).toBe('Av. Arequipa 1234, Lima, Perú');
  });

  it('should handle search by address', () => {
    component.busquedaTexto = 'Av. Javier Prado 500';
    component.buscarPorDireccion();

    expect(component.markerPosition).toEqual({ lat: -12.091234, lng: -77.034567 });
    expect(component.form.get('direccion')?.value).toBe('Av. Javier Prado 500, San Isidro, Perú');
  });

  it('should not advance to next step if no location selected or address is invalid', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.avanzarSiguientePaso();

    expect(component.submitted).toBe(true);
    expect(navigateSpy).not.toHaveBeenCalled();
    expect(component.mensajeError).toBeTruthy();
  });

  it('should save location in DenunciaService and navigate to next step (/denuncia/evidencia) when valid', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.establecerCoordenadas(-12.05, -77.04);
    component.form.patchValue({
      direccion: 'Av. Tacna 456, Lima',
      referenciaAdicional: 'Frente a la iglesia',
    });

    component.avanzarSiguientePaso();

    expect(component.submitted).toBe(true);
    expect(navigateSpy).toHaveBeenCalledWith(['/denuncia/evidencia']);

    const ubicacion = denunciaService.obtenerUbicacion();
    expect(ubicacion?.latitud).toBe(-12.05);
    expect(ubicacion?.longitud).toBe(-77.04);
    expect(ubicacion?.direccion).toBe('Av. Tacna 456, Lima');
    expect(ubicacion?.referenciaAdicional).toBe('Frente a la iglesia');
  });

  it('should navigate back to /denuncia when clicking volver', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.volverPasoAnterior();
    expect(navigateSpy).toHaveBeenCalledWith(['/denuncia']);
  });
});
