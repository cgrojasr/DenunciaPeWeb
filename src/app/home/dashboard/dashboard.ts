import { Component } from '@angular/core';
import { Header } from '../../shared/header/header';

@Component({
  standalone: true,
  imports: [Header],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {}
