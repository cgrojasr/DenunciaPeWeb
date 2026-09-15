import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { Header } from '../../shared/header/header';
import { IndicadorPasos } from '../indicador-pasos/indicador-pasos';
import { DenunciaService } from '../../services/denuncia.service';
import { GoogleMapsLoaderService } from '../../services/google-maps-loader.service';

@Component({
  standalone: true,
  selector: 'app-localizacion',
  templateUrl: './localizacion.html',
  styleUrl: './localizacion.css',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Header,
    IndicadorPasos,
    GoogleMap,
    MapMarker,
  ],
})
export class Localizacion implements OnInit {
  form: FormGroup;
  submitted = false;
  apiCargada = false;
  geolocalizando = false;
  geocodificando = false;
  mensajeError: string | null = null;
  mensajeInfo: string | null = null;

  // Centro por defecto: Lima, Perú
  defaultCenter: google.maps.LatLngLiteral = { lat: -12.046374, lng: -77.042793 };
  center: google.maps.LatLngLiteral = { ...this.defaultCenter };
  zoom = 15;

  markerPosition: google.maps.LatLngLiteral | null = null;
  markerOptions: google.maps.MarkerOptions = {
    draggable: true,
    title: 'Lugar del incidente',
    animation: typeof google !== 'undefined' && google.maps ? google.maps.Animation.DROP : undefined,
  };

  mapOptions: google.maps.MapOptions = {
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
  };

