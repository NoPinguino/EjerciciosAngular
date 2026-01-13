import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Directivas } from './pages/directivas/directivas';
import { Comunicacion } from './pages/comunicacion/comunicacion';
import { Formularios } from './pages/formularios/formularios';
import { Servicios } from './pages/servicios/servicios';
import { HttpClient } from './pages/http-client/http-client';
import { DataBinding } from './pages/data-binding/data-binding';

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
    path: 'formularios',
    component: Formularios,
  },
  {
    path: 'servicios',
    component: Servicios,
  },
  {
    path: 'http-client',
    component: HttpClient,
  },
  {
    path: '**',
    redirectTo: 'inicio',
  },
];
