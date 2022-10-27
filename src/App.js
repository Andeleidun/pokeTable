import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { fetchPokePages, fetchPokemonByUrls } from "./Utilities/fetchPokemon";
import PokeTable from "./Components/Table";
import "./App.css";

export default function App() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery(['pokePages'], fetchPokePages, {
    getNextPageParam: (lastPage) => lastPage.next,
  });

  const pokeUrls = data?.pages.map(page => page.results.map((poke) => poke.url));

  const { data: pokemon } = useQuery(
    ['pokemon', pokeUrls], fetchPokemonByUrls,
    {
      enabled: !!pokeUrls,
      keepPreviousData: true
    }
  );

  const statusData = {
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  };

  if (status === 'loading') return <span>Loading</span>;
  if (status === 'error') return <span>Error: {error.message}</span>;
  return (
    <div className="App">
      {
        pokemon ? (
          <PokeTable 
            pokemon={pokemon} 
            fetchNext={() => fetchNextPage()} 
            statusData={statusData} 
          />
        ) : <span>Loading</span>
      }

    </div>
  );
}
