import { Component, inject } from '@angular/core';
// Importamos el servicio en el que se almacena:
import { MessageStore } from '../../services/message-store/message-store';

@Component({
  selector: 'app-message-sender',
  imports: [],
  templateUrl: './message-sender.html',
})
export class MessageSender {
  // 1. Nos guardamos una instancia del servicio para acceder a sus datos y métodos:
  store = inject(MessageStore);
  // 2. Este es el String que voy a enviar, podría ser cualquier otra cosa:
  mensaje: string = 'Mensaje enviado con store.';
  // 3. Tengo un botón enviar que ejecuta esta función:
  enviar(mensaje: string) {
    this.store.setMensaje(mensaje);
  }
  // Extra: Llamo al método limpiar, guardado en el servicio store
  limpiar() {
    this.store.limpiar();
  }
}
