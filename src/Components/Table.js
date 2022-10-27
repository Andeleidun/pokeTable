import { useState } from "react";
import "./Table.css";

function handleColumnData(column, poke) {
  // returns element for each column type
  if (column === "sprite") {
    return (
      <img
        src={poke[column]}
        alt={poke.name}
        key={poke.name + column}
        className={column}
      />
    );
  }
  if (Array.isArray(poke[column])) {
    return poke[column].map((item) => (
      <span className={item} key={poke.name + item}>
        {item}
      </span>
    ));
  }
  return <span key={poke.name + poke[column]}>{poke[column]}</span>;
}

function PokeTable({ pokemon, fetchNext, statusData }) {
  // uses sort and filter as render keys
  const [sort, setSort] = useState({ key: "pokedexNumber", direction: "↑" });
  const [filter, setFilter] = useState("");
  const {
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status
  } = statusData;
  const loading = isFetching || isFetchingNextPage || status === 'loading';
  let sortedPokemon = [...pokemon];
  if (sort.key !== null) {
    sortedPokemon.sort((a, b) => {
      if (a[sort.key] < b[sort.key]) {
        return sort.direction === "↑" ? -1 : 1;
      }
      if (a[sort.key] > b[sort.key]) {
        return sort.direction === "↑" ? 1 : -1;
      }
      return 0;
    });
  }
  if (filter.length > 0) {
    sortedPokemon = sortedPokemon.filter((poke) => {
      const checkValues = { ...poke, sprite: "" };
      const pokeValues = Object.values(checkValues);
      return pokeValues.some((item) => {
        if (Array.isArray(item)) {
          return item.some((ele) =>
            ele.toLowerCase().includes(filter.toLowerCase())
          );
        }
        const checkItem = typeof item === "number" ? item.toString() : item;
        return checkItem.toLowerCase().includes(filter.toLowerCase());
      });
    });
  }
  const columns = [
    {
      header: "Dex #",
      data: ["pokedexNumber"]
    },
    {
      header: "Name",
      data: ["name", "sprite"]
    },
    {
      header: "Height (m)",
      data: ["height"]
    },
    {
      header: "Weight (kg)",
      data: ["weight"]
    },
    {
      header: "Type(s)",
      data: ["types"]
    }
  ];
  const handleSort = (key) => {
    let direction = "↑";
    if (sort.key === key && sort.direction === "↑") {
      direction = "↓";
    }
    setSort({ key, direction });
  };
  const handleInput = (e) => {
    setFilter(e.target.value);
  };
  return (
    <table className="poketable">
      <caption>PokeTable</caption>
      <thead>
        <tr className="search-box" key='search-box'>
          <th key="search-header">
            <input
              type="text"
              placeholder="Search"
              key="search"
              value={filter}
              onChange={handleInput}
            />
          </th>
        </tr>
        <tr key='header'>
          {columns.map((column) => {
            const active = sort.key === column.data[0];
            return (
              <th key={column.header}>
                <button onClick={() => handleSort(column.data[0])}>
                  {active
                    ? column.header + " " + sort.direction
                    : column.header}
                </button>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {sortedPokemon.map((poke) => (
          <tr key={poke.id}>
            {columns.map((column) => {
              return (
                <td className={column.data[0]} key={poke.id + column.data[0]}>
                  {column.data.map((columnData) =>
                    handleColumnData(columnData, poke)
                  )}
                </td>
              );
            })}
          </tr>
        ))}
        <tr key='fetch-more' className='fetch-row'>
          <td>
            {
              hasNextPage ? (
                <div className='button-outside'>
                  <button
                    onClick={() => fetchNext()}
                    disabled={!hasNextPage || loading}
                    className='fetch-button'
                  >
                    {
                      loading ?
                        '...' :
                        'More'
                    }
                  </button>
                </div>
              ) : (
                <span>End</span>
              )
            }
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default PokeTable;
