import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';
import { AuthService } from '../../security/auth.service';

describe('History Home', () => {
  let fixture: ComponentFixture<Home>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: { getIdentifier: () => '12345678' } },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
  });

  it('lista las denuncias del documento del usuario', () => {
    http
      .expectOne((r) => r.url.endsWith('/denuncias/denunciante/12345678'))
      .flush([{ id: 7, fechaDenuncia: '2026-01-02T10:00:00', idTipoDenuncia: null, referencia: 'Frente al parque' }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('7');
    expect(fixture.nativeElement.textContent).toContain('Frente al parque');
  });
});
