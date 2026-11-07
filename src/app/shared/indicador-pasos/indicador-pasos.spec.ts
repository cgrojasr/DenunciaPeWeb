import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IndicadorPasos } from './indicador-pasos';

describe('IndicadorPasos', () => {
  let component: IndicadorPasos;
  let fixture: ComponentFixture<IndicadorPasos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndicadorPasos],
    }).compileComponents();

    fixture = TestBed.createComponent(IndicadorPasos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should highlight current step and complete previous steps', async () => {
    fixture.componentRef.setInput('pasoActual', 2);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const badges = compiled.querySelectorAll('.step-badge');
    expect(badges.length).toBe(4);

    // Paso 1: completado
    expect(badges[0].classList.contains('step-completed')).toBe(true);
    expect(badges[0].textContent?.trim()).toBe('✓');

    // Paso 2: activo
    expect(badges[1].classList.contains('step-active')).toBe(true);
    expect(badges[1].textContent?.trim()).toBe('2');

    // Paso 3: pendiente
    expect(badges[2].classList.contains('step-pending')).toBe(true);
    expect(badges[2].textContent?.trim()).toBe('3');
  });
});
