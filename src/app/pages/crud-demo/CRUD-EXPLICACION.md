# 🎬 CRUD de Reseñas de Películas - Guía Completa

## 📋 Índice
1. [Introducción](#introducción)
2. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
3. [Backend: Google Apps Script](#backend-google-apps-script)
4. [Proxy: Cloudflare Worker](#proxy-cloudflare-worker)
5. [Frontend: Angular](#frontend-angular)
6. [Manejo de Imágenes](#manejo-de-imágenes)
7. [Interfaz de Usuario](#interfaz-de-usuario)
8. [Flujo Completo de Datos](#flujo-completo-de-datos)
9. [Problemas y Soluciones](#problemas-y-soluciones)

---

## 🎯 Introducción

¡Bienvenido! Este es un sistema completo de reseñas de películas estilo **CineReview** donde puedes crear, ver, editar y eliminar reviews de tus pelis favoritas. Lo mejor de todo: **¡incluye subida de imágenes (posters)!**

### ¿Qué puedes hacer?
- ✅ **Crear** reseñas con título, opinión, puntuación (estrellas) y poster
- 📖 **Ver** todas las reseñas en un bonito grid horizontal
- ✏️ **Editar** cualquier reseña (se auto-scrollea al formulario)
- 🗑️ **Eliminar** reseñas que ya no quieras

### Stack Tecnológico
- **Frontend**: Angular 18+ con Standalone Components y Signals
- **Backend**: Google Apps Script (¡gratis y sin servidor!)
- **Base de Datos**: Google Sheets (sí, una hoja de cálculo como BD)
- **Proxy**: Cloudflare Worker (para resolver problemas de CORS)
- **Estilos**: Tailwind CSS con modo claro/oscuro
- **Imágenes**: Compresión con Canvas API + Base64

---

## 🏗️ Arquitectura del Proyecto

```
┌───────────────────────────────────────┐
│        Angular Frontend               │
│  - Formulario reactivo                │
│  - Compresión de imágenes             │
│  - Signals para estado reactivo       │
│  - HTTP Client para peticiones        │
└─────────────┬─────────────────────────┘
              │
              │ HTTP: GET, POST, PUT, DELETE
              │ (con imágenes en Base64)
              ▼
┌───────────────────────────────────────┐
│      Cloudflare Worker (Proxy)        │
│  - Añade headers CORS                 │
│  - Convierte PUT/DELETE → POST        │
│  - Reenvía al backend                 │
└─────────────┬─────────────────────────┘
              │
              │ Peticiones modificadas
              ▼
┌───────────────────────────────────────┐
│   Google Apps Script (Backend)        │
│  - Procesa GET, POST, PUT, DELETE     │
│  - Lee/escribe en Google Sheets       │
│  - Maneja IDs, fechas e imágenes      │
└─────────────┬─────────────────────────┘
              │
              ▼
┌───────────────────────────────────────┐
│        Google Sheets (Database)       │
│  Columnas:                            │
│  - id | title | review | rating |     │
│    image | date                       │
└───────────────────────────────────────┘
```

### ¿Por qué esta arquitectura?

**Google Sheets como BD**: Es visual, gratuita, sin configuración, y puedes ver/editar datos directamente.

**Apps Script como Backend**: Servidor gratuito 24/7, sin necesidad de pagar hosting ni gestionar infraestructura.

**Cloudflare Worker**: Resuelve el problema de CORS (bloqueo del navegador) y permite usar métodos HTTP estándar.

**Angular con Signals**: Reactividad moderna, código más limpio y mejor rendimiento.

---

## 🗄️ Backend: Google Apps Script

### Configuración de Google Sheets

Primero crea una hoja de cálculo en Google Sheets con estas columnas (¡exactamente así!):

| id | title | review | rating | image | date |
|----|-------|--------|--------|-------|------|
| 1738123456789 | Inception | Gran película... | 5 | data:image/jpeg;base64,/9j... | 2026-02-03T... |

**Importante**: La hoja debe llamarse **"CineReviewAppScript"** (o cambia el nombre en el código).

### Código del Apps Script

Crea un nuevo proyecto en Apps Script y pega este código. Ver el código completo en los comentarios del archivo `.ts`.

Este script maneja:
- **GET**: Devuelve todas las reviews
- **POST**: Crea una nueva review
- **PUT**: Actualiza una review existente (se identifica con `_method=PUT`)
- **DELETE**: Elimina una review (se identifica con `_method=DELETE`)

---

## 🌐 Proxy: Cloudflare Worker

### ¿Por qué necesitamos un proxy?

**Problema de CORS**: Los navegadores bloquean peticiones entre dominios diferentes por seguridad. Apps Script tiene restricciones CORS.

**Solución**: Un Cloudflare Worker actúa como intermediario que añade headers CORS y convierte métodos HTTP.

### Desplegar el Worker

1. Ve a [workers.cloudflare.com](https://workers.cloudflare.com)
2. Crea un nuevo Worker
3. Pega el código (ver archivo `.ts` para el código completo)
4. Guarda y despliega
5. Usa la URL que te da en tu servicio Angular

---

## 💻 Frontend: Angular

### Estructura de Archivos

```
src/app/
├── models/
│   └── review.ts          # Interfaz TypeScript
├── services/
│   └── reviews/
│       └── reviews.service.ts   # Servicio HTTP
└── pages/
    └── crud-demo/
        ├── crud-demo.ts         # Componente (lógica)
        ├── crud-demo.html       # Template (UI)
        └── CRUD-EXPLICACION.md  # Esta documentación
```

### Signals (Estado Reactivo)

```typescript
reviews = signal<Review[]>([]);
loading = signal(true);
error = signal('');
submitting = signal(false);
editingId = signal<string | null>(null);
selectedImage = signal<string | null>(null);
```

**¿Qué son los Signals?**
- Nueva forma de manejar estado en Angular (desde v16)
- Son **reactivos**: cuando cambian, la UI se actualiza automáticamente
- Se leen con `reviews()` y se actualizan con `reviews.set([...])`

### Formulario Reactivo

```typescript
form = this.fb.group({
  title: ['', [Validators.required, Validators.maxLength(30)]],
  review: ['', [Validators.required, Validators.maxLength(240)]],
  rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
  image: [''],
});
```

**Validaciones**:
- `title`: Obligatorio, máximo 30 caracteres
- `review`: Obligatorio, máximo 240 caracteres
- `rating`: Obligatorio, entre 1 y 5
- `image`: Opcional (se maneja con `selectedImage` signal)

---

## 🖼️ Manejo de Imágenes

### Flujo de Subida de Imágenes

```
1. Usuario selecciona imagen
         ↓
2. Validación (tipo y tamaño)
         ↓
3. Lectura con FileReader
         ↓
4. Compresión con Canvas
         ↓
5. Conversión a Base64
         ↓
6. Guardado en signal
         ↓
7. Envío al backend
```

### Compresión de Imágenes

El sistema comprime automáticamente las imágenes para optimizar el envío:

**Parámetros de compresión**:
- Tamaño máximo: 300x300px
- Formato: JPEG
- Calidad: 50% (0.5)
- Mantiene proporción original

**¿Por qué comprimir?**
- Las imágenes originales son muy grandes (varios MB)
- Base64 aumenta el tamaño en ~33%
- Sheets tiene límites de tamaño por celda
- La compresión reduce el tamaño a ~20-50KB

---

## 🎨 Interfaz de Usuario

### Diseño Cinematográfico

La interfaz usa un tema inspirado en cine con:
- Paleta de colores amarillo/rojo (como película vintage)
- Cards horizontales con poster a la izquierda
- Grid de 3 columnas en desktop
- Modo claro y oscuro
- Transiciones suaves en hover

### Layout Responsivo

```
Móvil:   1 columna, cards verticales
Tablet:  2 columnas
Desktop: 3 columnas
```

### Cards Horizontales

Cada card muestra:
- **Poster** (izquierda): 40% del ancho, altura fija 256px
- **Contenido** (derecha): 60% del ancho con:
  - Título (text-base, bold)
  - Estrellas de rating
  - Texto completo de la reseña
  - Fecha de creación
  - Botones de editar y eliminar

### Modo Oscuro

Todos los elementos tienen variantes `dark:` para cambio automático de tema.

### Auto-Scroll

Cuando editas una review, la página se desplaza automáticamente al formulario usando `ViewChild` y `scrollIntoView()`.

---

## 🔄 Flujo Completo de Datos

### Crear una Review

```
1. Usuario llena formulario + selecciona imagen
2. Imagen se comprime a 300x300px, JPEG 50%
3. Conversión a Base64
4. Click en "Publicar"
5. Validación del formulario
6. Payload JSON creado
7. HTTP POST al Worker
8. Worker añade CORS y reenvía
9. Apps Script genera ID y guarda en Sheets
10. Respuesta: { ok: true, id: 1738... }
11. Formulario se resetea
12. Lista se recarga
13. UI se actualiza
```

### Editar una Review

```
1. Click en "✏️ Editar"
2. Datos se cargan en formulario
3. Auto-scroll al formulario
4. Usuario modifica campos
5. Click en "Guardar Cambios"
6. HTTP PUT con payload + ID
7. Worker convierte a POST + ?_method=PUT
8. Apps Script busca y actualiza fila
9. Respuesta: { ok: true }
10. Recarga y actualización
```

### Eliminar una Review

```
1. Click en "🗑️ Eliminar"
2. Confirmación del usuario
3. HTTP DELETE con ID
4. Worker convierte a POST + ?_method=DELETE
5. Apps Script busca y elimina fila
6. Respuesta: { ok: true }
7. Lista se recarga
```

---

## 🐛 Problemas y Soluciones

### Error: CORS policy

**Síntoma**: `Access to fetch... has been blocked by CORS policy`

**Causa**: Apps Script no permite peticiones directas desde navegadores.

**Solución**: Usa el Cloudflare Worker que añade headers CORS.

---

### Error: Method not allowed (405)

**Síntoma**: PUT o DELETE no funcionan

**Causa**: Apps Script solo maneja GET y POST nativamente.

**Solución**: El Worker convierte PUT/DELETE a POST con parámetro `_method`.

---

### Error: Request Entity Too Large

**Síntoma**: Falla al guardar/actualizar con imagen

**Causa**: Imagen Base64 demasiado grande.

**Solución**: 
- Aumentar compresión (reducir calidad de 0.5 a 0.4)
- Reducir tamaño máximo (de 300x300 a 250x250)

---

### Reviews duplicadas

**Síntoma**: Se crean múltiples reviews iguales

**Causa**: Multiple clicks en el botón submit.

**Solución**: El botón se deshabilita con `[disabled]="submitting() || form.invalid"`.

---

### La imagen no se limpia

**Síntoma**: Al crear/editar, la imagen anterior permanece.

**Causa**: El input file no se resetea automáticamente.

**Solución**: Manual reset:
```typescript
const fileInput = document.querySelector('input[type="file"]');
if (fileInput) fileInput.value = '';
```

---

### No scrollea al editar

**Síntoma**: Al hacer clic en editar, no va al formulario.

**Solución**: Usar `setTimeout` de 100ms con `ViewChild`:
```typescript
setTimeout(() => {
  this.formulario.nativeElement.scrollIntoView({ behavior: 'smooth' });
}, 100);
```

---

### Altura inconsistente en cards

**Síntoma**: Cards con/sin imagen tienen diferentes alturas.

**Solución**: Altura fija para todos los posters: `h-64` (256px).

---

## 🎓 Conceptos Clave Aprendidos

### 1. Signals
Estado reactivo moderno en Angular. Mejor que BehaviorSubject para muchos casos.

### 2. Standalone Components
No necesitas NgModule, todo se importa directamente en el componente.

### 3. Reactive Forms
Formularios tipados con validaciones declarativas.

### 4. HTTP Client
Comunicación con APIs REST usando Observables.

### 5. Canvas API
Manipulación de imágenes en el navegador (resize, compress, format).

### 6. Base64 Encoding
Codificación de imágenes binarias en strings de texto.

### 7. CORS
Mecanismo de seguridad del navegador y cómo resolverlo con proxies.

### 8. REST API
Arquitectura GET/POST/PUT/DELETE para operaciones CRUD.

### 9. ViewChild
Acceso programático a elementos del DOM desde el componente.

### 10. Tailwind CSS
Framework utility-first para estilos rápidos y responsivos.

---

## 🚀 Mejoras Futuras

### Ideas para extender el proyecto:

1. **Paginación**: Mostrar solo 10-20 reviews por página
2. **Búsqueda**: Filtrar reviews por título o texto
3. **Ordenamiento**: Por fecha, rating, título
4. **Múltiples imágenes**: Galería de fotos por película
5. **Autenticación**: Login para reviews privadas
6. **Compartir**: Generar link para compartir una review
7. **Exportar**: Descargar todas las reviews en JSON/CSV
8. **Estadísticas**: Gráficas de ratings
9. **Drag & Drop**: Para subir imágenes arrastrando
10. **Preview antes de guardar**: Vista previa de la card

---

## 📚 Recursos Adicionales

- [Angular Docs](https://angular.dev)
- [Angular Signals](https://angular.dev/guide/signals)
- [Google Apps Script](https://developers.google.com/apps-script)
- [Cloudflare Workers](https://workers.cloudflare.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

---

## ✅ Checklist de Desarrollo

Para crear tu propio proyecto similar:

- [ ] Crear Google Sheet con columnas correctas
- [ ] Escribir código de Apps Script
- [ ] Desplegar Apps Script como web app
- [ ] Crear Cloudflare Worker
- [ ] Configurar URL de Apps Script en Worker
- [ ] Desplegar Worker
- [ ] Crear interfaz Review en Angular
- [ ] Crear servicio HTTP con métodos CRUD
- [ ] Crear componente con formulario reactivo
- [ ] Implementar validaciones
- [ ] Añadir manejo de imágenes
- [ ] Implementar compresión
- [ ] Crear template HTML con Tailwind
- [ ] Añadir modo oscuro
- [ ] Implementar auto-scroll en edición
- [ ] Probar CRUD completo
- [ ] Manejar errores
- [ ] Documentar el proyecto

---