import { fireEvent, render, screen, within } from "@testing-library/react";
import PokeTable from "./Table";

const pokemon = [
  {
    id: 25,
    pokedexNumber: 25,
    name: "Pikachu",
    height: 0.4,
    weight: 6,
    types: ["electric"],
    sprite: "pikachu.png",
    shiny: "pikachu-shiny.png",
  },
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
];

const statusData = {
  hasNextPage: true,
  isFetching: false,
  isFetchingNextPage: false,
  pokeFetching: false,
};

function renderTable(overrides = {}) {
  const fetchNext = jest.fn();
  render(
    <PokeTable
      pokemon={pokemon}
      fetchNext={fetchNext}
      statusData={statusData}
      {...overrides}
    />,
  );
  return fetchNext;
}

test("filters Pokémon and exposes a useful empty state", () => {
  renderTable();
  const filter = screen.getByRole("searchbox", { name: /filter pokémon/i });

  fireEvent.change(filter, { target: { value: "electric" } });
  expect(screen.getByText("Pikachu")).toBeInTheDocument();
  expect(screen.queryByText("Bulbasaur")).not.toBeInTheDocument();

  fireEvent.change(filter, { target: { value: "missing" } });
  expect(screen.getByText(/no pokémon match/i)).toBeInTheDocument();
});

test("sorts by an accessible column header", () => {
  renderTable();
  const nameHeader = screen.getByRole("columnheader", { name: /name/i });
  const sortButton = within(nameHeader).getByRole("button");

  expect(nameHeader).toHaveAttribute("aria-sort", "none");
  fireEvent.click(sortButton);
  expect(nameHeader).toHaveAttribute("aria-sort", "ascending");

  const rows = screen.getAllByRole("row").slice(1);
  expect(within(rows[0]).getByText("Bulbasaur")).toBeInTheDocument();
});

test("toggles shiny sprites with a semantic pressed button", () => {
  renderTable();
  const spriteButton = screen.getByRole("button", {
    name: /show shiny pikachu sprite/i,
  });

  expect(spriteButton).toHaveAttribute("aria-pressed", "false");
  fireEvent.click(spriteButton);
  expect(
    screen.getByRole("button", { name: /show standard pikachu sprite/i }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("loads more results through the explicit pagination control", () => {
  const fetchNext = renderTable();
  fireEvent.click(screen.getByRole("button", { name: /load 20 more/i }));
  expect(fetchNext).toHaveBeenCalledTimes(1);
});
