export const POKEMON_API_URL = "https://pokeapi.co/api/v2/pokemon/";

interface PokemonListResponse {
  next: string | null;
  results: Array<{
    name: string;
    url: string;
  }>;
}

interface PokemonDetailResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: Array<{
    type: {
      name: string;
    };
  }>;
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
  };
}

export interface Pokemon {
  id: number;
  pokedexNumber: number;
  name: string;
  height: number;
  weight: number;
  types: string[];
  sprite: string | null;
  shiny: string | null;
}

export interface PokemonPage {
  next: string | null;
  pokemon: Pokemon[];
}

interface FetchPokemonPageInput {
  pageParam: string;
  signal: AbortSignal;
}

async function requestJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`PokeAPI request failed with status ${response.status}.`);
  }

  return (await response.json()) as T;
}

function capitalize(value: string): string {
  return value.length === 0 ? value : value[0].toUpperCase() + value.slice(1);
}

function normalizePokemon(detail: PokemonDetailResponse): Pokemon {
  return {
    id: detail.id,
    pokedexNumber: detail.id,
    name: capitalize(detail.name),
    height: detail.height / 10,
    weight: detail.weight / 10,
    types: detail.types.map(({ type }) => type.name),
    sprite: detail.sprites.front_default,
    shiny: detail.sprites.front_shiny,
  };
}

export async function fetchPokemonPage({
  pageParam,
  signal,
}: FetchPokemonPageInput): Promise<PokemonPage> {
  const page = await requestJson<PokemonListResponse>(pageParam, signal);
  const details = await Promise.all(
    page.results.map(({ url }) => requestJson<PokemonDetailResponse>(url, signal)),
  );

  return {
    next: page.next,
    pokemon: details.map(normalizePokemon),
  };
}
