import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresAtUtc: string;
}

const TOKEN_KEY = 'accessToken';
const TOKEN_TYPE_KEY = 'tokenType';
const IDENTIFIER_KEY = 'identifier';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth/login`;

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(this.apiUrl, credentials)
      .pipe(tap((response) => this.saveSession(response, credentials.identifier)));
  }

  saveSession(response: LoginResponse, identifier: string): void {
    localStorage.setItem(TOKEN_KEY, response.accessToken);
    localStorage.setItem(TOKEN_TYPE_KEY, response.tokenType);
    localStorage.setItem(IDENTIFIER_KEY, identifier);
  }

  // Documento de identidad usado para iniciar sesión, reutilizable en otros formularios
  getIdentifier(): string | null {
    return localStorage.getItem(IDENTIFIER_KEY);
  }

  // Header listo para enviarse en peticiones autenticadas: Authorization: Bearer <token>
  getAuthorizationHeader(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    const type = localStorage.getItem(TOKEN_TYPE_KEY) ?? 'Bearer';
    return token ? `${type} ${token}` : null;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_TYPE_KEY);
    localStorage.removeItem(IDENTIFIER_KEY);
  }
}
