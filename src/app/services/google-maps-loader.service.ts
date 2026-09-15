import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GoogleMapsLoaderService {
  private scriptLoaded = false;
  private loadPromise: Promise<void> | null = null;

  load(): Promise<void> {
    if (this.scriptLoaded || (typeof window !== 'undefined' && (window as any).google?.maps)) {
      this.scriptLoaded = true;
      return Promise.resolve();
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      if (typeof document === 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.type = 'text/javascript';
      const key = environment.googleMapsApiKey ? `key=${environment.googleMapsApiKey}&` : '';
      script.src = `https://maps.googleapis.com/maps/api/js?${key}libraries=places,geometry`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };

      script.onerror = (error) => {
        console.error('Error al cargar Google Maps API:', error);
        reject(error);
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  isLoaded(): boolean {
    return this.scriptLoaded || (typeof window !== 'undefined' && !!(window as any).google?.maps);
  }
}
