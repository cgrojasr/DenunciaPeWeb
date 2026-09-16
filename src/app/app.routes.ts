import { Routes } from '@angular/router';
import { Login } from './security/login/login';
import { Start } from './home/start/start';
import { Start as DenunciaStart } from './denuncia/start/start';
import { Localizacion } from './denuncia/localizacion/localizacion';
import { Evidencia } from './denuncia/evidencia/evidencia';
import { Resumen } from './denuncia/resumen/resumen';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'home', component: Start },
  { path: 'denuncia', component: DenunciaStart },
  { path: 'denuncia/localizacion', component: Localizacion },
  { path: 'denuncia/evidencia', component: Evidencia },
  { path: 'denuncia/resumen', component: Resumen },
];
