import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokeService } from '../../services/poke-service/poke-service';
import { Pokemon } from '../../models/pokemon';
import { BehaviorSubject, mergeMap, Observable, scan} from 'rxjs';

@Component({
  selector: 'app-poke-api',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './poke-api.html',
})
export class PokeApi implements OnInit {
  // inject() usa el injector de Angular (singleton si providedIn: 'root')
  pokeService = inject(PokeService);

  // Observable de Pokémon
  pokemonList$!: Observable<Pokemon[]>;

  // Control del offset
  private offset$ = new BehaviorSubject<number>(0);
  readonly limit = 20;

  ngOnInit(): void {
    this.pokemonList$ = this.offset$.pipe(
      mergeMap(offset => this.pokeService.getPokemonList(this.limit, offset)),
      scan<Pokemon[], Pokemon[]>((all, batch) => [...all, ...batch], [])
    );
  }

  loadMore() {
    this.offset$.next(this.offset$.value + this.limit);
  }
}
/**
 * COSAS APRENDIDAS:
 * 
 * - El sufijo `$` es una convención para indicar que una variable es un Observable.
 *   No tiene efecto técnico, pero ayuda a entender el código.
 * 
 * - El operador `!` (non-null assertion) le dice a TypeScript que la variable
 *   será inicializada más adelante y no será null ni undefined.
 * 
 * - inject(PokeService) obtiene la instancia del servicio desde el injector de Angular.
 *   Es equivalente a inyectarlo por constructor y respeta el singleton (providedIn: 'root').
 * 
 * - BehaviorSubject necesita un valor inicial.
 *   El `0` indica el offset inicial desde el que se empieza a pedir Pokémon.
 *   Además, emite ese valor automáticamente al suscribirse.
 * 
 * - limit indica cuántos elementos se cargan por petición.
 *   offset indica desde qué posición empieza la API a devolver resultados.
 * 
 * - mergeMap se usa para transformar cada emisión del offset en una llamada HTTP.
 *   Cada nuevo offset dispara una nueva petición.
 * 
 * - scan funciona como un acumulador:
 *   va concatenando los Pokémon nuevos con los ya cargados (paginación incremental).
 * 
 * - El async pipe en el template se suscribe y se desuscribe automáticamente
 *   del observable, evitando memory leaks y subscribes manuales.
 */
