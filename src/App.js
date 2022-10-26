import { useEffect, useState } from "react";
import fetchPokeData from "./Utilities/fetchPokemon";
import PokeTable from "./Components/Table";
import "./App.css";

export default function App() {
  const [pokemon, setPokemon] = useState(null);

  useEffect(() => {
    if (pokemon === null) {
      fetchPokeData().then((data) => {
        setPokemon(data);
      });
    }
  }, [pokemon]);
  return (
    <div className="App">
      {pokemon ? <PokeTable pokemon={pokemon} /> : <span>Loading</span>}
    </div>
  );
}
