import { Component } from '@angular/core';
import { MessageStore } from '../../services/message-store/message-store';

@Component({
  selector: 'app-message-sender',
  imports: [],
  templateUrl: './message-sender.html',
})
export class MessageSender {
  constructor(private store: MessageStore) {}

  enviar(mensaje: string) {
    this.store.setMensaje(mensaje);
  }

  limpiar() {
    this.store.limpiar();
  }
}
