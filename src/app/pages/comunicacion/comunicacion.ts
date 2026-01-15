import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Hijo } from '../../components/hijo/hijo';
import { MessageSender } from '../../components/message-sender/message-sender';
import { MessageViewer } from '../../components/message-viewer/message-viewer';

@Component({
  selector: 'app-comunicacion',
  standalone: true,
  imports: [CommonModule, FormsModule, Hijo, MessageSender, MessageViewer],
  templateUrl: './comunicacion.html',
})
export class Comunicacion {
  // Comunicación padre-hijo
  mensajeDelHijo: string = '';
  colorSeleccionado: string = '';

  // Router para navegación por URL
  router = inject(Router);

  /* COMUNICACIÓN POR URL (PASANDO ID) */
  pokemons = [
    { id: 1, nombre: 'Bulbasaur' },
    { id: 4, nombre: 'Charmander' },
    { id: 7, nombre: 'Squirtle' },
    { id: 25, nombre: 'Pikachu' },
    { id: 39, nombre: 'Jigglypuff' },
    { id: 52, nombre: 'Meowth' },
    { id: 150, nombre: 'Mewtwo' },
    { id: 151, nombre: 'Mew' },
  ];

  recibirMensaje(mensaje: string) {
    this.mensajeDelHijo = mensaje;
    console.log('Mensaje recibido del hijo:', mensaje);
  }

  verDetalles(id: number) {
    this.router.navigate(['/pokemon', id]); // coincide con la ruta definida
  }
}
