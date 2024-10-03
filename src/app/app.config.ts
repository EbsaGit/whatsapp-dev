import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';  // Importar provideHttpClient

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),  // Proveer las rutas
    provideHttpClient()     // Proveer HttpClient para que funcione en toda la app
  ]
};
