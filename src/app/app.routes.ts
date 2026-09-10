import { Routes } from '@angular/router';
import { Login } from './security/login/login';
import { Start } from './home/start/start';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'home', component: Start },
];
