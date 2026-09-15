import { TestBed } from '@angular/core/testing';
import { GoogleMapsLoaderService } from './google-maps-loader.service';

describe('GoogleMapsLoaderService', () => {
  let service: GoogleMapsLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleMapsLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should report isLoaded true if google.maps is defined on window', () => {
    (window as any).google = { maps: {} };
    expect(service.isLoaded()).toBe(true);
  });
});
