# EjerciciosAngular

Repositorio de ejemplos y ejercicios prácticos que demuestran las funcionalidades básicas de Angular.  Este proyecto sirve como guía de aprendizaje para desarrolladores que quieran familiarizarse con los conceptos fundamentales del framework.

## 📋 Contenidos

Este repositorio incluye ejemplos prácticos sobre los siguientes temas de Angular:

### 🔗 **Data Binding**
Ejemplos de enlace de datos entre el componente y la vista, incluyendo interpolación, property binding, event binding y two-way binding.

### 📐 **Directivas**
Uso de directivas estructurales (`*ngIf`, `*ngFor`, `*ngSwitch`) y directivas de atributos para manipular el DOM.

### 💬 **Comunicación entre Componentes**
Implementación de comunicación entre componentes padre-hijo usando `@Input()` y `@Output()`, así como el uso de `EventEmitter`.

### 📝 **Formularios**
Ejemplos de formularios template-driven y reactive forms, incluyendo validaciones y manejo de estado.

### 🛠️ **Servicios**
Creación y uso de servicios para compartir lógica y datos entre componentes, aplicando el patrón de inyección de dependencias.

### 🌐 **HTTP Client**
Realización de peticiones HTTP utilizando `HttpClient` para comunicarse con APIs externas y manejar respuestas asíncronas.

## 🚀 Cómo iniciar el proyecto

### Prerrequisitos

Antes de comenzar, asegúrate de tener instalado: 

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- [Angular CLI](https://angular.dev/tools/cli) versión 21. 0.3 o superior

Para instalar Angular CLI globalmente, ejecuta: 

```bash
npm install -g @angular/cli
```

### Instalación

1. **Clona el repositorio:**

```bash
git clone https://github.com/NoPinguino/EjerciciosAngular. git
cd EjerciciosAngular
```

2. **Instala las dependencias:**

```bash
npm install
```

### Servidor de desarrollo

Para iniciar un servidor de desarrollo local, ejecuta:

```bash
ng serve
```

Una vez que el servidor esté en funcionamiento, abre tu navegador y navega a `http://localhost:4200/`. La aplicación se recargará automáticamente cada vez que modifiques algún archivo fuente.

## 🏗️ Construcción del proyecto

Para construir el proyecto para producción, ejecuta:

```bash
ng build
```

Los archivos generados se almacenarán en el directorio `dist/`. Por defecto, la compilación de producción optimiza la aplicación para rendimiento y velocidad.

## 🧪 Pruebas

### Pruebas unitarias

Para ejecutar las pruebas unitarias con [Vitest](https://vitest.dev/), utiliza el siguiente comando:

```bash
ng test
```

### Pruebas end-to-end

Para ejecutar pruebas end-to-end (e2e):

```bash
ng e2e
```

> **Nota:** Angular CLI no incluye un framework de pruebas e2e por defecto.  Puedes elegir el que mejor se adapte a tus necesidades.

## 🛠️ Scaffolding de código

Angular CLI incluye potentes herramientas de generación de código.  Para generar un nuevo componente, ejecuta:

```bash
ng generate component nombre-del-componente
```

Para ver una lista completa de esquemáticos disponibles (como `components`, `directives`, `pipes`, `services`, etc.), ejecuta:

```bash
ng generate --help
```

## 📚 Recursos adicionales

Para más información sobre el uso de Angular CLI, incluyendo referencias detalladas de comandos, visita la página oficial:  [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)

## 📄 Licencia

Este proyecto está disponible para fines educativos. 

---

**Desarrollado con Angular 21.0.3**
