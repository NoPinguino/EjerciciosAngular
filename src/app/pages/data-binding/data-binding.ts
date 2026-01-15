import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-data-binding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-binding.html',
})
export class DataBinding {
  // Interpolation
  nombre = 'Misael';

  // Property binding
  deshabilitado = false;

  mostrarAlert() {
    alert('Has pulsado el botón con property binding');
  }

  // Two-way binding
  mensaje = '';

  contador = 0;

  // Event binding
  incrementar() {
    this.contador++;
  }
}
