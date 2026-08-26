import { useMemo, useState } from "react";
import type { Pokemon } from "../api/pokemon";

type SortKey = "pokedexNumber" | "name" | "height" | "weight" | "types";
type SortDirection = "ascending" | "descending";

interface SortState {
  key: SortKey;
  direction: SortDirection;
}

interface PokeTableProps {
  pokemon: Pokemon[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

const columns: Array<{ key: SortKey; label: string }> = [
  { key: "pokedexNumber", label: "Dex #" },
  { key: "name", label: "Name" },
  { key: "height", label: "Height (m)" },
  { key: "weight", label: "Weight (kg)" },
  { key: "types", label: "Type(s)" },
];

function sortableValue(pokemon: Pokemon, key: SortKey): string | number {
  if (key === "types") {
    return pokemon.types.join(",");
  }

  return pokemon[key];
}

function comparePokemon(a: Pokemon, b: Pokemon, sort: SortState): number {
  const left = sortableValue(a, sort.key);
  const right = sortableValue(b, sort.key);
  const direction = sort.direction === "ascending" ? 1 : -1;

  if (typeof left === "number" && typeof right === "number") {
    return (left - right) * direction;
  }

  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: "base",
  }) * direction;
}

function matchesFilter(pokemon: Pokemon, rawFilter: string): boolean {
  const filter = rawFilter.trim().toLocaleLowerCase();

  if (!filter) {
    return true;
  }

  return [
    pokemon.pokedexNumber.toString(),
    pokemon.name,
    pokemon.height.toString(),
    pokemon.weight.toString(),
    ...pokemon.types,
  ].some((value) => value.toLocaleLowerCase().includes(filter));
}

export function PokeTable({
  pokemon,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: PokeTableProps) {
  const [sort, setSort] = useState<SortState>({
    key: "pokedexNumber",
    direction: "ascending",
  });
  const [filter, setFilter] = useState("");
  const [shinyIds, setShinyIds] = useState<Set<number>>(() => new Set());

  const visiblePokemon = useMemo(
    () =>
      pokemon
        .filter((item) => matchesFilter(item, filter))
        .toSorted((a, b) => comparePokemon(a, b, sort)),
    [filter, pokemon, sort],
  );

  function updateSort(key: SortKey) {
    setSort((current) => ({
      key,
      direction:
        current.key === key && current.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  }

  function toggleShiny(id: number) {
    setShinyIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <section className="table-card" aria-labelledby="table-heading">
      <div className="table-toolbar">
        <div>
          <h2 id="table-heading">Loaded Pokédex</h2>
          <p className="results-status" role="status" aria-live="polite">
            {visiblePokemon.length} of {pokemon.length} loaded Pokémon shown.
          </p>
        </div>

        <label className="search-field">
          <span>Filter loaded Pokémon</span>
          <input
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Name, type, size, or Dex #"
          />
        </label>
      </div>

      <div className="table-scroll" tabIndex={0} aria-label="Scrollable Pokémon table">
        <table className="poketable">
          <caption className="sr-only">
            Loaded Pokémon with sortable columns and interactive standard or shiny sprites.
          </caption>
          <thead>
            <tr>
              {columns.map((column) => {
                const active = sort.key === column.key;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={active ? sort.direction : "none"}
                  >
                    <button type="button" onClick={() => updateSort(column.key)}>
                      <span>{column.label}</span>
                      <span aria-hidden="true" className="sort-indicator">
                        {active ? (sort.direction === "ascending" ? "↑" : "↓") : "↕"}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visiblePokemon.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-state">
                  No loaded Pokémon match “{filter}”.
                </td>
              </tr>
            ) : (
              visiblePokemon.map((item) => {
                const shiny = shinyIds.has(item.id);
                const sprite = shiny ? item.shiny : item.sprite;
                const toggleLabel = shiny
                  ? `Shiny sprite shown for ${item.name}. Show standard sprite.`
                  : `Standard sprite shown for ${item.name}. Show shiny sprite.`;

                return (
                  <tr key={item.id}>
                    <td className="number-cell">{item.pokedexNumber}</td>
                    <th scope="row" className="name-cell">
                      <button
                        type="button"
                        className="sprite-button"
                        onClick={() => toggleShiny(item.id)}
                        aria-pressed={shiny}
                        aria-label={toggleLabel}
                        disabled={!item.sprite || !item.shiny}
                      >
                        {sprite ? (
                          <img src={sprite} alt="" width="64" height="64" />
                        ) : (
                          <span aria-hidden="true" className="sprite-fallback">
                            ?
                          </span>
                        )}
                      </button>
                      <span>{item.name}</span>
                    </th>
                    <td>{item.height}</td>
                    <td>{item.weight}</td>
                    <td>
                      <div className="type-list">
                        {item.types.map((type) => (
                          <span key={type} className={`type-chip type-${type}`}>
                            {type}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="load-more-panel">
        {hasNextPage ? (
          <button
            type="button"
            className="load-more-button"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading more Pokémon…" : "Load 20 more Pokémon"}
          </button>
        ) : (
          <p>All available Pokémon have been loaded.</p>
        )}
      </div>
    </section>
  );
}
