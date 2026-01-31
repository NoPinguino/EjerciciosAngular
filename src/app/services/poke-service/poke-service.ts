import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, mergeMap, map } from 'rxjs';
import { Pokemon } from '../../models/pokemon';

@Injectable({
  providedIn: 'root',
})
export class PokeService {
  readonly #endpoint = 'https://pokeapi.co/api/v2'

  /**
   * Creo la instancia utilizada para las peticiones HTTP.
   * http (instancia) - HttpClient (servicio)
   * @param http 
   */
  constructor(private http: HttpClient) { }

  /**
   * Función encargada de hacer la petición a la API de PokeApi.
   * 
   * @param cantidad Representa cuantos Pokémon puede cargar a la vez.
   * @param id Representa el número del primer Pokémon de la lista a cargar.
   * @returns Retorna un servicio observable al que el componente PokeApi se suscribe.
   */
  getPokemonList(cantidad = 20, id = 0): Observable<Pokemon[]> {
    return this.http.get<any>(`${this.#endpoint}/pokemon?limit=${cantidad}&offset=${id}`)
      .pipe(
        mergeMap(res =>
          forkJoin<Pokemon[]>(
            res.results.map((pkmn: any) => this.getPokemonDetails(pkmn.url))
          )
        )
      );
  }

  /**
   * @param url Url con los detalles del Pokémon
   * @returns Objeto Pokémon
   */
  getPokemonDetails(url: string): Observable<Pokemon> {
    return this.http.get<any>(url).pipe(
      map(res => ({
        id: res.id,
        name: res.name,
        image: res.sprites?.other?.['official-artwork']?.front_default ?? '',
        types: res.types.map((t: any) => t.type.name)
      }))
    );
  }
}