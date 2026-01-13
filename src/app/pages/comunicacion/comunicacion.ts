import { Component } from '@angular/core';
import { Hijo } from '../../components/hijo/hijo';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-comunicacion',
  standalone: true,
  imports: [Hijo, FormsModule, CommonModule],
  templateUrl: './comunicacion.html',
  styleUrl: './comunicacion.css',
})
export class Comunicacion {
  mensajeDelHijo: string = '';
  colorSeleccionado: string = '';

  recibirMensaje(mensaje: string) {
    this.mensajeDelHijo = mensaje;
    console.log('Mensaje recibido del hijo:', mensaje);
  }
}
