import { Component, inject, signal } from '@angular/core';
import { ApiService, Corredor } from '../../services/api/api.service';
import { map } from 'rxjs';

// ========================================
// COMPONENTE HTTP CLIENT
// ========================================

/**
 * Componente que demuestra el uso de HttpClient, Observables y Signals
 *
 * Funcionalidades:
 * 1. Carga de datos desde API con HttpClient
 * 2. Gestión de estado reactivo con Signals
 * 3. Transformación de datos con operadores RxJS
 * 4. Propagación reactiva entre componentes
 */
@Component({
  selector: 'app-http-client',
  standalone: true, // Componente standalone (no necesita módulo)
  imports: [], // Sin imports adicionales necesarios
  templateUrl: './http-client.html',
})
export class HttpClientComponent {
  // ====================================
  // INYECCIÓN DE DEPENDENCIAS
  // ====================================

  /**
   * Inyectamos el servicio API usando inject()
   * Este servicio es un SINGLETON (una sola instancia en toda la app)
   */
  api = inject(ApiService);

  // ====================================
  // ESTADO DEL COMPONENTE
  // ====================================

  /**
   * Signal que indica si hay una petición en curso
   *
   * Uso:
   * - Leer: if (this.cargando())
   * - Cambiar: this.cargando.set(true)
   *
   * En el template se usa para:
   * - Deshabilitar botones
   * - Mostrar spinners de carga
   */
  cargando = signal(false);

  /**
   * Array local que almacena los corredores
   * Se usa para mostrar la lista en el template con @for
   */
  corredores: Corredor[] = [];

  /**
   * Referencia a la Signal compartida del servicio
   *
   * ¿Por qué es importante?
   * Esta Signal está en el SERVICIO (no en el componente)
   * Eso significa que CUALQUIER componente puede leerla y modificarla
   *
   * Si otro componente cambia this.api.corredorSeleccionado.set('Juan'),
   * este componente lo verá automáticamente sin hacer nada extra
   */
  seleccionado = this.api.corredorSeleccionado;

  // ====================================
  // MÉTODOS DEL COMPONENTE
  // ====================================

  /**
   * CARGAR CORREDORES - Obtiene la lista desde el servidor
   *
   * Flujo completo:
   * 1. Activamos el indicador de carga (spinner)
   * 2. Obtenemos el token del localStorage (si existe)
   * 3. Hacemos la petición HTTP GET
   * 4. Transformamos los datos con el operador map() (opcional)
   * 5. Guardamos los datos en el array local
   * 6. Desactivamos el indicador de carga
   *
   * Operadores RxJS usados:
   * - pipe(): Permite encadenar operadores
   * - map(): Transforma los datos antes de recibirlos
   */
  cargarCorredores() {
    // 1. Activamos el indicador de carga
    this.cargando.set(true);

    // 2. Obtenemos el token (si no existe, usamos string vacío)
    const token = localStorage.getItem('token') || '';

    // 3. Hacemos la petición HTTP
    this.api
      .obtenerCorredores(token)
      .pipe(
        // 4. OPERADOR MAP - Transforma los datos
        // En este ejemplo solo los mostramos, pero podrías:
        // - Filtrar corredores por categoría
        // - Ordenarlos alfabéticamente
        // - Añadir propiedades calculadas
        // - Etc.
        map((corredores) => {
          console.log('📦 Datos recibidos del servidor:', corredores);
          console.log(`📊 Total de corredores: ${corredores.length}`);
          return corredores; // Devolvemos los datos sin modificar
        }),
      )
      .subscribe({
        // SUCCESS: Datos recibidos correctamente
        next: (corredores) => {
          // Guardamos los corredores en el estado local
          this.corredores = corredores;

          // Desactivamos el indicador de carga
          this.cargando.set(false);

          console.log('✅ Corredores cargados correctamente en el componente');
        },

        // ERROR: Problema con la petición
        error: (error) => {
          // Importante: Desactivar carga aunque haya error
          this.cargando.set(false);

          console.error('❌ Error al cargar corredores:', error);

          // Mensajes de error comunes:
          // - 401: Token inválido o expirado
          // - 403: Sin permisos
          // - 500: Error del servidor
          // - 0: Sin conexión a internet
        },
      });
  }

  /**
   * SELECCIONAR CORREDOR - Actualiza el estado global
   *
   * ¿Qué hace?
   * Actualiza la Signal compartida con el nombre del corredor seleccionado
   *
   * ¿Por qué es reactivo?
   * Como la Signal está en el SERVICIO:
   * - Este componente ve el cambio automáticamente
   * - Otros componentes suscritos también lo ven
   * - El template se actualiza automáticamente
   *
   * Esto es PROPAGACIÓN REACTIVA sin relación padre-hijo
   *
   * @param nombreCorredor - Nombre del corredor a seleccionar
   */
  seleccionar(nombreCorredor: string) {
    // Actualizamos la Signal compartida del servicio
    this.api.corredorSeleccionado.set(nombreCorredor);

    console.log(`👤 Corredor seleccionado: ${nombreCorredor}`);

    // Nota: Podrías también actualizar el BehaviorSubject aquí si quisieras:
    // this.api.listaCorredores$.next(nuevaLista);
  }
}

// ========================================
// CONCEPTOS CLAVE PARA APRENDER
// ========================================

/*
 * 1. OBSERVABLES
 *    - Son streams de datos asíncronos
 *    - Necesitas .subscribe() para recibir los datos
 *    - Las peticiones HTTP devuelven Observables
 *
 * 2. OPERADORES RXJS
 *    - map: Transforma los datos
 *    - tap: Ejecuta código sin modificar datos (útil para logs)
 *    - catchError: Captura errores y devuelve un valor por defecto
 *    - switchMap: Cancela peticiones anteriores (útil en búsquedas)
 *
 * 3. SIGNALS
 *    - Nueva API de Angular (v16+)
 *    - Para estado reactivo simple
 *    - Más fácil que BehaviorSubject para casos básicos
 *
 * 4. ESTADO LOCAL vs GLOBAL
 *    - Local (aquí): cargando, corredores (solo este componente)
 *    - Global (servicio): corredorSeleccionado (todos los componentes)
 *
 * 5. PROPAGACIÓN REACTIVA
 *    - Cambios en el servicio se propagan automáticamente
 *    - No necesitas relación padre-hijo entre componentes
 *    - Es el objetivo principal de esta práctica
 */
