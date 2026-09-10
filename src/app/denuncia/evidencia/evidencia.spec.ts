import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Evidencia } from './evidencia';

describe('Evidencia', () => {
  let component: Evidencia;
  let fixture: ComponentFixture<Evidencia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Evidencia],
    }).compileComponents();

    fixture = TestBed.createComponent(Evidencia);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
