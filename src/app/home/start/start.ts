import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../security/auth.service';

@Component({
  standalone: true,
  imports: [],
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
