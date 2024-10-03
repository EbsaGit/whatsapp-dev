import { Injectable } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket$: WebSocketSubject<any> | null = null;
  private messageSubject = new Subject<any>();  // Observable para los mensajes recibidos

  constructor() {
    this.connect();
  }

  connect(): void {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket('wss://devtechpy.com');
      this.socket$.subscribe(
        (message) => this.onMessageReceived(message),
        (err) => console.log(err),
        () => console.log('WebSocket cerrado.')
      );
    }
  }

  sendMessage(msg: any): void {
    if (this.socket$) {
      this.socket$.next(msg);
    }
  }

  onMessageReceived(msg: any): void {
    console.log("Mensaje recibido: ", msg);
    this.messageSubject.next(msg);  // Emitir el mensaje recibido
  }

  // Método para obtener los mensajes recibidos como Observable
  getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  close(): void {
    if (this.socket$) {
      this.socket$.complete();
    }
  }
}
