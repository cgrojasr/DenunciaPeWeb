import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = '/api/auth/login';

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(this.apiUrl, credentials)
      .pipe(tap((response) => this.saveSession(response)));
  }

  saveSession(response: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, response.accessToken);
    localStorage.setItem(TOKEN_TYPE_KEY, response.tokenType);
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
  }
}
