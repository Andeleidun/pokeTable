# PokeTable

PokeTable is a compact React application for exploring PokeAPI data through an accessible, sortable, filterable table with progressive page loading.

Live demo: https://andeleidun.github.io/pokeTable/

## Why this repository exists

The original project demonstrated React hooks, React Query, filtering, sorting, and progressive data loading. In 2026 it was deliberately modernized as an example of improving an existing frontend rather than replacing working behavior with a greenfield rewrite.

The modernization focuses on the engineering concerns that matter in production UI work:

- current React and TanStack Query APIs;
- strict TypeScript boundaries;
- checked and cancellable remote requests;
- native HTML semantics and keyboard behavior;
- explicit loading, error, empty, and pagination states;
- behavior-level tests and automated accessibility validation;
- reproducible CI validation and a production build.

## Architecture

### Server state

`src/api/pokemon.ts` owns the PokeAPI boundary. A single TanStack Query infinite query fetches one list page and normalizes its detail requests concurrently. HTTP failures are surfaced as errors, and the query-provided `AbortSignal` is passed through each request so abandoned work can be cancelled.

### UI state

The table owns only local presentation state: filter text, sort direction, and the set of Pokémon currently showing shiny sprites. Derived filtering and sorting are memoized and never mutate query data or React state during render.

### Accessibility

- The result remains a native HTML table instead of converting rows into layout grids.
- Sortable column headers expose `aria-sort` and use native buttons.
- Sprite toggles are native buttons with `aria-pressed`; no custom Enter-key emulation is required.
- Loading/result updates use status semantics and failures use alerts.
- Focus indicators are visible, horizontal overflow remains keyboard reachable, and reduced-motion preferences are respected.
- The primary loaded state is checked with axe-core in the test suite.

## Toolchain

- React 19
- TypeScript
- TanStack Query 5
- Vite
- Vitest + Testing Library
- ESLint + Prettier
- axe-core
- GitHub Actions

## Local development

Prerequisites:

- Node.js 22.12 or newer
- npm 10.8 or newer

```bash
npm ci
npm run dev
```

## Validation

Run the same quality gates used by CI:

```bash
npm run validate
```

Or run them independently:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:run
npm run build
```

## Deployment

The Vite base path is configured for GitHub Pages at `/pokeTable/`.

```bash
npm run deploy
```

## Project behavior

- Loads the first PokeAPI page automatically.
- Loads additional pages on explicit user request.
- Filters across loaded Dex number, name, height, weight, and types.
- Sorts every visible column and exposes the active sort direction programmatically.
- Lets users switch each available sprite between standard and shiny variants.

## Contact

More information about Adair Daniels, including other software projects and professional experience, is available at https://adairdaniels.com.
