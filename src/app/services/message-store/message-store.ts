// 0. Importamos signal e injectable:
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MessageStore {
  // 1. Creamos el dato que vamos a compartir entre documentos:
  mensaje = signal<string>('Ningún mensaje');

  setMensaje(texto: string) {
    this.mensaje.set(texto);
  }

  limpiar() {
    this.mensaje.set('Ningún mensaje');
  }
}
