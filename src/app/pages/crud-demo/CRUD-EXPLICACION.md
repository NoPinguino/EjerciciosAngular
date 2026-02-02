# 📚 CRUD de Reseñas de Películas - Explicación Completa

## 📋 Índice
1. [Introducción](#introducción)
2. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
3. [Google Apps Script (Backend)](#google-apps-script-backend)
4. [Servicio Angular (reviews.service.ts)](#servicio-angular)
5. [Componente (crud-demo.ts)](#componente)
6. [Plantilla HTML (crud-demo.html)](#plantilla-html)
7. [Flujo de Datos](#flujo-de-datos)
8. [Conceptos Clave](#conceptos-clave)
9. [Problemas Comunes y Soluciones](#problemas-comunes-y-soluciones)

---

## 🎯 Introducción

Este proyecto es un **CRUD completo** (Create, Read, Update, Delete) de reseñas de películas que utiliza:
- **Frontend**: Angular 18 con Standalone Components
- **Backend**: Google Apps Script conectado a Google Sheets
- **Comunicación**: HTTP GET con parámetros (evitando problemas de CORS)

---

## 🏗️ Arquitectura del Proyecto

```
┌─────────────────┐
│   Angular App   │
│  (Frontend)     │
└────────┬────────┘
         │ HTTP GET
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

1. **Google Sheets como BD**: Fácil de usar, visual, sin configuración
2. **Apps Script**: Servidor gratuito, 24/7, sin infraestructura
3. **Solo GET**: Google Apps Script tiene problemas de CORS con POST/PUT/DELETE desde navegadores

---

## 📊 Google Apps Script (Backend)

### Estructura de la Hoja de Cálculo

La hoja debe llamarse **"CineReviewAppScript"** y tener estas columnas:

| id | title | review | rating | date |
|----|-------|--------|--------|------|
| 1738... | Inception | Excelente película | 5 | 2026-02-02... |

### Código del Script

```javascript
const SHEET_NAME = "CineReviewAppScript";

function doGet(e) {
  try {
    const sheet = getSheet();
    if (!sheet) {
      return jsonOutput({ error: "Hoja no encontrada" });
    }

    const action = e.parameter.action;
    
    // CREATE
    if (action === 'create') {
      const id = Date.now().toString();
      const date = new Date().toISOString();
      sheet.appendRow([
        id,
        e.parameter.title || "",
        e.parameter.review || "",
        Number(e.parameter.rating) || 0,
        date
      ]);
      return jsonOutput({ ok: true, id: id });
    }

    // UPDATE
    if (action === 'update') {
      const id = String(e.parameter.id || "").trim();
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]).trim() === id) {
          sheet.getRange(i + 1, 2).setValue(e.parameter.title);
          sheet.getRange(i + 1, 3).setValue(e.parameter.review);
          sheet.getRange(i + 1, 4).setValue(Number(e.parameter.rating));
          return jsonOutput({ ok: true });
        }
      }
      return jsonOutput({ ok: false, error: "No encontrado" });
    }

    // DELETE
    if (action === 'delete') {
      const id = String(e.parameter.id || "").trim();
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]).trim() === id) {
          sheet.deleteRow(i + 1);
          return jsonOutput({ ok: true });
        }
      }
      return jsonOutput({ ok: false, error: "No encontrado" });
    }

    // READ ALL
    const data = getAllRows(sheet);
    return jsonOutput(data);
    
  } catch (err) {
    return jsonOutput({ error: err.message });
  }
}
```

### Conceptos Importantes:

#### 1. **doGet(e)**
- Función especial de Apps Script que maneja peticiones HTTP GET
- `e.parameter` contiene los query params de la URL
- Ejemplo: `?action=create&title=Matrix` → `e.parameter.action === 'create'`

#### 2. **¿Por qué revisar `action` primero?**
```javascript
const action = e.parameter.action;
if (action === 'delete') { ... }
```
Si revisamos `e.parameter.id` primero, podría confundir un delete con un "obtener por ID"

#### 3. **Índices de Sheets**
- `sheet.getRange(i + 1, 2)` → Fila `i+1` (porque header es fila 1), Columna 2 (title)
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
Convierte el array 2D de Sheets en array de objetos JSON:
```
[[id, title, ...], [1, "Matrix", ...]] 
→ 
[{id: 1, title: "Matrix", ...}]
```

---

## 🔧 Servicio Angular (reviews.service.ts)

### Propósito
El servicio es la **capa de comunicación** entre el componente y el backend. Encapsula toda la lógica HTTP.

### Código:

```typescript
@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'https://script.google.com/...';

  list(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }

  create(payload: CreateReviewPayload): Observable<any> {
    const params = new HttpParams()
      .set('action', 'create')
      .set('title', payload.title)
      .set('review', payload.review)
      .set('rating', payload.rating.toString());

    return this.http.get<any>(this.baseUrl, { params });
  }

  update(payload: UpdateReviewPayload): Observable<any> {
    const params = new HttpParams()
      .set('action', 'update')
      .set('id', payload.id)
      .set('title', payload.title)
      .set('review', payload.review)
      .set('rating', payload.rating.toString());

    return this.http.get<any>(this.baseUrl, { params });
  }

  delete(id: string): Observable<any> {
    const params = new HttpParams()
      .set('action', 'delete')
      .set('id', id);

    return this.http.get<any>(this.baseUrl, { params });
  }
}
```

### Conceptos Importantes:

#### 1. **@Injectable({ providedIn: 'root' })**
- Hace el servicio **Singleton** (una sola instancia en toda la app)
- `providedIn: 'root'` → Se crea automáticamente cuando se necesita

#### 2. **inject() vs constructor()**
```typescript
// Moderno (Angular 14+)
private http = inject(HttpClient);

