import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { WebsocketService } from './services/websocket.service';
import { MessageService } from './services/message.service';

@Component({
  selector: 'app-root',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'whatsapp-dev';
  chats: any[] = [];
  currentChat: any = null;
  currentPage: number = 1;
  limit: number = 20;
  accessToken: string = "EAAQ1oGRqNv8BO01iKA18IyHPzIhkZBgLKmaBoqrLK8ZAF292F0dOna5uURvftPK1nC8ysVxKFUjSu3Hnec6F9EhgVSYlH45z2ZAB376kJF3RQZAG04GVHgYDNJOavF4FApmWilV1Qtwb7ECxVAaLb8leyVQ6pHcTxCXjUT4G3ZApnkLI9vWt8SE4jZBQhinFNEMaEessoCJPoU5AEStak57LnWTVdsgNf10nQZD";

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor(
    private websocketService: WebsocketService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadChats();
    this.websocketService.connect();
  
    this.websocketService.getMessages().subscribe((msg) => {
      if (this.currentChat && msg.recipient_phone === this.currentChat.phone) {
        // Verificar si es necesario agregar un separador de fecha
        const lastMessageDate = this.currentChat.messages.length > 0
          ? new Date(this.currentChat.messages[this.currentChat.messages.length - 1].time).toLocaleDateString()
          : null;
        const newMessageDate = new Date(msg.time).toLocaleDateString();
  
        // Agregar marcador de fecha si es necesario
        if (lastMessageDate && newMessageDate !== lastMessageDate) {
          console.log("Renderizando marcador de fecha...");
          this.currentChat.messages.push({ type: 'date', text: this.formatMessageDate(msg.time) });
        }
  
        // Verificar si el mensaje tiene un archivo adjunto o es un mensaje de texto
        let newMessage: any;
        if (msg.media_id) {
          console.log("Renderizando mensaje multimedia...");
          newMessage = {
            ...msg,
            sender: 'received',
            time: new Date(),
            file_name: msg.file_name,
            media_id: msg.media_id,
            tipo_media: msg.tipo_media
          };
        } else {
          console.log("Renderizando mensaje de texto...");
          newMessage = {
            ...msg,
            sender: 'received',
            time: new Date(),
            text: msg.text
          };
        }
  
        // Agregar el nuevo mensaje (texto o multimedia) al chat actual
        this.currentChat.messages.push(newMessage);
  
        // Hacer scroll hasta el fondo después de agregar el nuevo mensaje
        this.scrollToBottom();
      }
    });
  }
  



  onScroll(): void {
    const element = this.messagesContainer.nativeElement;
    if (element.scrollTop === 0 && this.currentChat) {
      this.loadMoreMessages();  // Cargar más mensajes cuando el scroll llega arriba
    }
  }

  // Cargar la lista de chats
  loadChats(): void {
    this.messageService.getChats().subscribe((chats) => {
      this.chats = chats;
    });
  }

  // Cargar mensajes paginados
  loadMessages(phone: string): void {
    this.currentPage = 1;  // Restablecer la página a 1 al seleccionar un nuevo chat
    this.messageService.getPaginatedMessages(phone, this.currentPage, this.limit).subscribe((messages) => {
      this.currentChat = { phone, messages: [] };
      console.log("currentChat: ", this.currentChat);
      this.processMessagesWithDates(messages);
      this.scrollToBottom();  // Asegurarse de que el scroll está abajo
    });
  }

  // Prepend en lugar de push para mantener los mensajes en orden cronológico
  processMessagesWithDates(messages: any[]): void {
    let nextMessageDate: string | null = null;

    messages.forEach((msg, index) => {

      const messageDate = new Date(msg.time).toLocaleDateString();
      if (index < messages.length - 1) {
        const nextMsg = messages[index + 1];
        nextMessageDate = new Date(nextMsg.time).toLocaleDateString();
      }

      this.currentChat?.messages.unshift(msg);

      if (messageDate !== nextMessageDate && nextMessageDate !== null) {
        this.currentChat?.messages.unshift({ type: 'date', text: this.formatMessageDate(msg.time) });
      }
    });
  }


  formatMessageDate(date: string): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const messageDate = new Date(date);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Hoy";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Ayer";
    } else {
      return messageDate.toLocaleDateString();  // Formato de fecha completo
    }
  }

  selectedFile: File | null = null;  // Variable para almacenar el archivo seleccionado

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  // Método para enviar un mensaje
  sendMessage(messageText: string): void {
    console.log("Enviando mensaje...");
    if (this.selectedFile) {
      console.log("Archivo adjunto");
      this.sendFile(this.selectedFile, this.currentChat.phone);  // Enviar archivo adjunto
    } else if (this.currentChat && messageText.trim()) {
      console.log("Mensaje de texto");
      const message = {
        text: messageText,
        phoneRecipiest: this.currentChat.phone,
        Phone_Number_ID: "311617238711471",
        display_phone_number: "15556242830",
        accessToken: this.accessToken
      };
      this.messageService.sendMessage(message).subscribe((response) => {
        this.currentChat.messages.push({
          ...message,
          sender: 'sent',
          time: new Date()
        });
        this.scrollToBottom();
      });
    }
  }

  sendFile(file: File, phoneRecipient: string): void {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("phoneRecipiest", phoneRecipient);
    formData.append("Phone_Number_ID", "311617238711471");
    formData.append("display_phone_number", "15556242830");
    formData.append("accessToken", this.accessToken);

    this.messageService.uploadFile(formData, phoneRecipient, this.accessToken).subscribe((response) => {
      const newMessage = {
        sender: "sent",
        time: new Date(),
        message_id: response.mongoDB.message_id,
        media_id: response.media_id,
        tipo_media: response.mongoDB.tipo_media,
        file_name: file.name
      };

      this.currentChat.messages.push(newMessage);
      this.scrollToBottom();
      this.selectedFile = null;  // Reiniciar la selección de archivo
    });
  }

  // Método para mantener el scroll en la parte inferior
  scrollToBottom(): void {
    try {
      setTimeout(() => {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }, 0);
    } catch (err) {
      console.log('Error al hacer scroll', err);
    }
  }

  // Cargar más mensajes al hacer scroll hacia arriba (scroll infinito)
  loadMoreMessages(): void {
    console.log("cargando mas mensajes...");
    const element = this.messagesContainer.nativeElement;
    const previousScrollHeight = element.scrollHeight;
    const previousScrollTop = element.scrollTop;

    this.currentPage++;
    this.messageService.getPaginatedMessages(this.currentChat.phone, this.currentPage, this.limit).subscribe((messages) => {
      this.processMessagesWithDates(messages);

      // Restaurar la posición del scroll
      setTimeout(() => {
        element.scrollTop = element.scrollHeight - previousScrollHeight + previousScrollTop;
      }, 0);
    });
  }

  downloadFile(mediaId: string, fileName: string): void {
    const downloadUrl = `https://devtechpy.com/api/download-image/311617238711471/${mediaId}`;
    fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName || `${mediaId}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => console.error('Error al descargar el archivo:', error));
  }
  
}
