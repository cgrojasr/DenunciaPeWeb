import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../security/auth.service';
import { Header } from '../../shared/header/header';

@Component({
  standalone: true,
  imports: [Header],
  selector: 'app-start',
  styleUrl: './start.css',
  templateUrl: './start.html',
})
export class Start {
  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
