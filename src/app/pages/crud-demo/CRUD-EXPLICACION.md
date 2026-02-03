# 📚 CRUD de Reseñas de Películas - Explicación Completa

## 📋 Índice
1. [Introducción](#introducción)
2. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
3. [Cloudflare Worker (Proxy CORS)](#cloudflare-worker-proxy-cors)
4. [Google Apps Script (Backend)](#google-apps-script-backend)
5. [Servicio Angular (reviews.service.ts)](#servicio-angular)
6. [Componente (crud-demo.ts)](#componente)
7. [Conceptos Clave de Angular](#conceptos-clave-de-angular)
8. [Flujo de Datos Completo](#flujo-de-datos-completo)
9. [Problemas Comunes y Soluciones](#problemas-comunes-y-soluciones)

---

## 🎯 Introducción

Este proyecto es un **CRUD completo** (Create, Read, Update, Delete) de reseñas de películas que utiliza:
- **Frontend**: Angular 18+ con Standalone Components
- **Proxy CORS**: Cloudflare Worker
- **Backend**: Google Apps Script conectado a Google Sheets
- **Comunicación**: Métodos HTTP REST estándar (GET, POST, PUT, DELETE)

---

## 🏗️ Arquitectura del Proyecto

```
┌─────────────────┐
│   Angular App   │
│  (Frontend)     │
└────────┬────────┘
         │ HTTP: GET/POST/PUT/DELETE
         ▼
┌─────────────────┐
│ Cloudflare      │
│ Worker (Proxy)  │
└────────┬────────┘
         │ Reenvía peticiones
         ▼
┌─────────────────┐
│ Google Apps     │
│ Script (API)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Google Sheets   │
│  (Base de datos)│
└─────────────────┘
```

### ¿Por qué esta arquitectura?

1. **Google Sheets como BD**: Fácil de usar, visual, sin configuración, gratuita
2. **Apps Script**: Servidor gratuito, 24/7, sin infraestructura
3. **Cloudflare Worker**: Resuelve problemas de CORS y permite usar métodos HTTP REST estándar
4. **Métodos REST**: GET para leer, POST para crear, PUT para actualizar, DELETE para eliminar

---

## 🌐 Cloudflare Worker (Proxy CORS)

### ¿Qué es y por qué lo necesitamos?

**Problema**: Google Apps Script tiene restricciones CORS al recibir peticiones POST/PUT/DELETE desde navegadores.

**Solución**: Un Cloudflare Worker actúa como **proxy intermedio** que:
1. Recibe peticiones del frontend Angular (con cualquier método HTTP)
2. Reenvía la petición a Google Apps Script
3. Añade los headers CORS necesarios a la respuesta

### Código del Worker

```javascript
export default {
  async fetch(request) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Manejo de preflight request
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const APPS_SCRIPT_URL =
      'https://script.google.com/macros/s/AKfycby.../exec';

    // Reenvía la petición a Google Apps Script
    const newRequest = new Request(APPS_SCRIPT_URL, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: request.method !== 'GET' ? await request.text() : null,
    });

    const response = await fetch(newRequest);

    return new Response(await response.text(), {
      status: response.status,
      headers: corsHeaders,
    });
  },
};
```

### Conceptos Importantes:

#### 1. **CORS (Cross-Origin Resource Sharing)**
- El navegador bloquea peticiones entre dominios diferentes por seguridad
- Los headers CORS permiten que el servidor autorice el acceso:
  - `Access-Control-Allow-Origin: *` → Permite cualquier origen
  - `Access-Control-Allow-Methods` → Métodos HTTP permitidos
  - `Access-Control-Allow-Headers` → Headers permitidos

#### 2. **Preflight Request (OPTIONS)**
- Antes de POST/PUT/DELETE, el navegador hace una petición OPTIONS
- Es una "pregunta" al servidor: "¿Puedo hacer esta petición?"
- Si el servidor responde con los headers CORS correctos, el navegador continúa

#### 3. **Request Proxying**
```javascript
const newRequest = new Request(APPS_SCRIPT_URL, {
  method: request.method,  // Mantiene GET/POST/PUT/DELETE
  body: request.method !== 'GET' ? await request.text() : null,
});
```
- Lee el body de la petición original
- Lo reenvía a Apps Script manteniendo el método HTTP

---

## 📊 Google Apps Script (Backend)

### Estructura de la Hoja de Cálculo

La hoja debe llamarse **"CineReviewAppScript"** y tener estas columnas:

| id | title | review | rating | date |
|----|-------|--------|--------|------|
| 1738... | Inception | Excelente película | 5 | 2026-02-02... |

### Código del Script (Actualizado para REST)

```javascript
const SHEET_NAME = "CineReviewAppScript";

/**
 * GET - Listar todas las reseñas o buscar una específica
 */
function doGet(e) {
  try {
    const sheet = getSheet();
    if (!sheet) return jsonOutput({ error: "Hoja no encontrada" });

    const data = getAllRows(sheet);

    if (e.parameter.id) {
      const id = String(e.parameter.id).trim();
      const item = data.find(r => String(r.id).trim() === id);
      return jsonOutput(item || { error: "No encontrado" });
    }

    return jsonOutput(data);

  } catch (err) {
    return jsonOutput({ error: err.message });
  }
}

/**
 * POST - Crear una nueva reseña
 * Body JSON: { title, review, rating }
 */
function doPost(e) {
  try {
    const sheet = getSheet();
    if (!sheet) return jsonOutput({ error: "Hoja no encontrada" });

    const body = JSON.parse(e.postData.contents);
    const id = Date.now().toString();
    const date = new Date().toISOString();

    sheet.appendRow([
      id,
      body.title || "",
      body.review || "",
      Number(body.rating) || 0,
      date
    ]);

    return jsonOutput({ ok: true, id });

  } catch (err) {
    return jsonOutput({ error: err.message });
  }
}

/**
 * PUT - Actualizar reseña existente
 * Body JSON: { id, title, review, rating }
 */
function doPut(e) {
  try {
    const sheet = getSheet();
    if (!sheet) return jsonOutput({ error: "Hoja no encontrada" });

    const body = JSON.parse(e.postData.contents);
    const rows = sheet.getDataRange().getValues();

    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).trim() === String(body.id).trim()) {
        sheet.getRange(i + 1, 2).setValue(body.title || "");
        sheet.getRange(i + 1, 3).setValue(body.review || "");
        sheet.getRange(i + 1, 4).setValue(Number(body.rating) || 0);
        return jsonOutput({ ok: true });
      }
    }

    return jsonOutput({ ok: false, error: "Reseña no encontrada" });

  } catch (err) {
    return jsonOutput({ error: err.message });
  }
}

/**
 * DELETE - Eliminar reseña existente
 * Body JSON: { id }
 */
function doDelete(e) {
  try {
    const sheet = getSheet();
    if (!sheet) return jsonOutput({ error: "Hoja no encontrada" });

    const body = JSON.parse(e.postData.contents);
    const rows = sheet.getDataRange().getValues();

    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).trim() === String(body.id).trim()) {
        sheet.deleteRow(i + 1);
        return jsonOutput({ ok: true });
      }
    }

    return jsonOutput({ ok: false, error: "Reseña no encontrada" });

  } catch (err) {
    return jsonOutput({ error: err.message });
  }
}

function getSheet() {
  try {
    const spreadsheet = SpreadsheetApp.getActive();
    if (!spreadsheet) return null;
    return spreadsheet.getSheetByName(SHEET_NAME);
  } catch (err) {
    return null;
  }
}

function getAllRows(sheet) {
  try {
    const rows = sheet.getDataRange().getValues();
    if (rows.length < 2) return [];
    const headers = rows.shift();
    return rows.map(r => {
      let obj = {};
      headers.forEach((h, i) => obj[h] = r[i]);
      return obj;
    });
  } catch (err) {
    return [];
  }
}

function jsonOutput(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Conceptos Importantes:

#### 1. **Métodos HTTP en Apps Script**
Apps Script soporta funciones específicas para cada método:
- `doGet(e)` → Maneja GET
- `doPost(e)` → Maneja POST
- `doPut(e)` → Maneja PUT
- `doDelete(e)` → Maneja DELETE

#### 2. **e.postData.contents**
```javascript
const body = JSON.parse(e.postData.contents);
```
- Para POST/PUT/DELETE, el body llega en `e.postData.contents` como string JSON
- Hay que parsearlo para obtener el objeto JavaScript

#### 3. **Índices de Sheets**
```javascript
sheet.getRange(i + 1, 2).setValue(body.title);
```
- **Fila**: `i + 1` porque el header ocupa la fila 1 y el array empieza en 0
- **Columna**: 2 = title, 3 = review, 4 = rating
- Los índices en Google Sheets empiezan en 1, no en 0

#### 4. **getAllRows()**
```javascript
function getAllRows(sheet) {
  const rows = sheet.getDataRange().getValues();
  const headers = rows.shift(); // Extrae primera fila
  return rows.map(r => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = r[i]);
    return obj;
  });
}
```
Convierte el array 2D de Sheets en array de objetos:
```
[[id, title, ...], [1, "Matrix", ...]] 
→ 
[{id: 1, title: "Matrix", ...}]
```

---

## 🔧 Servicio Angular (reviews.service.ts)

### Propósito
El servicio es la **capa de comunicación** entre el componente y el backend. Encapsula toda la lógica HTTP y mantiene las responsabilidades separadas.

### Código Completo:

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateReviewPayload {
  title: string;
  review: string;
  rating: number;
}

export interface UpdateReviewPayload extends CreateReviewPayload {
  id: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'https://appscript-cors-proxy.misael-delamorena.workers.dev/';

  list(): Observable<any> {
    console.log('🔍 Iniciando petición al API...');
    return this.http.get<any>(this.baseUrl);
  }

  create(payload: CreateReviewPayload): Observable<any> {
    console.log('✏️ Creando reseña:', payload);
    return this.http.post<any>(this.baseUrl, payload);
  }

  delete(id: string): Observable<any> {
    console.log('🗑️ Eliminando reseña:', id);
    return this.http.delete<any>(this.baseUrl, { body: { id } });
  }

  update(payload: UpdateReviewPayload): Observable<any> {
    console.log('✏️ Actualizando reseña:', payload);
    return this.http.put<any>(this.baseUrl, payload);
  }
}
```

### Conceptos Importantes:

#### 1. **@Injectable({ providedIn: 'root' })**
```typescript
@Injectable({
  providedIn: 'root',
})
```
- Hace el servicio **Singleton** (una sola instancia en toda la app)
- `providedIn: 'root'` → Angular lo crea automáticamente cuando se necesita
- No necesitas añadirlo al array `providers` del componente

#### 2. **inject() vs constructor()**
```typescript
// ✅ Moderno (Angular 14+) - Function-based injection
private http = inject(HttpClient);

// ⚠️ Clásico - Constructor injection
constructor(private http: HttpClient) {}
```
Ambos hacen lo mismo, pero `inject()`:
- Es más flexible (puedes usarlo fuera del constructor)
- Permite inyección condicional
- Es el estilo recomendado en componentes standalone

#### 3. **HttpClient - Métodos REST**

##### GET - Listar
```typescript
list(): Observable<any> {
  return this.http.get<any>(this.baseUrl);
}
```
- `get<any>()` → Petición GET que devuelve `any` type
- No necesita body ni params adicionales

##### POST - Crear
```typescript
create(payload: CreateReviewPayload): Observable<any> {
  return this.http.post<any>(this.baseUrl, payload);
}
```
- `post(url, body)` → Envía el `payload` como JSON en el body
- Angular automáticamente serializa el objeto a JSON
- Añade el header `Content-Type: application/json`

##### PUT - Actualizar
```typescript
update(payload: UpdateReviewPayload): Observable<any> {
  return this.http.put<any>(this.baseUrl, payload);
}
```
- Similar a POST pero semánticamente indica "actualización completa"
- El `id` va incluido en el payload (`payload.id`)

##### DELETE - Eliminar
```typescript
delete(id: string): Observable<any> {
  return this.http.delete<any>(this.baseUrl, { body: { id } });
}
```
- `delete()` normalmente no lleva body, pero Apps Script lo necesita
- `{ body: { id } }` → Envía `{ "id": "123" }` en el body
- Esto es específico de nuestra implementación con Apps Script

#### 4. **Observable<any>**
```typescript
Observable<any>
```
- `Observable`: Stream de datos asíncrono (patrón RxJS)
- `any`: No validamos el tipo (podrías usar interfaces más específicas)
- **No ejecuta nada hasta que alguien se suscriba** con `.subscribe()`

**Flujo:**
```typescript
// 1. El servicio devuelve un Observable (no ejecuta nada aún)
const observable$ = this.reviewsService.list();

// 2. El componente se suscribe (se ejecuta la petición HTTP)
observable$.subscribe({
  next: (data) => console.log('Datos:', data),
  error: (err) => console.error('Error:', err),
  complete: () => console.log('Completado'),
});
```

#### 5. **Interfaces TypeScript**
```typescript
export interface CreateReviewPayload {
  title: string;
  review: string;
  rating: number;
}

export interface UpdateReviewPayload extends CreateReviewPayload {
  id: string;
}
```
- Define la estructura de los datos que el servicio acepta
- `extends` → Hereda todas las propiedades + añade `id`
- Ayuda a TypeScript a detectar errores en tiempo de compilación

---

## 🎨 Componente (crud-demo.ts)

### Propósito
El componente es el **cerebro** de la vista. Maneja:
- La lógica de negocio
- El estado de la aplicación
- La coordinación entre el servicio y la plantilla HTML
- Los eventos del usuario

### Estado del Componente (Signals)

```typescript
reviews = signal<Review[]>([]);           // Lista de reseñas
loading = signal(true);                   // ¿Está cargando?
error = signal('');                       // Mensaje de error
submitting = signal(false);               // ¿Enviando formulario?
editingId = signal<string | null>(null);  // ID en edición (null = creando)
```

#### ¿Por qué Signals?

**Antes (Angular ≤16 - Change Detection tradicional):**
```typescript
reviews: Review[] = [];

addReview(review: Review) {
  this.reviews.push(review); // ❌ Angular no detecta el cambio
  // Necesitas: this.reviews = [...this.reviews, review];
  // O: this.changeDetector.detectChanges();
}
```

**Ahora (Angular 17+ - Signals):**
```typescript
reviews = signal<Review[]>([]);

addReview(review: Review) {
  this.reviews.set([...this.reviews(), review]); // ✅ Cambio detectado automáticamente
}
```

**Beneficios de Signals:**
- ✅ Detección de cambios más eficiente (solo re-renderiza lo necesario)
- ✅ No necesitas `ChangeDetectorRef`
- ✅ Código más reactivo y predecible
- ✅ Mejor performance en aplicaciones grandes

#### API de Signals:

```typescript
// Crear signal
const count = signal(0);

// Leer valor
console.log(count());  // 0

// Actualizar valor
count.set(5);          // Establece nuevo valor
count.update(n => n + 1);  // Actualiza basándose en el valor anterior

// En templates se accede con ()
<p>{{ count() }}</p>
```

### Formulario Reactivo

```typescript
form = this.fb.group({
  title: ['', [Validators.required, Validators.maxLength(30)]],
  review: ['', [Validators.required, Validators.maxLength(240)]],
  rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
});
```

**Conceptos:**
- `fb.group()` → Crea un FormGroup (grupo de controles)
- Formato: `[valorInicial, [validadores]]`
- `Validators.required` → Campo obligatorio
- `Validators.maxLength(30)` → Máximo 30 caracteres
- `Validators.min(1), Validators.max(5)` → Rating entre 1 y 5

### Método: loadReviews()

```typescript
loadReviews(): void {
  console.log('📋 loadReviews() ejecutándose');
  this.loading.set(true);
  this.error.set('');
  
  this.reviewsService.list().subscribe({
    next: (data: any) => {
      console.log('✅ Datos recibidos:', data);
      const reviewsArray = Array.isArray(data) ? data : [data];
      this.reviews.set(reviewsArray);
      this.loading.set(false);
    },
    error: (err: any) => {
      console.error('❌ Error:', err);
      this.error.set('Error: ' + JSON.stringify(err));
      this.loading.set(false);
    },
  });
}
```

**Desglose:**
1. **Estado de carga**: `this.loading.set(true)` → Muestra spinner en la UI
2. **Petición HTTP**: `this.reviewsService.list()` → Devuelve Observable
3. **Subscribe**: Se suscribe al Observable con dos callbacks:
   - `next`: Éxito → actualiza `reviews` y desactiva loading
   - `error`: Error → muestra mensaje de error

**Observer Pattern:**
```typescript
.subscribe({
  next: (data) => { /* Qué hacer cuando llegan datos */ },
  error: (err) => { /* Qué hacer si hay error */ },
  complete: () => { /* Opcional: qué hacer cuando termina */ },
})
```

### Método: onSubmit() - Crear o Actualizar

```typescript
onSubmit(): void {
  // 1. Validar formulario
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.submitting.set(true);
  this.error.set('');

  const payload = {
    title: this.form.value.title || '',
    review: this.form.value.review || '',
    rating: Number(this.form.value.rating) || 5,
  };

  // 2. ¿Modo edición o creación?
  if (this.editingId()) {
    // ACTUALIZAR
    this.reviewsService.update({ ...payload, id: this.editingId()! }).subscribe({
      next: (response: any) => {
        this.form.reset({ title: '', review: '', rating: 5 });
        this.editingId.set(null);
        this.submitting.set(false);
        setTimeout(() => this.loadReviews(), 500);
      },
      error: (err: any) => {
        this.error.set('Error al actualizar: ' + err?.message);
        this.submitting.set(false);
      },
    });
  } else {
    // CREAR
    this.reviewsService.create(payload).subscribe({
      next: (response: any) => {
        this.form.reset({ title: '', review: '', rating: 5 });
        this.submitting.set(false);
        setTimeout(() => this.loadReviews(), 500);
      },
      error: (err: any) => {
        this.error.set('Error al crear: ' + err?.message);
        this.submitting.set(false);
      },
    });
  }
}
```

**Conceptos clave:**

#### 1. Validación del Formulario
```typescript
if (this.form.invalid) {
  this.form.markAllAsTouched();  // Muestra todos los errores
  return;
}
```

#### 2. Spread Operator
```typescript
{ ...payload, id: this.editingId()! }
// Equivale a:
{
  title: payload.title,
  review: payload.review,
  rating: payload.rating,
  id: this.editingId()!,
}
```

#### 3. Non-null Assertion (!)
```typescript
this.editingId()!
```
- Le dice a TypeScript: "Confía en mí, esto NO es null"
- Úsalo solo cuando estés 100% seguro

#### 4. setTimeout()
```typescript
setTimeout(() => this.loadReviews(), 500);
```
- Espera 500ms antes de recargar
- Da tiempo a que el backend procese y persista los cambios

### Método: onDelete()

```typescript
onDelete(id: string, title: string): void {
  if (!confirm(`¿Seguro que quieres eliminar "${title}"?`)) {
    return;
  }

  this.error.set('');

  this.reviewsService.delete(id).subscribe({
    next: (response: any) => {
      if (response.ok === true || !response.error) {
        setTimeout(() => this.loadReviews(), 500);
      } else {
        this.error.set('No se pudo eliminar: ' + response.error);
      }
    },
    error: (err: any) => {
      this.error.set('Error al eliminar: ' + err?.message);
    },
  });
}
```

**Conceptos:**
- `confirm()` → Diálogo nativo del navegador (devuelve boolean)
- Validación de respuesta: `response.ok === true || !response.error`
- Diferentes formas de manejar éxito/error del backend

### Método: onEdit()

```typescript
onEdit(review: Review): void {
  this.editingId.set(review.id);
  this.form.patchValue({
    title: review.title,
    review: review.review,
    rating: Number(review.rating),
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
```

**Conceptos:**
- `patchValue()` → Actualiza solo los campos especificados del formulario
- `set()` vs `setValue()`: `patchValue()` es parcial, `setValue()` requiere todos los campos
- `window.scrollTo()` → Mejora UX llevando al usuario al formulario

---

## 🧠 Conceptos Clave de Angular

### 1. HttpClient

El `HttpClient` es el servicio de Angular para hacer peticiones HTTP.

```typescript
import { HttpClient } from '@angular/common/http';

// GET
this.http.get(url)

// POST
this.http.post(url, body)

// PUT
this.http.put(url, body)

// DELETE
this.http.delete(url, { body })
```

**Características:**
- Devuelve Observables (RxJS)
- Automáticamente serializa/deserializa JSON
- Maneja headers automáticamente
- Integrado con interceptors para logging, auth, etc.

### 2. Observables y el Patrón Observer

Un **Observable** es un stream de datos que puede emitir valores a lo largo del tiempo.

```typescript
// El servicio devuelve un Observable
const observable$ = this.http.get('/api/data');

// Nada sucede hasta que alguien se suscribe
observable$.subscribe({
  next: (data) => console.log('Dato recibido:', data),
  error: (err) => console.error('Error:', err),
  complete: () => console.log('Completado'),
});
```

**Patrón Observer:**
```
        Observable (Productor)
              ↓
    ┌─────────┴─────────┐
    ↓                   ↓
Observer 1         Observer 2
(subscribe)        (subscribe)
```

**Características:**
- **Lazy**: No ejecuta hasta que te suscribes
- **Push-based**: El observable "empuja" datos a los observers
- **Composable**: Puedes encadenar operadores (map, filter, etc.)
- **Cancelable**: Puedes cancelar con `unsubscribe()`

**Ejemplo de flujo:**
```typescript
// 1. Componente llama al servicio
this.reviewsService.list()  // Devuelve Observable<any>
  
// 2. Se suscribe al Observable
.subscribe({
  // 3. Cuando llegan datos exitosamente
  next: (data) => {
    this.reviews.set(data);
  },
  
  // 4. Si hay un error
  error: (err) => {
    this.error.set(err.message);
  },
  
  // 5. Cuando la petición termina (opcional)
  complete: () => {
    console.log('Petición completada');
  }
});
```

### 3. Signals (Angular 17+)

Los **Signals** son la nueva forma de manejar estado reactivo en Angular.

```typescript
// Crear un signal
const count = signal(0);

// Leer valor (se llama como función)
console.log(count());  // 0

// Actualizar valor
count.set(5);           // Establece 5
count.update(n => n + 1);  // Incrementa en 1

// En templates
<p>Contador: {{ count() }}</p>
```

**Comparación con propiedades normales:**

```typescript
// ❌ Propiedad normal (Angular ≤16)
export class Component {
  count = 0;
  
  increment() {
    this.count++;
    // Angular puede no detectar el cambio
    // Necesitas strategies o ChangeDetectorRef
  }
}

// ✅ Signal (Angular 17+)
export class Component {
  count = signal(0);
  
  increment() {
    this.count.update(n => n + 1);
    // Cambio detectado automáticamente
    // UI se actualiza sin esfuerzo extra
  }
}
```

**Ventajas:**
1. **Fine-grained reactivity**: Solo actualiza lo que cambió
2. **Performance**: Menos re-renderizados innecesarios
3. **Simplicidad**: No necesitas `OnPush` strategy
4. **Type-safe**: TypeScript sabe el tipo en todo momento

**Signals en el CRUD:**
```typescript
reviews = signal<Review[]>([]);      // Estado
loading = signal(true);               // UI state
error = signal('');                   // Error handling

// Actualizar
this.reviews.set(newData);            // Reemplaza todo
this.loading.set(false);              // Toggle boolean
this.error.set('Error message');      // Set string
```

### 4. Reactive Forms (Formularios Reactivos)

Los **Reactive Forms** gestionan el estado del formulario en TypeScript, no en el template.

```typescript
form = this.fb.group({
  title: ['', [Validators.required, Validators.maxLength(30)]],
  review: ['', [Validators.required, Validators.maxLength(240)]],
  rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
});
```

**Estructura:**
- `FormGroup`: Contiene el formulario completo
- `FormControl`: Cada campo individual
- Formato: `[valorInicial, [validadores]]`

**Validadores Built-in:**
```typescript
Validators.required          // Campo obligatorio
Validators.maxLength(30)     // Máximo 30 caracteres
Validators.minLength(3)      // Mínimo 3 caracteres
Validators.min(1)            // Valor mínimo 1
Validators.max(5)            // Valor máximo 5
Validators.email             // Email válido
Validators.pattern(/regex/)  // Patrón regex
```

**Métodos útiles:**
```typescript
// Validación
this.form.valid              // ¿Es válido?
this.form.invalid            // ¿Es inválido?
this.form.markAllAsTouched() // Marca todos como tocados (muestra errores)

// Obtener valores
this.form.value              // { title: '...', review: '...', rating: 5 }
this.form.value.title        // Acceso a campo específico

// Establecer valores
this.form.setValue({ title: '', review: '', rating: 5 })  // Todos los campos
this.form.patchValue({ title: 'Nuevo' })                  // Solo algunos campos

// Resetear
this.form.reset()                                   // Limpia todo
this.form.reset({ title: '', review: '', rating: 5 })  // Con valores por defecto
```

**En el template:**
```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <input formControlName="title">
  <div *ngIf="form.get('title')?.invalid && form.get('title')?.touched">
    Error: Campo obligatorio
  </div>
</form>
```

### 5. Dependency Injection (Inyección de Dependencias)

Angular usa DI para proveer instancias de servicios a componentes.

**Moderno (Angular 14+):**
```typescript
export class Component {
  private reviewsService = inject(ReviewsService);
  private fb = inject(FormBuilder);
}
```

**Clásico:**
```typescript
export class Component {
  constructor(
    private reviewsService: ReviewsService,
    private fb: FormBuilder
  ) {}
}
```

**¿Cómo funciona?**
```
1. ReviewsService tiene @Injectable({ providedIn: 'root' })
2. Angular crea UNA instancia (singleton)
3. Cuando un componente hace inject(), recibe esa instancia
4. Todos los componentes comparten la misma instancia
```

**Beneficios:**
- ✅ Singleton automático
- ✅ Testing fácil (puedes mockear servicios)
- ✅ Desacoplamiento (componentes no crean sus dependencias)

---

## 🔄 Flujo de Datos Completo

### Crear una Reseña (POST)

```
┌──────────────┐
│   Usuario    │
│ Rellena form │
└──────┬───────┘
       │ Hace clic en "Agregar"
       ▼
┌──────────────────┐
│  crud-demo.ts    │
│  onSubmit()      │
└──────┬───────────┘
       │ 1. Valida form
       │ 2. Crea payload
       ▼
┌──────────────────┐
│ reviews.service  │
│ create(payload)  │
└──────┬───────────┘
       │ this.http.post(url, payload)
       ▼
┌──────────────────┐
│ Cloudflare       │
│ Worker (Proxy)   │
└──────┬───────────┘
       │ Reenvía POST con body JSON
       ▼
┌──────────────────┐
│ Google Apps      │
│ Script           │
│ doPost(e)        │
└──────┬───────────┘
       │ 1. Parse JSON
       │ 2. sheet.appendRow()
       │ 3. return { ok: true }
       ▼
┌──────────────────┐
│ Respuesta JSON   │
│ { ok: true }     │
└──────┬───────────┘
       │ Observable.next()
       ▼
┌──────────────────┐
│  crud-demo.ts    │
│  .subscribe({    │
│    next: ...     │
│  })              │
└──────┬───────────┘
       │ 1. form.reset()
       │ 2. loadReviews()
       ▼
┌──────────────────┐
│   UI se          │
│   actualiza      │
└──────────────────┘
```

### Leer Reseñas (GET)

```
Component ngOnInit()
    ↓
loadReviews()
    ↓
reviewsService.list()  → http.get(url)
    ↓
Cloudflare Worker → GET to Apps Script
    ↓
Apps Script doGet() → getAllRows()
    ↓
Return JSON array
    ↓
Observable.next(data)
    ↓
.subscribe({ next: (data) => reviews.set(data) })
    ↓
UI muestra las reseñas con *ngFor
```

### Actualizar Reseña (PUT)

```
Usuario hace clic en "Editar"
    ↓
onEdit(review)
    ↓
editingId.set(review.id)
form.patchValue(review)
    ↓
Usuario modifica y envía
    ↓
onSubmit() detecta editingId() !== null
    ↓
reviewsService.update({ ...payload, id })
    ↓
http.put(url, body)
    ↓
Worker → PUT to Apps Script
    ↓
doPut(e) → encuentra row → update
    ↓
Response { ok: true }
    ↓
.subscribe() → loadReviews()
```

### Eliminar Reseña (DELETE)

```
Usuario hace clic en "Eliminar"
    ↓
onDelete(id, title)
    ↓
confirm() → ¿Seguro?
    ↓
reviewsService.delete(id)
    ↓
http.delete(url, { body: { id } })
    ↓
Worker → DELETE to Apps Script
    ↓
doDelete(e) → encuentra row → sheet.deleteRow()
    ↓
Response { ok: true }
    ↓
.subscribe() → loadReviews()
```

---

## 🚨 Problemas Comunes y Soluciones

### 1. CORS Error

**Error:**
```
Access to fetch at 'https://script.google.com/...' from origin 'http://localhost:4200' 
has been blocked by CORS policy
```

**Causa:** Google Apps Script no acepta POST/PUT/DELETE desde navegadores.

**Solución:** Usar Cloudflare Worker como proxy que añade los headers CORS.

### 2. Los Signals no se actualizan en la UI

**Problema:**
```typescript
this.reviews().push(newReview);  // ❌ No funciona
```

**Solución:**
```typescript
this.reviews.set([...this.reviews(), newReview]);  // ✅ Crea nuevo array
```
Los Signals necesitan que cambies la referencia, no que mutes el objeto.

### 3. Formulario no muestra errores

**Problema:** Validaciones no aparecen.

**Solución:**
```typescript
if (this.form.invalid) {
  this.form.markAllAsTouched();  // Marca todos los campos como tocados
  return;
}
```

### 4. Observable no ejecuta nada

**Problema:**
```typescript
this.reviewsService.list();  // No pasa nada
```

**Solución:**
```typescript
this.reviewsService.list().subscribe({  // ✅ Necesitas suscribirte
  next: (data) => console.log(data),
});
```
Los Observables son **lazy**, no hacen nada hasta que alguien se suscribe.

### 5. Memory Leaks con Subscriptions

**Problema:** Subscripciones que no se limpian.

**Solución 1 - Async Pipe:**
```typescript
// En el componente
reviews$ = this.reviewsService.list();

// En el template
<div *ngFor="let review of reviews$ | async">
```

**Solución 2 - takeUntilDestroyed:**
```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

this.reviewsService.list()
  .pipe(takeUntilDestroyed())
  .subscribe(...);
```

### 6. Apps Script devuelve texto en lugar de JSON

**Causa:** No usaste `ContentService.MimeType.JSON`

**Solución:**
```javascript
function jsonOutput(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);  // ← Importante
}
```

---

## 📝 Resumen de la Arquitectura

### Frontend (Angular)
- **Componente**: Maneja la lógica de UI, formularios, eventos
- **Servicio**: Encapsula las llamadas HTTP
- **HttpClient**: Hace peticiones REST (GET/POST/PUT/DELETE)
- **Signals**: Maneja estado reactivo
- **Reactive Forms**: Valida y gestiona formularios

### Middleware
- **Cloudflare Worker**: Proxy que resuelve CORS y reenvía peticiones

### Backend (Google Apps Script)
- **doGet/doPost/doPut/doDelete**: Maneja cada método HTTP
- **Google Sheets**: Base de datos visual

### Comunicación
- **Observables (RxJS)**: Streams asíncronos
- **JSON**: Formato de intercambio de datos
- **REST APIs**: GET, POST, PUT, DELETE

---

## 🎓 Conceptos Aprendidos

1. ✅ **HttpClient** para peticiones HTTP
2. ✅ **Observables** y patrón Observer
3. ✅ **Signals** para estado reactivo
4. ✅ **Reactive Forms** para formularios
5. ✅ **Dependency Injection** con `inject()`
6. ✅ **Services** para lógica de negocio
7. ✅ **CORS** y cómo resolverlo con proxies
8. ✅ **REST APIs** (GET, POST, PUT, DELETE)
9. ✅ **Google Apps Script** como backend
10. ✅ **TypeScript interfaces** para type safety

---

## 🚀 Próximos Pasos

1. Añadir **validaciones personalizadas** al formulario
2. Implementar **paginación** para muchas reseñas
3. Usar **RxJS operators** (map, filter, debounceTime)
4. Añadir **loading skeletons** durante cargas
5. Implementar **optimistic updates** (actualizar UI antes de respuesta)
6. Añadir **interceptors** para logging automático
7. Crear **custom validators** para campos específicos
8. Implementar **error handling** global

---

**¡CRUD completado exitosamente! 🎉**

#### 1. **loadReviews() - READ**
```typescript
loadReviews(): void {
  this.loading.set(true);
  this.reviewsService.list().subscribe({
    next: (data) => {
      this.reviews.set(Array.isArray(data) ? data : [data]);
      this.loading.set(false);
    },
    error: (err) => {
      this.error.set('Error: ' + err.message);
      this.loading.set(false);
    },
  });
}
```

**Flujo:**
1. Activa loading
2. Llama al servicio
3. Espera respuesta (asíncrono)
4. Si OK → actualiza reviews
5. Si error → muestra mensaje
6. Desactiva loading

#### 2. **onSubmit() - CREATE / UPDATE**
```typescript
onSubmit(): void {
  if (this.form.invalid) return;
  
  const payload = {
    title: this.form.value.title || '',
    review: this.form.value.review || '',
    rating: Number(this.form.value.rating) || 5,
  };

  if (this.editingId()) {
    // ACTUALIZAR
    this.reviewsService.update({ ...payload, id: this.editingId()! })
      .subscribe({ ... });
  } else {
    // CREAR
    this.reviewsService.create(payload)
      .subscribe({ ... });
  }
}
```

**Decisiones:**
- Valida antes de enviar
- Usa el mismo formulario para crear/editar
- `editingId()` determina la acción
- `!` = "Confía en mí, no es null" (non-null assertion)

#### 3. **onEdit() - Preparar Edición**
```typescript
onEdit(review: Review): void {
  this.editingId.set(review.id);
  this.form.patchValue({
    title: review.title,
    review: review.review,
    rating: Number(review.rating),
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
```

- `patchValue()`: Actualiza solo los campos especificados
- `setValue()`: Requiere todos los campos
- Scroll automático para mejor UX

#### 4. **onDelete() - DELETE**
```typescript
onDelete(id: string, title: string): void {
  if (!confirm(`¿Seguro que quieres eliminar "${title}"?`)) {
    return;
  }
  
  this.reviewsService.delete(id).subscribe({
    next: (response) => {
      if (response.ok) {
        setTimeout(() => this.loadReviews(), 500);
      }
    }
  });
}
```

- `confirm()`: Diálogo nativo del navegador
- `setTimeout()`: Da tiempo al servidor para procesar

---

## 🖼️ Plantilla HTML (crud-demo.html)

### Estructura

```html
<div class="container">
  <!-- HEADER -->
  <h1>🎬 Reseñas de Películas</h1>
  
  <!-- ERROR MESSAGE -->
  <div *ngIf="error()">{{ error() }}</div>
  
  <!-- FORMULARIO -->
  <form [formGroup]="form" (ngSubmit)="onSubmit()">
    <!-- Campos -->
  </form>
  
  <!-- LOADING -->
  <div *ngIf="loading()">Cargando...</div>
  
  <!-- LISTADO -->
  <div *ngFor="let review of reviews()">
    <!-- Card de reseña -->
  </div>
</div>
```

### Conceptos Importantes:

#### 1. **Property Binding vs Event Binding**
```html
<!-- Property Binding (datos del componente → vista) -->
<input [value]="review.title">
<div [class.active]="isActive">

<!-- Event Binding (eventos de la vista → componente) -->
<button (click)="onDelete()">
<form (ngSubmit)="onSubmit()">

<!-- Two-way Binding (ambos) -->
<input [(ngModel)]="name">
```

#### 2. **Formularios Reactivos**
```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <input formControlName="title">
  <textarea formControlName="review"></textarea>
  <select formControlName="rating">
</form>
```

- `[formGroup]`: Conecta el form HTML con el FormGroup de TypeScript
- `formControlName`: Conecta cada input con un FormControl
- `(ngSubmit)`: Evento al enviar el formulario

#### 3. **Validaciones en la Vista**
```html
<p *ngIf="form.get('title')?.touched && form.get('title')?.invalid">
  El título es obligatorio
</p>
```

- `touched`: El usuario interactuó con el campo
- `invalid`: El campo no cumple las validaciones
- `?.`: Optional chaining (evita errores si es null)

#### 4. **Signals en Templates**
```html
<!-- Llamar como función -->
<div *ngIf="loading()">Cargando...</div>
<div *ngFor="let review of reviews()">

<!-- NO hacer esto (es una variable, no una función) -->
<div *ngIf="loading">❌ Error</div>
```

#### 5. **Operador Ternario**
```html
{{ editingId() ? 'Editar' : 'Crear' }}
<!-- Si editingId() tiene valor → "Editar", sino → "Crear" -->
```

#### 6. **$event.stopPropagation()**
```html
<div (click)="selectCard()">
  <button (click)="delete(); $event.stopPropagation()">
</div>
```
Evita que el click del botón active también el click del div padre.

---

## 🔄 Flujo de Datos Completo

### Ejemplo: Crear una Reseña

```
1. Usuario llena formulario
   ↓
2. Usuario hace click en "Publicar"
   ↓
3. (ngSubmit) llama a onSubmit()
   ↓
4. onSubmit() valida el formulario
   ↓
5. Crea payload: { title, review, rating }
   ↓
6. Llama a reviewsService.create(payload)
   ↓
7. Servicio crea HttpParams con los datos
   ↓
8. HttpClient hace GET a Google Apps Script
   URL: ?action=create&title=Matrix&review=...
   ↓
9. Apps Script recibe los parámetros
   ↓
10. Valida que action === 'create'
    ↓
11. Genera ID único: Date.now()
    ↓
12. Inserta fila en Google Sheets
    ↓
13. Devuelve JSON: { ok: true, id: "..." }
    ↓
14. Observable emite la respuesta
    ↓
15. subscribe() recibe en next: (response)
    ↓
16. Resetea formulario
    ↓
17. Llama a loadReviews()
    ↓
18. Servicio hace GET sin parámetros
    ↓
19. Apps Script devuelve todas las reseñas
    ↓
20. reviews.set(data) actualiza el estado
    ↓
21. Angular detecta cambio en signal
    ↓
22. Actualiza la vista automáticamente
    ↓
23. Usuario ve la nueva reseña en pantalla ✅
```

---

## 💡 Conceptos Clave para Estudiar

### 1. **Inyección de Dependencias**
```typescript
// Angular inyecta HttpClient automáticamente
private http = inject(HttpClient);
```
No creas instancias manualmente, Angular las gestiona.

### 2. **Observables vs Promises**

| Observables | Promises |
|------------|----------|
| Múltiples valores | Un solo valor |
| Lazy (no ejecuta hasta subscribe) | Eager (ejecuta inmediatamente) |
| Cancelable | No cancelable |
| Operadores (map, filter, etc.) | then/catch |

```typescript
// Observable
this.http.get(url).subscribe(data => console.log(data));

// Promise (convertido)
this.http.get(url).toPromise().then(data => console.log(data));
```

### 3. **Standalone Components**
```typescript
@Component({
  selector: 'app-crud-demo',
  standalone: true,  // ← No necesita NgModule
  imports: [CommonModule, ReactiveFormsModule],
})
```
Antes (Angular 14-): Componentes en módulos  
Ahora (Angular 15+): Componentes independientes

### 4. **Signals vs RxJS**

```typescript
// Con Signals (nuevo)
reviews = signal<Review[]>([]);
this.reviews.set(newData);
// En HTML: {{ reviews() }}

// Con RxJS (clásico)
reviews$ = new BehaviorSubject<Review[]>([]);
this.reviews$.next(newData);
// En HTML: {{ reviews$ | async }}
```

Signals son más simples para estado local.

### 5. **FormBuilder Shortcuts**
```typescript
// Forma completa
this.fb.group({
  title: this.fb.control('', [Validators.required])
});

// Forma corta
this.fb.group({
  title: ['', [Validators.required]]
});
```

---

## 🐛 Problemas Comunes y Soluciones

### 1. **Error: NullInjectorError: No provider for HttpClient**
**Solución:**
```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(), // ← Agregar esto
  ]
};
```

### 2. **CORS Error con POST/PUT/DELETE**
**Problema:** Google Apps Script bloquea estos métodos desde el navegador.  
**Solución:** Usar GET con parámetros `?action=...`

### 3. **El formulario no se resetea**
```typescript
// ❌ Malo
this.form.reset();

// ✅ Bueno
this.form.reset({ title: '', review: '', rating: 5 });
```

### 4. **Los cambios no se reflejan en la vista**
**Con signals:**
```typescript
// ❌ Malo (mutar el array)
this.reviews().push(newReview);

// ✅ Bueno (crear nuevo array)
this.reviews.set([...this.reviews(), newReview]);
```

### 5. **Error: Can't bind to 'formGroup' since it isn't a known property**
**Solución:**
```typescript
@Component({
  imports: [ReactiveFormsModule], // ← Importar esto
})
```

---

## 📚 Recursos para Estudiar

### Documentación Oficial
- [Angular Docs](https://angular.dev)
- [Signals Guide](https://angular.dev/guide/signals)
- [Reactive Forms](https://angular.dev/guide/forms/reactive-forms)
- [HttpClient](https://angular.dev/guide/http)

### Orden de Estudio Recomendado
1. TypeScript básico
2. Componentes y Templates
3. Property & Event Binding
4. Servicios e Inyección de Dependencias
5. HttpClient y Observables
6. Formularios Reactivos
7. Signals (Angular 17+)
8. RxJS Operators (map, filter, switchMap)

### Ejercicios Prácticos
1. Agregar campo "director" y "año" a las reseñas
2. Implementar paginación (10 reseñas por página)
3. Agregar filtro por puntuación
4. Agregar búsqueda por título
5. Implementar caché (guardar reviews en localStorage)
6. Agregar animaciones con @angular/animations

---

## 🎓 Preguntas de Repaso

1. ¿Qué es un Observable y cómo se diferencia de una Promise?
2. ¿Por qué usamos Signals en lugar de variables normales?
3. ¿Cuál es la diferencia entre `patchValue()` y `setValue()`?
4. ¿Por qué revisar `action` antes que `id` en el Apps Script?
5. ¿Qué hace `provideHttpClient()` en app.config.ts?
6. ¿Cuándo usar Reactive Forms vs Template-Driven Forms?
7. ¿Qué es la Inyección de Dependencias?
8. ¿Por qué usar `HttpParams` en lugar de concatenar strings?

---

## ✅ Checklist de Implementación

- [x] Google Sheet creado con columnas correctas
- [x] Apps Script publicado como Web App
- [x] Acceso configurado como "Cualquiera"
- [x] URL del script copiada en reviews.service.ts
- [x] provideHttpClient() en app.config.ts
- [x] Interfaces Review definidas
- [x] Validaciones del formulario configuradas
- [x] Manejo de errores implementado
- [x] Loading states implementados
- [x] Confirmación antes de eliminar
- [x] Estilos Tailwind aplicados

---

**¡Éxito en tus estudios! 🚀**

*Este documento cubre los fundamentos. Practica, experimenta y construye tus propios proyectos.*
