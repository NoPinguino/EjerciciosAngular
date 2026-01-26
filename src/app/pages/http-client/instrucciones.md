# Práctica 3: Cambios Reactivos en Angular

En esta tercera entrega se pone en práctica el **estado reactivo** en Angular, usando **Servicios**, **HttpClient**, **Observables** y **Signals**, para propagar cambios de estado entre componentes aunque no tengan relación padre-hijo.

---

## Objetivos

- Implementar un **servicio** para manejar datos y peticiones HTTP.
- Usar **Observables** y **BehaviorSubject** para compartir datos entre componentes.
- Usar **Signals** para estados reactivos simples.
- Hacer peticiones HTTP con **HttpClient** y manejar la respuesta de forma reactiva.
- Mostrar cómo un cambio en un estado global puede actualizar múltiples componentes automáticamente.

---

## Servicios

### `ApiService` (antes `api.ts`)

Este servicio se encarga de:

- Gestionar la lista de corredores.
- Guardar el corredor seleccionado usando **Signal**.
- Realizar login y obtener un token.
- Hacer peticiones HTTP con **HttpClient** para obtener los corredores.

Ejemplo de uso:

```ts
@Injectable({ providedIn: 'root' })
export class ApiService {
  private urlBase = 'https://dam.colegiolitterator.es/php/bbdd.php';

  // Estado global
  corredores$ = new BehaviorSubject<Corredor[]>([]);
  userSelected = signal('');

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.urlBase, {
      usuario: email,
      clave: password,
      accion: 'validar',
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  getCorredores(token: string): Observable<Corredor[]> {
    return this.http.get<Corredor[]>(this.urlBase, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  setCorredores(lista: Corredor[]) {
    this.corredores$.next(lista);
  }
}
