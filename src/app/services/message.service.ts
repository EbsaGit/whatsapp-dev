import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';  // Asegúrate de que el HttpClient esté correctamente importado
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = 'https://devtechpy.com/api/messages';
  private apiUtilsUrl = 'https://devtechpy.com/api';

  constructor(private http: HttpClient) { }  // HttpClient debe inyectarse aquí

  // Método para obtener los chats
  getChats(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/chats`);
  }

  // Método para obtener mensajes paginados
  getPaginatedMessages(phone: string, page: number, limit: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${phone}/paginated?page=${page}&limit=${limit}`);
  }

  // Método para enviar un mensaje con o sin archivo adjunto
  sendMessage(message: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/send_save`, message);
  }

  // Método para enviar archivos adjuntos
  uploadFile(formData: FormData, phoneRecipient: string, accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });

    return this.http.post<any>(`${this.apiUtilsUrl}/upload-file/311617238711471/${phoneRecipient}`, formData, {headers});
  }

  //Marca el chat como leido
  markChatAsRead(phone: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/chats/mark-as-read/${phone}`, {});
  }

  getAccessToken(code: string): Observable<any> {
    return this.http.post<any>(`${this.apiUtilsUrl}/exchange-token/${code}`, {});
  }

}
