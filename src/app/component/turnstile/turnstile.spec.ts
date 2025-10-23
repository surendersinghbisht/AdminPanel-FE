import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Turnstile } from './turnstile';

describe('Turnstile', () => {
  let component: Turnstile;
  let fixture: ComponentFixture<Turnstile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Turnstile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Turnstile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
