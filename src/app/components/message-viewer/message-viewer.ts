import { Component } from '@angular/core';
import { MessageStore } from '../../services/message-store/message-store';

@Component({
  selector: 'app-message-viewer',
  imports: [],
  templateUrl: './message-viewer.html',
})
export class MessageViewer {
  constructor(public store: MessageStore) {}
}
