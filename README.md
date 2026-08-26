# PokeTable

PokeTable is a focused React data-table project built around the public [PokéAPI](https://pokeapi.co/). It demonstrates incremental data loading, client-side filtering and sorting, asynchronous state management with TanStack Query, and accessible interaction patterns.

## What it demonstrates

- Incremental loading of Pokémon data in 20-item pages
- Parallel detail requests with explicit HTTP error handling
- Simultaneous filtering and sorting across the loaded dataset
- Semantic table markup with accessible sortable column headers
- Keyboard-operable shiny sprite toggles implemented as pressed buttons
- Responsive overflow handling, visible focus states, and reduced-motion support
- Behavior-focused tests with React Testing Library
- Reproducible CI that runs tests and a production build

## Run locally

### Prerequisites

- Node.js 20 or newer
- npm

```bash
npm ci
npm start
```

The production build can be verified with:

```bash
npm test -- --watchAll=false
npm run build
```

## Usage

1. PokeTable loads the first 20 Pokémon from PokéAPI.
2. Use **Filter Pokémon** to match by name, Pokédex number, dimensions, or type.
3. Activate a column header to sort ascending or descending.
4. Activate a Pokémon sprite button to switch between its standard and shiny form.
5. Use **Load 20 more** to retrieve the next page.

## Live preview

The GitHub Pages deployment is available at https://andeleidun.github.io/pokeTable/.

## Modernization notes

The 2026 modernization intentionally preserves the repository's locked React 18 / Create React App runtime while addressing higher-value engineering debt first: request correctness, state safety, semantic HTML, keyboard and screen-reader behavior, responsive layout, meaningful tests, and CI. A future toolchain-only migration can move the project to Vite and a newer TanStack Query major once the dependency lockfile can be regenerated and validated as a discrete change.

## Contact

Additional professional work and contact information are available at https://adairdaniels.com.
