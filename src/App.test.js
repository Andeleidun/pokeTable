import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { fetchPokePages, fetchPokemonByUrls } from "./Utilities/fetchPokemon";

jest.mock("./Utilities/fetchPokemon", () => ({
  fetchPokePages: jest.fn(),
  fetchPokemonByUrls: jest.fn(),
}));

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  fetchPokePages.mockResolvedValue({
    next: null,
    results: [{ name: "bulbasaur", url: "https://pokeapi.co/pokemon/1" }],
  });
  fetchPokemonByUrls.mockResolvedValue([
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
  ]);
});

test("loads and renders Pokémon data", async () => {
  renderApp();

  expect(screen.getByRole("status")).toHaveTextContent(/loading/i);
  expect(
    await screen.findByRole("heading", { name: "PokeTable" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Bulbasaur")).toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: /dex/i })).toHaveAttribute(
    "aria-sort",
    "ascending",
  );
});
