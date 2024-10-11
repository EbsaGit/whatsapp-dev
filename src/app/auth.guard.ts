import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  return true;
};

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    // Verificar si el token existe en el localStorage
    const token = localStorage.getItem('zohoAccessToken');
    if (token) {
      console.log("No hay token");
      return true;
    } else {
      // Si no existe, redirigir al usuario a la página de login
      this.router.navigate(['/login']);
      return false;
    }
  }
}
