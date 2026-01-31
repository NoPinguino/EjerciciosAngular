import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokeApi } from './poke-api';

describe('PokeApi', () => {
  let component: PokeApi;
  let fixture: ComponentFixture<PokeApi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokeApi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokeApi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
