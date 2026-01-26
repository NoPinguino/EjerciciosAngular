import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
   * GET CORREDORES - Obtener lista de corredores
   *
   * ¿Qué hace?
   * - Pide al servidor la lista completa de corredores
   * - Requiere autenticación (token en headers)
   *
   * @param token - Token, en mi caso es un string vacio, no hay autenticación.
   * @returns Observable<Corredor[]> - Stream con el array de corredores
   *
   * ¿CÓMO USAR EN EL COMPONENTE?:
   * this.api.getCorredores(miToken).subscribe(corredores => {
   *   console.log(corredores); // Array de corredores
   * });
   */
  obtenerCorredores(token: string): Observable<Corredor[]> {
    return this.http.get<Corredor[]>(this.urlBase, {
      headers: {
        Authorization: token, // Token para autenticar
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
