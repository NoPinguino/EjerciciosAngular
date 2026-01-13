import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-data-binding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-binding.html',
  styleUrls: ['./data-binding.css'],
})
export class DataBinding {
  // Interpolation
  nombre = 'Misael';

  // Property binding
  deshabilitado = false;

  // Two-way binding
  mensaje = '';
}