// Clásico
constructor(private http: HttpClient) {}
```
Ambos hacen lo mismo, pero `inject()` es más flexible.

#### 3. **HttpParams**
```typescript
const params = new HttpParams()
  .set('action', 'create')
  .set('title', 'Matrix');

// Genera: ?action=create&title=Matrix
```
- **Inmutable**: cada `.set()` devuelve un nuevo objeto
- **Encoding automático**: espacios → `%20`, etc.

#### 4. **¿Por qué GET en lugar de POST?**
```typescript
// Esto daría error de CORS con Google Apps Script:
this.http.post(url, payload)

// Solución: GET con parámetros
this.http.get(url, { params })
```

#### 5. **Observable<any>**
- `Observable`: Stream de datos asíncrono
- `any`: No validamos el tipo (podrías usar interfaces)
- Para consumirlo: `.subscribe()`

---

## 🎨 Componente (crud-demo.ts)

### Propósito
El componente es el **cerebro** de la vista. Maneja la lógica de negocio, el estado y coordina entre el servicio y la plantilla.

### Estado del Componente

```typescript
reviews = signal<Review[]>([]);      // Lista de reseñas
loading = signal(true);               // ¿Está cargando?
error = signal('');                   // Mensaje de error
submitting = signal(false);           // ¿Enviando formulario?
editingId = signal<string | null>(null); // ID en edición (null = creando)
```

### ¿Por qué Signals?

**Antes (Angular 16-):**
```typescript
reviews: Review[] = [];
// Problema: Angular no detecta cambios automáticamente
this.reviews.push(newReview); // ❌ No se actualiza la vista
```

**Ahora (Angular 17+):**
```typescript
reviews = signal<Review[]>([]);
this.reviews.set([...this.reviews(), newReview]); // ✅ Se actualiza automáticamente
```

**Beneficios:**
- Detección de cambios más eficiente
- No necesitas `ChangeDetectorRef`
- Código más reactivo

### Formulario Reactivo

```typescript
form = this.fb.group({
  title: ['', [Validators.required, Validators.maxLength(120)]],
  review: ['', [Validators.required, Validators.maxLength(1000)]],
  rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
});
```

#### ¿Por qué Formularios Reactivos?

| Template-Driven | Reactive Forms |
|----------------|----------------|
| `[(ngModel)]` | `[formGroup]` |
| Lógica en HTML | Lógica en TypeScript |
| Menos control | Control total |
| Testing difícil | Testing fácil |

**Validaciones:**
```typescript
Validators.required      // Campo obligatorio
Validators.maxLength(120) // Máximo 120 caracteres
Validators.min(1)        // Mínimo valor 1
```

### Métodos Principales

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

- [ ] Google Sheet creado con columnas correctas
- [ ] Apps Script publicado como Web App
- [ ] Acceso configurado como "Cualquiera"
- [ ] URL del script copiada en reviews.service.ts
- [ ] provideHttpClient() en app.config.ts
- [ ] Interfaces Review definidas
- [ ] Validaciones del formulario configuradas
- [ ] Manejo de errores implementado
- [ ] Loading states implementados
- [ ] Confirmación antes de eliminar
- [ ] Estilos Tailwind aplicados

---

**¡Éxito en tus estudios! 🚀**

*Este documento cubre los fundamentos. Practica, experimenta y construye tus propios proyectos.*
