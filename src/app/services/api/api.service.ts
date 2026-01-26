import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

// ========================================
// INTERFACES (Tipos de datos)
// ========================================

/**
 * Interfaz que define la estructura de un corredor
 * Se usa para tipar los datos que vienen del servidor
 */
export interface Corredor {
  corredor: string; // Nombre del corredor
  dorsal: number; // Número de dorsal
  categoria: string; // Categoría (junior, senior, etc.)
}

/**
 * Interfaz que define la respuesta del login
 * El servidor devuelve un token JWT para autenticación
 */
export interface LoginResponse {
  token: string; // Token de autenticación JWT
}

// ========================================
// SERVICIO API
// ========================================

/**
 * Servicio que gestiona todas las peticiones HTTP a la API
 *
 * @Injectable({ providedIn: 'root' })
 * Significa que este servicio está disponible en toda la aplicación
 * Angular crea UNA SOLA INSTANCIA (Singleton) que se comparte
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // ====================================
  // PROPIEDADES
  // ====================================

  /**
   * HttpClient - Cliente HTTP de Angular
   * Se inyecta usando la función moderna 'inject()'
   * Lo usamos para hacer peticiones GET, POST, etc.
   */
  http = inject(HttpClient);

  /**
   * URL base de la API
   * Todos los endpoints apuntan a esta dirección
   */
  private urlBase = 'https://dam.colegiolitterator.es/php/bbdd.php';

  // ====================================
  // ESTADO REACTIVO
  // ====================================

  /**
   * BehaviorSubject - Observable con estado inicial
   *
   * ¿Qué es? Un tipo especial de Observable que:
   * 1. Guarda el último valor emitido
   * 2. Emite ese valor inmediatamente a nuevos suscriptores
   * 3. Permite PROPAGAR cambios a TODOS los componentes suscritos
   *
   * ¿Para qué? Para compartir el array de corredores entre componentes
   * sin que tengan relación padre-hijo. Cualquier componente puede
   * suscribirse y recibir actualizaciones automáticamente.
   *
   * Ejemplo: Si actualizas los corredores en el componente A,
   * el componente B los verá automáticamente sin hacer nada.
   */
  listaCorredores$ = new BehaviorSubject<Corredor[]>([]);

  /**
   * Signal - Estado reactivo de Angular (nueva API)
   *
   * ¿Qué es? Una variable reactiva que notifica cambios automáticamente
   * Similar a BehaviorSubject pero más simple y moderna
   *
   * ¿Para qué? Guardar el nombre del corredor seleccionado actualmente
   * y compartirlo entre componentes
   *
   * Para leer:  this.corredorSeleccionado()
   * Para cambiar: this.corredorSeleccionado.set('nuevo nombre')
   */
  corredorSeleccionado = signal('');

  // ====================================
  // MÉTODOS HTTP
  // ====================================

  /**
   * LOGIN - Autenticación de usuario
   *
   * ¿Qué hace?
   * - Envía credenciales (email y contraseña) al servidor
   * - El servidor valida y devuelve un token JWT
   *
   * @param email - Correo electrónico del usuario
   * @param password - Contraseña del usuario
   * @returns Observable<LoginResponse> - Stream con la respuesta del servidor
   *
   * ¿Por qué Observable?
   * Porque las peticiones HTTP son ASÍNCRONAS (tardan tiempo).
   * El Observable emite el valor cuando la respuesta llega del servidor.
   *
   * Uso en componente:
   * this.api.login(email, pass).subscribe(respuesta => {
   *   console.log(respuesta.token); // Token recibido
   * });
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      this.urlBase,
      {
        usuario: email, // Campo que espera el servidor
        clave: password, // Campo que espera el servidor
        accion: 'validar', // Le decimos al servidor que queremos validar usuario
      },
      {
        headers: {
          'Content-Type': 'application/json', // Indicamos que enviamos JSON
        },
      },
    );
  }

  /**
   * GET CORREDORES - Obtener lista de corredores
   *
   * ¿Qué hace?
   * - Pide al servidor la lista completa de corredores
   * - Requiere autenticación (token en headers)
   *
   * @param token - Token JWT obtenido en el login
   * @returns Observable<Corredor[]> - Stream con el array de corredores
   *
   * ¿Cómo funciona la autenticación?
   * El token se envía en el header "Authorization" con formato:
   * "Bearer tu_token_aquí"
   *
   * El servidor valida el token y si es válido, devuelve los datos.
   * Si no es válido, devuelve error 401 (No autorizado)
   *
   * Uso en componente:
   * this.api.getCorredores(miToken).subscribe(corredores => {
   *   console.log(corredores); // Array de corredores
   * });
   */
  obtenerCorredores(token: string): Observable<Corredor[]> {
    return this.http.get<Corredor[]>(this.urlBase, {
      headers: {
        Authorization: `Bearer ${token}`, // Token para autenticar
        'Content-Type': 'application/json', // Esperamos JSON de respuesta
      },
    });
  }
}

// ========================================
// NOTAS IMPORTANTES PARA APRENDER
// ========================================

/*
 * 1. OBSERVABLES vs PROMISES
 *    - Las Promises se resuelven UNA vez
 *    - Los Observables pueden emitir MÚLTIPLES valores
 *    - Necesitas .subscribe() para recibir los datos
 *
 * 2. BEHAVIORSUBJECT
 *    - Perfecto para compartir estado entre componentes
 *    - Siempre tiene un valor (nunca undefined al inicio)
 *    - Los nuevos suscriptores reciben el último valor inmediatamente
 *
 * 3. SIGNALS
 *    - Nueva API de Angular (v16+)
 *    - Más simple que BehaviorSubject para casos básicos
 *    - Integración perfecta con templates
 *
 * 4. HTTPCLIENT
 *    - Siempre devuelve Observables
 *    - Maneja automáticamente JSON
 *    - Integra interceptors para añadir lógica global
 *
 * 5. INYECCIÓN DE DEPENDENCIAS
 *    - inject() es la forma moderna (Angular 14+)
 *    - Antes se usaba el constructor con parámetros
 *    - Angular crea y gestiona las instancias automáticamente
 */
