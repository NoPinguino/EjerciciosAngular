import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // <-- IMPORTANTE

@Component({
  selector: 'app-hijo',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './hijo.html',
})
export class Hijo {
  @Input() estilo: string = ''; // Recibe el estilo del padre
  @Output() mensajeAlPadre = new EventEmitter<string>();

  mensaje: string = '';

  enviarMensaje() {
    if (this.mensaje.trim()) {
      this.mensajeAlPadre.emit(this.mensaje);
      this.mensaje = '';
    }
  }
}
