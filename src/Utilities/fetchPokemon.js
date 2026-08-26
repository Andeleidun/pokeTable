const apiUrl = "https://pokeapi.co/api/v2/pokemon/";

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

function capitalize(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function normalizePokemon(pokemon) {
  return {
    id: pokemon.id,
    pokedexNumber: pokemon.id,
    name: capitalize(pokemon.name),
    height: pokemon.height / 10,
    weight: pokemon.weight / 10,
    types: pokemon.types.map(({ type }) => type.name),
    sprite: pokemon.sprites.front_default,
    shiny: pokemon.sprites.front_shiny,
  };
}

export async function fetchPokePages({ pageParam = apiUrl }) {
  return fetchJson(pageParam);
}

export async function fetchPokemonByUrls({ queryKey }) {
  const [, urls = []] = queryKey;
  const uniqueUrls = [...new Set(urls)];
  const pokemon = await Promise.all(uniqueUrls.map((url) => fetchJson(url)));

  return pokemon.map(normalizePokemon);
}
