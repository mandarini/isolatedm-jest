import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { KtrnComponent } from './ktrn.component';

describe('KtrnComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KtrnComponent],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: Router,
          useValue: {},
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    expect('hello').toBeTruthy();
  });
});
