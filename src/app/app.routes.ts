import { Routes } from '@angular/router';
import { Login } from './security/login/login';
import { Start } from './home/start/start';
import { Start as DenunciaStart } from './denuncia/start/start';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'home', component: Start },
  { path: 'denuncia', component: DenunciaStart },
];
