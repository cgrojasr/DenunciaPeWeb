import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Header } from '../../shared/header/header';
import { AuthService } from '../../security/auth.service';
import { DenunciaResumen, DenunciaService } from '../../services/denuncia.service';

@Component({
  standalone: true,
  imports: [Header, DatePipe],
  selector: 'app-history-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements OnInit {
  readonly denuncias = signal<DenunciaResumen[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  constructor(
    private denunciaService: DenunciaService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const nroDocumento = this.authService.getIdentifier();
    if (!nroDocumento) {
      this.cargando.set(false);
      this.error.set('No se pudo identificar al usuario. Inicia sesión nuevamente.');
      return;
    }

    this.denunciaService.obtenerPorNroDocumento(nroDocumento).subscribe({
      next: (denuncias) => {
        this.denuncias.set(denuncias);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar tus denuncias. Intenta nuevamente.');
        this.cargando.set(false);
      },
    });
  }
}
