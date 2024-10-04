import { Injectable } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket$: WebSocketSubject<any> | null = null;
  private messageSubject = new Subject<any>();  //Observable para los mensajes recibidos
  private isSocketClosed: boolean = false;  //Indicador manual de cierre de socket

  constructor() {
    this.setupWebSocket();  //Conectar al cargar la app
  }

  //Función para configurar el WebSocket
  private setupWebSocket(): void {
    this.isSocketClosed = false;  // Reiniciar el indicador de cierre
    this.socket$ = webSocket('wss://devtechpy.com');

    this.socket$.subscribe(
      (message) => this.onMessageReceived(message),  // Manejar mensajes
      (err) => this.onSocketError(err),  // Manejo de errores
      () => this.onSocketClose()  // Cuando el WebSocket se cierra
    );
  }

  // Método que se activa al recibir un mensaje
  private onMessageReceived(message: any): void {
    //console.log("Mensaje recibido: ", message);
    this.messageSubject.next(message);  // Emitir el mensaje recibido
  }

  // Método que se activa cuando hay un error en el WebSocket
  private onSocketError(error: any): void {
    //console.error("Error en WebSocket: ", error);
    this.isSocketClosed = true;  // Marcar el socket como cerrado
    this.reconnectWebSocket();  // Intentar reconectar en caso de error
  }

  // Método que se activa cuando el WebSocket se cierra
  private onSocketClose(): void {
    //console.log("Conexión WebSocket cerrada.");
    this.isSocketClosed = true;  // Marcar el socket como cerrado
    this.reconnectWebSocket();  // Intentar reconectar al cerrar
  }

  // Función para reconectar el WebSocket
  private reconnectWebSocket(): void {
    if (this.isSocketClosed) {
      //console.log("Intentando reconectar WebSocket...");
      setTimeout(() => {
        this.setupWebSocket();  // Intentar reconectar después de 5 segundos
      }, 5000);
    }
  }

  // Método para enviar mensajes a través del WebSocket
  sendMessage(msg: any): void {
    if (this.socket$ && !this.isSocketClosed) {
      this.socket$.next(msg);
    }
  }

  // Método para obtener los mensajes recibidos como Observable
  getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  // Método para cerrar manualmente el WebSocket
  close(): void {
    if (this.socket$) {
      this.isSocketClosed = true;  // Marcar manualmente el socket como cerrado
      this.socket$.complete();
      //console.log("Conexión WebSocket cerrada manualmente.");
    }
  }
}