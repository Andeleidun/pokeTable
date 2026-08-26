import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { PokeTable } from "./components/PokeTable";
import { fetchPokemonPage, POKEMON_API_URL } from "./api/pokemon";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "An unexpected error occurred.";
}

export default function App() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["pokemon"],
    queryFn: ({ pageParam, signal }) =>
      fetchPokemonPage({ pageParam: String(pageParam), signal }),
    initialPageParam: POKEMON_API_URL,
    getNextPageParam: (lastPage) => lastPage.next ?? undefined,
    staleTime: 5 * 60 * 1000,
  });

  const pokemon = useMemo(
    () => data?.pages.flatMap((page) => page.pokemon) ?? [],
    [data],
  );

  if (isPending) {
    return (
      <main className="app-shell">
        <h1>PokeTable</h1>
        <p role="status" aria-live="polite">
          Loading Pokémon…
        </p>
      </main>
    );
  }

  if (isError && pokemon.length === 0) {
    return (
      <main className="app-shell">
        <h1>PokeTable</h1>
        <div className="error-panel" role="alert">
          <p>Unable to load Pokémon. {errorMessage(error)}</p>
          <button type="button" onClick={() => void refetch()}>
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <p className="eyebrow">Accessible React data exploration</p>
        <h1>PokeTable</h1>
        <p>
          Search, sort, and progressively load Pokémon data while preserving native
          table semantics and keyboard-accessible interactions.
        </p>
      </header>

      <PokeTable
        pokemon={pokemon}
        hasNextPage={Boolean(hasNextPage)}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={() => void fetchNextPage()}
      />

      {isError ? (
        <div className="error-panel compact" role="alert">
          <p>Additional Pokémon could not be loaded. {errorMessage(error)}</p>
          <button type="button" onClick={() => void fetchNextPage()}>
            Retry loading more
          </button>
        </div>
      ) : null}
    </main>
  );
}