  busquedaTexto = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private denunciaService: DenunciaService,
    private mapsLoader: GoogleMapsLoaderService,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      referenciaAdicional: [''],
      latitud: [null as number | null, Validators.required],
      longitud: [null as number | null, Validators.required],
    });
  }

  ngOnInit(): void {
    // Si ya existían datos guardados previamente, restaurarlos
    const ubicacionGuardada = this.denunciaService.obtenerUbicacion();
    if (ubicacionGuardada) {
      this.markerPosition = {
        lat: ubicacionGuardada.latitud,
        lng: ubicacionGuardada.longitud,
      };
      this.center = { ...this.markerPosition };
      this.form.patchValue({
        direccion: ubicacionGuardada.direccion,
        referenciaAdicional: ubicacionGuardada.referenciaAdicional ?? '',
        latitud: ubicacionGuardada.latitud,
        longitud: ubicacionGuardada.longitud,
      });
    } else {
      // Tomar referencia de paso 1 si existe
      const estado = this.denunciaService.obtenerEstado();
      if (estado.lugar?.referencia) {
        this.form.patchValue({
          referenciaAdicional: estado.lugar.referencia,
        });
      }
    }

    this.cargarGoogleMaps();
  }

  cargarGoogleMaps(): void {
    this.mapsLoader
      .load()
      .then(() => {
        this.apiCargada = true;
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.apiCargada = false;
        this.mensajeError = 'No se pudo cargar Google Maps. Puede ingresar la dirección manualmente.';
        this.cdr.detectChanges();
      });
  }

  onMapClick(event: google.maps.MapMouseEvent): void {
    if (!event.latLng) {
      return;
    }
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    this.establecerCoordenadas(lat, lng);
    this.obtenerDireccionAproximada(lat, lng);
  }

  onMarkerDragEnd(event: google.maps.MapMouseEvent): void {
    if (!event.latLng) {
      return;
    }
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    this.establecerCoordenadas(lat, lng);
    this.obtenerDireccionAproximada(lat, lng);
  }

  seleccionarUbicacionDefecto(): void {
    this.establecerCoordenadas(this.defaultCenter.lat, this.defaultCenter.lng);
    this.obtenerDireccionAproximada(this.defaultCenter.lat, this.defaultCenter.lng);
  }

  establecerCoordenadas(lat: number, lng: number): void {
    this.markerPosition = { lat, lng };
    this.center = { lat, lng };
    this.form.patchValue({
      latitud: lat,
      longitud: lng,
    });
    this.mensajeError = null;
    this.cdr.detectChanges();
  }

  usarUbicacionActual(): void {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.mensajeError = 'La geolocalización no está soportada por su navegador.';
      return;
    }

    this.geolocalizando = true;
    this.mensajeError = null;
    this.mensajeInfo = 'Obteniendo ubicación del dispositivo...';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.geolocalizando = false;
        this.mensajeInfo = 'Ubicación actual detectada.';
        this.establecerCoordenadas(lat, lng);
        this.zoom = 17;
        this.obtenerDireccionAproximada(lat, lng);
        setTimeout(() => {
          this.mensajeInfo = null;
          this.cdr.detectChanges();
        }, 3000);
      },
      (error) => {
        this.geolocalizando = false;
        this.mensajeInfo = null;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.mensajeError = 'Permiso de ubicación denegado. Seleccione un punto en el mapa.';
            break;
          case error.POSITION_UNAVAILABLE:
            this.mensajeError = 'Información de ubicación no disponible. Seleccione en el mapa.';
            break;
          case error.TIMEOUT:
            this.mensajeError = 'Tiempo de espera agotado al obtener ubicación.';
            break;
          default:
            this.mensajeError = 'Error al obtener la ubicación actual. Seleccione en el mapa.';
            break;
        }
        this.cdr.detectChanges();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }

  obtenerDireccionAproximada(lat: number, lng: number): void {
    if (typeof google === 'undefined' || !google.maps || !google.maps.Geocoder) {
      if (!this.form.get('direccion')?.value) {
        this.form.patchValue({
          direccion: `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        });
      }
      return;
    }

    this.geocodificando = true;
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode(
      { location: { lat, lng } },
      (results, status) => {
        this.geocodificando = false;
        if (status === 'OK' && results && results.length > 0) {
          const direccionFormateada = results[0].formatted_address;
          this.form.patchValue({
            direccion: direccionFormateada,
          });
        } else {
          if (!this.form.get('direccion')?.value) {
            this.form.patchValue({
              direccion: `Ubicación (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
            });
          }
        }
        this.cdr.detectChanges();
      },
    );
  }

  buscarPorDireccion(): void {
    if (!this.busquedaTexto.trim()) {
      return;
    }

    if (typeof google === 'undefined' || !google.maps || !google.maps.Geocoder) {
      this.mensajeError = 'Google Maps no está disponible para búsqueda.';
      return;
    }

    this.geocodificando = true;
    this.mensajeError = null;
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode(
      {
        address: this.busquedaTexto,
        componentRestrictions: { country: 'PE' },
      },
      (results, status) => {
        this.geocodificando = false;
        if (status === 'OK' && results && results.length > 0) {
          const loc = results[0].geometry.location;
          const lat = loc.lat();
          const lng = loc.lng();
          this.establecerCoordenadas(lat, lng);
          this.zoom = 16;
          this.form.patchValue({
            direccion: results[0].formatted_address,
          });
        } else {
          this.mensajeError = 'No se encontró la dirección ingresada. Intente con otra o seleccione en el mapa.';
        }
        this.cdr.detectChanges();
      },
    );
  }

  volverPasoAnterior(): void {
    // Guarda el progreso actual si hay alguno antes de volver
    if (this.markerPosition) {
      this.denunciaService.guardarUbicacion({
        latitud: this.form.value.latitud,
        longitud: this.form.value.longitud,
        direccion: this.form.value.direccion,
        referenciaAdicional: this.form.value.referenciaAdicional,
      });
    }
    this.router.navigate(['/denuncia']);
  }

  avanzarSiguientePaso(): void {
    this.submitted = true;

    if (this.form.invalid || !this.markerPosition) {
      this.mensajeError = 'Por favor seleccione un punto en el mapa y complete la dirección.';
      this.form.markAllAsTouched();
      return;
    }

    const { latitud, longitud, direccion, referenciaAdicional } = this.form.value;

    this.denunciaService.guardarUbicacion({
      latitud,
      longitud,
      direccion,
      referenciaAdicional,
    });

    this.router.navigate(['/denuncia/evidencia']);
  }
}
