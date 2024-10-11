import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';  // Importamos el componente Login
import { ChatsComponent } from './chats/chats.component';  // Importamos el componente Chats

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },  // Redirigir a login por defecto
    { path: 'login', component: LoginComponent },          // Ruta para login
    { path: 'chats', component: ChatsComponent },         // Ruta para chats
    { path: '**', redirectTo: 'login' }                    // Redirigir a login si la ruta no existe
  ];
