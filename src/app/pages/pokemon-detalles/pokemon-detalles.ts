import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pokemon-detalles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-detalles.html',
})
export class PokemonDetalles implements OnInit {
  pokemonId!: number;
  pokemon: any;

  // Colores por tipo de Pokémon
  // Colores por tipo de Pokémon
  tipoColores: Record<string, string> = {
    Fuego: 'bg-red-500',
    Agua: 'bg-blue-500',
    Planta: 'bg-green-500',
    Eléctrico: 'bg-yellow-400',
    Veneno: 'bg-purple-500',
    Hielo: 'bg-cyan-400',
    Lucha: 'bg-orange-600',
    Psíquico: 'bg-pink-500',
    Bicho: 'bg-green-700',
    Roca: 'bg-gray-500',
    Fantasma: 'bg-indigo-700',
    Dragón: 'bg-purple-700',
    Normal: 'bg-gray-400',
    Volador: 'bg-sky-300',
    Hada: 'bg-pink-300',
  };

  // Router inyectado para navegación
  router = inject(Router);

  // Mismo mock de datos
  pokemons = [
    {
      id: 1,
      nombre: 'Bulbasaur',
      descripcion: 'Bulbasaur puede sobrevivir durante días gracias al bulbo que tiene en el lomo.',
      imagen: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
      tipos: ['Planta', 'Veneno'],
      altura: '0.7 m',
      peso: '6.9 kg',
      habilidades: ['Espesura', 'Clorofila'],
    },
    {
      id: 4,
      nombre: 'Charmander',
      descripcion: 'La llama de su cola indica su estado de salud y emociones.',
      imagen: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
      tipos: ['Fuego'],
      altura: '0.6 m',
      peso: '8.5 kg',
      habilidades: ['Mar Llamas', 'Poder Solar'],
    },
    {
      id: 7,
      nombre: 'Squirtle',
      descripcion: 'Se refugia en su caparazón y lanza chorros de agua a gran presión.',
      imagen: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png',
      tipos: ['Agua'],
      altura: '0.5 m',
      peso: '9.0 kg',
      habilidades: ['Torrente', 'Cura Lluvia'],
    },
    {
      id: 25,
      nombre: 'Pikachu',
      descripcion: 'Almacena electricidad en las mejillas y la libera cuando se emociona.',
      imagen: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
      tipos: ['Eléctrico'],
      altura: '0.4 m',
      peso: '6.0 kg',
      habilidades: ['Electricidad Estática', 'Pararrayos'],
    },
    {
      id: 39,
      nombre: 'Jigglypuff',
      descripcion: 'Puede dormir a sus enemigos cantando una melodía hipnótica.',
      imagen: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png',
      tipos: ['Normal', 'Hada'],
      altura: '0.5 m',
      peso: '5.5 kg',
      habilidades: ['Canto', 'Piel Engrosada'],
    },
    {
      id: 52,
      nombre: 'Meowth',
      descripcion: 'Le encanta coleccionar monedas brillantes y es muy astuto.',
      imagen: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png',
      tipos: ['Normal'],
      altura: '0.4 m',
      peso: '4.2 kg',
      habilidades: ['Recogemonedas', 'Habilidad Oculta'],
    },
    {
      id: 150,
      nombre: 'Mewtwo',
      descripcion: 'Uno de los Pokémon más poderosos creado a partir de ADN de Mew.',
      imagen: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png',
      tipos: ['Psíquico'],
      altura: '2.0 m',
      peso: '122 kg',
      habilidades: ['Presión', 'Mente Maestra'],
    },
    {
      id: 151,
      nombre: 'Mew',
      descripcion: 'Pokémon legendario que contiene el ADN de todos los Pokémon.',
      imagen: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png',
      tipos: ['Psíquico'],
      altura: '0.4 m',
      peso: '4.0 kg',
      habilidades: ['Sincronía', 'Versatilidad'],
    },
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.pokemonId = Number(params.get('id'));
      this.pokemon = this.pokemons.find((p) => p.id === this.pokemonId);
    });
  }

  // Método opcional para volver a la lista
  volverLista() {
    this.router.navigate(['/comunicacion']);
  }
}
