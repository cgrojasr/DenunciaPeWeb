import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Distrito {
	codigo: string;
	nombre: string;
}

export interface Provincia {
	codigo: string;
	nombre: string;
}

export interface Region {
	codigo: string;
	nombre: string;
}

@Injectable({ providedIn: 'root' })
export class UbigeoService {
	private readonly apiUrl = `${environment.apiUrl}/ubigeo/distritos`;
	private readonly provinciasApiUrl = `${environment.apiUrl}/ubigeo/provincias`;
	private readonly regionesApiUrl = `${environment.apiUrl}/ubigeo/regiones`;

	constructor(private readonly http: HttpClient) {}

	obtenerDistritos(codigoProvincia: string): Observable<Distrito[]> {
		const params = new HttpParams().set('codigoProvincia', codigoProvincia);

		return this.http.get<Distrito[]>(this.apiUrl, { params });
	}

	obtenerProvincias(codigoRegion: string): Observable<Provincia[]> {
		const params = new HttpParams().set('codigoRegion', codigoRegion);

		return this.http.get<Provincia[]>(this.provinciasApiUrl, { params });
	}

	obtenerRegiones(): Observable<Region[]> {
		return this.http.get<Region[]>(this.regionesApiUrl);
	}
}
