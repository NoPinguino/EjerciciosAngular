import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonDetalles } from './pokemon-detalles';

describe('PokemonDetalles', () => {
  let component: PokemonDetalles;
  let fixture: ComponentFixture<PokemonDetalles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonDetalles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonDetalles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
