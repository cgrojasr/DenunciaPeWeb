import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Evidencias } from './evidencias';

describe('Evidencias', () => {
  let component: Evidencias;
  let fixture: ComponentFixture<Evidencias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Evidencias],
    }).compileComponents();

    fixture = TestBed.createComponent(Evidencias);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
