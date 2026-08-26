import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchPokemonPage, POKEMON_API_URL } from "./pokemon";

function jsonResponse(value: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(value),
  } as unknown as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchPokemonPage", () => {
  it("fetches a page and normalizes Pokémon details concurrently", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          next: "https://pokeapi.co/api/v2/pokemon/?offset=20&limit=20",
          results: [
            { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
            { name: "charmander", url: "https://pokeapi.co/api/v2/pokemon/4/" },
          ],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          id: 1,
          name: "bulbasaur",
          height: 7,
          weight: 69,
          types: [{ type: { name: "grass" } }, { type: { name: "poison" } }],
          sprites: { front_default: "bulbasaur.png", front_shiny: "bulbasaur-shiny.png" },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          id: 4,
          name: "charmander",
          height: 6,
          weight: 85,
          types: [{ type: { name: "fire" } }],
          sprites: { front_default: "charmander.png", front_shiny: "charmander-shiny.png" },
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    const page = await fetchPokemonPage({
      pageParam: POKEMON_API_URL,
      signal: new AbortController().signal,
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(page.next).toContain("offset=20");
    expect(page.pokemon).toEqual([
      {
        id: 1,
        pokedexNumber: 1,
        name: "Bulbasaur",
        height: 0.7,
        weight: 6.9,
        types: ["grass", "poison"],
        sprite: "bulbasaur.png",
        shiny: "bulbasaur-shiny.png",
      },
      {
        id: 4,
        pokedexNumber: 4,
        name: "Charmander",
        height: 0.6,
        weight: 8.5,
        types: ["fire"],
        sprite: "charmander.png",
        shiny: "charmander-shiny.png",
      },
    ]);
  });

  it("surfaces unsuccessful API responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, 503)));

    await expect(
      fetchPokemonPage({
        pageParam: POKEMON_API_URL,
        signal: new AbortController().signal,
      }),
    ).rejects.toThrow("status 503");
  });
});
