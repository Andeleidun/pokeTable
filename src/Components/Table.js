import { useMemo, useState } from "react";
import "./Table.css";

const columns = [
  { header: "Dex #", data: ["pokedexNumber"] },
  { header: "Name", data: ["name", "sprite"] },
  { header: "Height (m)", data: ["height"] },
  { header: "Weight (kg)", data: ["weight"] },
  { header: "Type(s)", data: ["types"] },
];

function compareValues(a, b, direction) {
  if (a === b) return 0;
  const result = a < b ? -1 : 1;
  return direction === "ascending" ? result : -result;
}

function PokeTable({ pokemon, fetchNext, statusData }) {
  const [sort, setSort] = useState({
    key: "pokedexNumber",
    direction: "ascending",
  });
  const [filter, setFilter] = useState("");
  const [shinies, setShinies] = useState({});
  const { hasNextPage, isFetching, isFetchingNextPage, pokeFetching } =
    statusData;
  const loading = isFetching || isFetchingNextPage || pokeFetching;

  function updateShinies(id) {
    setShinies((current) => ({ ...current, [id]: !current[id] }));
  }

  function handleSort(key) {
    setSort((current) => ({
      key,
      direction:
        current.key === key && current.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  }

  const visiblePokemon = useMemo(() => {
    const normalizedFilter = filter.trim().toLowerCase();
    const filteredPokemon = normalizedFilter
      ? pokemon.filter((poke) =>
          [
            poke.pokedexNumber,
            poke.name,
            poke.height,
            poke.weight,
            ...poke.types,
          ].some((value) =>
            String(value).toLowerCase().includes(normalizedFilter),
          ),
        )
      : pokemon;

    return [...filteredPokemon].sort((a, b) =>
      compareValues(a[sort.key], b[sort.key], sort.direction),
    );
  }, [filter, pokemon, sort]);

  function renderCellData(column, poke) {
    if (column === "sprite") {
      const shiny = Boolean(shinies[poke.pokedexNumber]);
      const sprite = shiny ? poke.shiny : poke.sprite;

      return (
        <button
          type="button"
          className="sprite-button"
          onClick={() => updateShinies(poke.pokedexNumber)}
          aria-pressed={shiny}
          aria-label={`${shiny ? "Show standard" : "Show shiny"} ${poke.name} sprite`}
          key={`${poke.name}-${column}`}
        >
          {sprite ? (
            <img src={sprite} alt="" className="sprite" />
          ) : (
            <span aria-hidden="true">No sprite</span>
          )}
        </button>
      );
    }

    if (Array.isArray(poke[column])) {
      return poke[column].map((item) => (
        <span className={`type type-${item}`} key={`${poke.name}-${item}`}>
          {item}
        </span>
      ));
    }

    return <span key={`${poke.name}-${column}`}>{poke[column]}</span>;
  }

  return (
    <section className="table-section" aria-labelledby="poke-table-title">
      <div className="table-toolbar">
        <div>
          <h1 id="poke-table-title">PokeTable</h1>
          <p>Explore, filter, sort, and load Pokémon from PokéAPI.</p>
        </div>
        <label className="search-field">
          <span>Filter Pokémon</span>
          <input
            type="search"
            placeholder="Name, type, number…"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
        </label>
      </div>

      <div className="table-scroll" tabIndex="0" aria-label="Pokémon data table">
        <table className="poketable">
          <caption className="visually-hidden">
            Pokémon loaded from PokéAPI. Sort columns with the header buttons and
            activate a Pokémon sprite to toggle its shiny form.
          </caption>
          <thead>
            <tr>
              {columns.map((column) => {
                const sortKey = column.data[0];
                const active = sort.key === sortKey;
                return (
                  <th
                    key={column.header}
                    scope="col"
                    aria-sort={active ? sort.direction : "none"}
                  >
                    <button type="button" onClick={() => handleSort(sortKey)}>
                      <span>{column.header}</span>
                      <span aria-hidden="true" className="sort-indicator">
                        {active
                          ? sort.direction === "ascending"
                            ? "↑"
                            : "↓"
                          : "↕"}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visiblePokemon.map((poke) => (
              <tr key={poke.id ?? poke.pokedexNumber}>
                {columns.map((column) => (
                  <td
                    className={column.data[0]}
                    key={`${poke.pokedexNumber}-${column.data[0]}`}
                  >
                    {column.data.map((columnData) =>
                      renderCellData(columnData, poke),
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {visiblePokemon.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="empty-state">
                  No Pokémon match “{filter}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="load-more">
        {hasNextPage ? (
          <button
            type="button"
            onClick={fetchNext}
            disabled={loading}
            className="fetch-button"
          >
            {loading ? "Loading more…" : "Load 20 more"}
          </button>
        ) : (
          <p>All available Pokémon are loaded.</p>
        )}
        <p className="visually-hidden" role="status" aria-live="polite">
          {loading ? "Loading more Pokémon" : `${pokemon.length} Pokémon loaded`}
        </p>
      </div>
    </section>
  );
}

export default PokeTable;
