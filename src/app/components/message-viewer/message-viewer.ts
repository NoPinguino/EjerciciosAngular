import { Component, inject } from '@angular/core';
// Importamos el servicio en el que se almacena:
import { MessageStore } from '../../services/message-store/message-store';

@Component({
  selector: 'app-message-viewer',
  imports: [],
  templateUrl: './message-viewer.html',
})
export class MessageViewer {
  store = inject(MessageStore);
  // En el html accedo al mensaje usando {store.mensaje()} (en un div)
}
