import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../security/auth.service';
import { Header } from '../../shared/header/header';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, Header],
  selector: 'app-start',
  styleUrl: './start.css',
  templateUrl: './start.html',
})
export class Start {
  submitted = false;
  form: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
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
        distrito: ['', Validators.required],
        provincia: ['', Validators.required],
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
