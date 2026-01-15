import { Component } from '@angular/core';
import { Hijo } from '../../components/hijo/hijo';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageSender } from '../../components/message-sender/message-sender';
import { MessageViewer } from '../../components/message-viewer/message-viewer';

@Component({
  selector: 'app-comunicacion',
  standalone: true,
  imports: [Hijo, FormsModule, CommonModule, MessageSender, MessageViewer],
  templateUrl: './comunicacion.html',
})
export class Comunicacion {
  mensajeDelHijo: string = '';
  colorSeleccionado: string = '';

  recibirMensaje(mensaje: string) {
    this.mensajeDelHijo = mensaje;
    console.log('Mensaje recibido del hijo:', mensaje);
  }
}
