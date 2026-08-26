import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import PokeTable from "./Components/Table";
import { fetchPokePages, fetchPokemonByUrls } from "./Utilities/fetchPokemon";
import "./App.css";

export default function App() {
  const pagesQuery = useInfiniteQuery({
    queryKey: ["pokePages"],
    queryFn: fetchPokePages,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.next ?? undefined,
  });

  const pokeUrls =
    pagesQuery.data?.pages.flatMap((page) =>
      page.results.map((pokemon) => pokemon.url),
    ) ?? [];

  const pokemonQuery = useQuery({
    queryKey: ["pokemon", pokeUrls],
    queryFn: fetchPokemonByUrls,
    enabled: pokeUrls.length > 0,
    placeholderData: (previousData) => previousData,
  });

  if (pagesQuery.isPending) {
    return <p role="status">Loading Pokémon…</p>;
  }

  if (pagesQuery.isError) {
    return (
      <p role="alert">
        Unable to load Pokémon: {pagesQuery.error.message}
      </p>
    );
  }

  if (pokemonQuery.isError) {
    return (
      <p role="alert">
        Unable to load Pokémon details: {pokemonQuery.error.message}
      </p>
    );
  }

  return (
    <main className="App">
      <PokeTable
        pokemon={pokemonQuery.data ?? []}
        fetchNext={() => pagesQuery.fetchNextPage()}
        statusData={{
          hasNextPage: pagesQuery.hasNextPage,
          isFetching: pagesQuery.isFetching,
          isFetchingNextPage: pagesQuery.isFetchingNextPage,
          pokeFetching: pokemonQuery.isFetching,
        }}
      />
    </main>
  );
}
