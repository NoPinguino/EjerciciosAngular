import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-directivas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './directivas.html',
})
export class Directivas {
  /* ================= DIRECTIVAS ESTRUCTURALES ================= */

  // Controla la visualización del contenido con *ngIf
  mostrar = false;
  // Lista usada por *ngFor para generar elementos dinámicamente
  directivas = ['*ngFor', '*ngIf', '*ngSwitch'];
  // Variable usada por *ngSwitch para mostrar contenido según el valor
  nivel = 'basico';

  /* ================= DIRECTIVAS ATRIBUTO ================= */

  // Controla la aplicación dinámica de clases con ngClass
  activo = false;
  // Controla el tamaño del texto con ngStyle
  ngStyleTextSize = 18;

  /* ================= PIPES ================= */

  // Texto usado para demostrar la pipe uppercase
  nombre = 'Misael';
  // Fecha actual usada con la pipe date
  fechaActual = new Date();
  // Valor numérico usado con la pipe currency
  precio = 49.99;
  // Texto largo usado con la pipe slice
  textoLargo = 'Angular es un framework muy potente para crear aplicaciones web';
  // Objeto usado con la pipe json (útil para depuración)
  usuario = {
    nombre: 'Misael',
    rol: 'Estudiante',
    activo: true,
  };
}
