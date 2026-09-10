import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../security/auth.service';
import { Header } from '../../shared/header/header';
import { Distrito, Provincia, Region, UbigeoService } from '../../services/ubigeo-service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, Header],
  selector: 'app-start',
  styleUrl: './start.css',
  templateUrl: './start.html',
})
export class Start {
  submitted = false;
  regiones: Region[] = [];
  regionesCargando = true;
  provincias: Provincia[] = [];
  provinciasCargando = false;
  distritos: Distrito[] = [];
  distritosCargando = false;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private ubigeoService: UbigeoService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      denunciante: this.fb.group({
        nombres: ['', Validators.required],
        apellidos: ['', Validators.required],
        // El documento se completa automáticamente con el identificador usado en el login
        documento: [{ value: this.authService.getIdentifier() ?? '', disabled: true }],
      }),
      contacto: this.fb.group({
        telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
        direccion: ['', Validators.required],
        distrito: [{ value: '', disabled: true }, Validators.required],
        provincia: [{ value: '', disabled: true }, Validators.required],
        region: ['', Validators.required],
      }),
      narracion: ['', [Validators.required, Validators.minLength(20)]],
      incidente: this.fb.group({
        fecha: ['', Validators.required],
        hora: ['', Validators.required],
      }),
      lugar: this.fb.group({
        referencia: ['', Validators.required],
      }),
      denunciado: this.fb.group({
        nombreOApodo: [''],
        caracteristicas: [''],
      }),
    });
  }

  ngOnInit(): void {
    this.ubigeoService.obtenerRegiones().subscribe({
      next: (regiones) => {
        this.regiones = regiones;
        this.regionesCargando = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        this.regionesCargando = false;
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  onRegionChange(codigoRegion: string): void {
    this.provincias = [];
    this.distritos = [];
    const provinciaControl = this.contacto.get('provincia');
    const distritoControl = this.contacto.get('distrito');

    provinciaControl?.reset('');
    provinciaControl?.disable();
    distritoControl?.reset('');
    distritoControl?.disable();

    if (!codigoRegion) {
      this.provinciasCargando = false;
      return;
    }

    this.provinciasCargando = true;
    this.ubigeoService.obtenerProvincias(codigoRegion).subscribe({
      next: (provincias) => {
        this.provincias = provincias;
        this.provinciasCargando = false;
        provinciaControl?.enable();
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        this.provinciasCargando = false;
        console.error('Error al obtener provincias:', error);
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  onProvinciaChange(codigoProvincia: string): void {
    this.distritos = [];
    const distritoControl = this.contacto.get('distrito');

    distritoControl?.reset('');
    distritoControl?.disable();

    if (!codigoProvincia) {
      this.distritosCargando = false;
      return;
    }

    this.distritosCargando = true;
    this.ubigeoService.obtenerDistritos(codigoProvincia).subscribe({
      next: (distritos) => {
        this.distritos = distritos;
        this.distritosCargando = false;
        distritoControl?.enable();
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        this.distritosCargando = false;
        console.error('Error al obtener distritos:', error);
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  get denunciante() {
    return this.form.get('denunciante') as FormGroup;
  }

  get contacto() {
    return this.form.get('contacto') as FormGroup;
  }

  get incidente() {
    return this.form.get('incidente') as FormGroup;
  }

  get lugar() {
    return this.form.get('lugar') as FormGroup;
  }

  get denunciado() {
    return this.form.get('denunciado') as FormGroup;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // La conexión con el servicio de registro se implementará en un paso posterior
  }
}
