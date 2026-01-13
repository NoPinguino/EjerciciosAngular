import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-directivas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './directivas.html',
  styleUrl: './directivas.css',
})
export class Directivas {
  // ngIf
  mostrar = false;
  // ngFor
  animales = ['Perro', 'Gato', 'Conejo', 'Pájaro'];
  // ngSwitch
  nivel = 'basico';
}
