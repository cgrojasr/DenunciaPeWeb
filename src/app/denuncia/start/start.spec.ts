import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Start } from './start';

describe('Start', () => {
  let component: Start;
  let fixture: ComponentFixture<Start>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Start],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Start);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
