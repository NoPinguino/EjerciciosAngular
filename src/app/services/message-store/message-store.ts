import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MessageStore {
  mensaje = signal<string>('Ningún mensaje');

  setMensaje(texto: string) {
    this.mensaje.set(texto);
  }

  limpiar() {
    this.mensaje.set('Ningún mensaje');
  }
}
