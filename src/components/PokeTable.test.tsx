import axe from "axe-core";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Pokemon } from "../api/pokemon";
import { PokeTable } from "./PokeTable";

const pokemon: Pokemon[] = [
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
  {
    id: 7,
    pokedexNumber: 7,
    name: "Squirtle",
    height: 0.5,
    weight: 9,
    types: ["water"],
    sprite: "squirtle.png",
    shiny: "squirtle-shiny.png",
  },
];

function renderTable(overrides: Partial<React.ComponentProps<typeof PokeTable>> = {}) {
  const onLoadMore = vi.fn();
  const result = render(
    <PokeTable
      pokemon={pokemon}
      hasNextPage
      isFetchingNextPage={false}
      onLoadMore={onLoadMore}
      {...overrides}
    />,
  );

  return { ...result, onLoadMore };
}

describe("PokeTable", () => {
  it("filters loaded rows and exposes the visible result count", async () => {
    const user = userEvent.setup();
    renderTable();

    await user.type(screen.getByRole("searchbox", { name: /filter loaded pokémon/i }), "water");

    expect(screen.getByRole("status")).toHaveTextContent("1 of 3 loaded Pokémon shown");
    expect(screen.getByText("Squirtle")).toBeInTheDocument();
    expect(screen.queryByText("Bulbasaur")).not.toBeInTheDocument();
  });

  it("sorts rows with programmatic sort state and toggles shiny sprites with a native button", async () => {
    const user = userEvent.setup();
    renderTable();

    const nameHeader = screen.getByRole("columnheader", { name: /name/i });
    const nameSortButton = within(nameHeader).getByRole("button");

    await user.click(nameSortButton);
    await user.click(nameSortButton);

    expect(nameHeader).toHaveAttribute("aria-sort", "descending");
    const rows = screen.getAllByRole("row");
    expect(within(rows[1]).getByText("Squirtle")).toBeInTheDocument();

    const spriteButton = screen.getByRole("button", {
      name: /standard sprite shown for bulbasaur.*show shiny sprite/i,
    });
    expect(spriteButton).toHaveAttribute("aria-pressed", "false");

    await user.click(spriteButton);

    expect(spriteButton).toHaveAttribute("aria-pressed", "true");
    expect(spriteButton.querySelector("img")).toHaveAttribute("src", "bulbasaur-shiny.png");
  });

  it("uses a real disabled load-more control while the next page is pending", async () => {
    const user = userEvent.setup();
    const { onLoadMore, rerender } = renderTable();

    await user.click(screen.getByRole("button", { name: /load 20 more pokémon/i }));
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    rerender(
      <PokeTable
        pokemon={pokemon}
        hasNextPage
        isFetchingNextPage
        onLoadMore={onLoadMore}
      />,
    );

    expect(screen.getByRole("button", { name: /loading more pokémon/i })).toBeDisabled();
  });

  it("has no detectable axe violations in the primary loaded state", async () => {
    const { container } = renderTable();
    const results = await axe.run(container);

    expect(results.violations).toEqual([]);
  });
});
