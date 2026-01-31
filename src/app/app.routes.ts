import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Directivas } from './pages/directivas/directivas';
import { Comunicacion } from './pages/comunicacion/comunicacion';
import { Formularios } from './pages/formularios/formularios';
import { HttpClientComponent } from './pages/http-client/http-client';
import { DataBinding } from './pages/data-binding/data-binding';
import { PokemonDetalles } from './pages/pokemon-detalles/pokemon-detalles';
import { PokeApi } from './pages/poke-api/poke-api';

export const routes: Routes = [
  {
    path: '',
    component: Inicio,
  },
  {
    path: 'data-binding',
    component: DataBinding,
  },
  {
    path: 'directivas',
    component: Directivas,
  },
  {
    path: 'comunicacion',
    component: Comunicacion,
  },
  {
    path: 'pokemon/:id',
    component: PokemonDetalles,
  },
  {
    path: 'formularios',
    component: Formularios,
  },
  {
    path: 'http-client',
    component: HttpClientComponent,
  },
  {
    path: 'poke-api',
    component: PokeApi,
  },
  {
    path: '**',
    redirectTo: 'inicio',
  },
];
