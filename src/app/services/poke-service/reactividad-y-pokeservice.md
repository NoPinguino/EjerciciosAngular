# Peticiones en PokeService (Angular + RxJS).

## ¿Qué es RxJS?

Reactive Extension for JavaScript.
- El flujo de datos puede cambiar a lo largo del tiempo.
- En lugar de variables con valores fijos se utilian observables con valores que emiten los valores cuando ya están disponibles.
- Si te suscribes a uno de esos observables puedes reaccionar a esos cambios de datos automáticamente.

### RxJS en Angular.

En angular se utiliza el servicio RxJS como base de los datos reactivos.
- HttpClient.get(): devuelve un observable que emite la respuesta cuando la recibe de la API.
- Formularios reactivos: emiten eventos y validaciones en tiempo real cada vez que cambian los datos.

Los eventos en flujo a menudo son tratados como observables, esto nos permite:
- Realizar operaciones a los flujos de eventos con funciones iterables (map, mergeMap, filter, etc.).
- Combinar fuentes de datos.
- Manejas asincronía de forma declarativa.

No confundir con las promesas. Aquí nos suscribimos y desuscribimos, y usamos el operador pipe() para decidir que hacer con el flujo que nos devuelve.

> RxJS = JavaScript Reactivo: trabajar con flujos de datos (eventos, HTTP, etc.) de forma reactiva.

## Observables y reactividad en PokeService

### http

Al incio del servicio, defino una instancia del servicio HttpClient como http. Uso esta instancia en varias ocasiones para hacer peticiones de tipo get(). Cada peticion http es un observable escrito de forma implicita.

### mergeMap

La primera petición http.get() nos devuelve un objeto tipo 'any'. Este objeto nos devuelve dos datos, por ejemplo:

```js
any = { "nombre": Pikachu, "url": "https://pokeapi.co/api/v2/pokemon/25" }
```

mergeMap se encarga de coger el valor recibido por la primera petición (que deberían ser 20 objetos any) y transformalo en una lista de observables.

### forkJoin

forkJoin se encarga de realizar en simultaneo 20 peticiones http.get() llamando a la función de obtener detalles, y espera a que todos los observables emitan el tado recibido. Con esa lista crea finalmente un array completo de objetos Pokemon[]

### getPokemonDetails()

Esta función toma la url de el objeto any y hace una petición http, emittiendo los datos recividos.