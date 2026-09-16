import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
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

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(this.apiUrl, credentials)
      .pipe(tap((response) => this.saveSession(response, credentials.identifier)));
  }

  saveSession(response: LoginResponse, identifier: string): void {
    this.cookieService.set(TOKEN_KEY, response.accessToken);
    this.cookieService.set(TOKEN_TYPE_KEY, response.tokenType);
    this.cookieService.set(IDENTIFIER_KEY, identifier);
  }

  // Documento de identidad usado para iniciar sesión, reutilizable en otros formularios
  getIdentifier(): string | null {
    return this.cookieService.get(IDENTIFIER_KEY) || null;
  }

  // Header listo para enviarse en peticiones autenticadas: Authorization: Bearer <token>
  getAuthorizationHeader(): string | null {
    const token = this.cookieService.get(TOKEN_KEY);
    const type = this.cookieService.get(TOKEN_TYPE_KEY) || 'Bearer';
    return token ? `${type} ${token}` : null;
  }

  isLoggedIn(): boolean {
    return this.cookieService.check(TOKEN_KEY);
  }

  logout(): void {
    this.cookieService.delete(TOKEN_KEY);
    this.cookieService.delete(TOKEN_TYPE_KEY);
    this.cookieService.delete(IDENTIFIER_KEY);
  }
}
