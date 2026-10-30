# Frontend (`ied-fe`)

React + Vite + MUI (Emotion engine) + TanStack Query + react-hook-form +
Zustand. Env: `VITE_BE_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_FF_RACUNI_V2`
(`src/utils/envVariables.ts`).

## Layout

```
src/
  api/            axios calls, one file per resource (shared instance in interceptors/auth.ts)
  hooks/<domain>/ use<X>Queries.ts, use<X>Mutations.ts — TanStack Query
  pages/          route components (thin)
  components/     feature folders (FirmaForm, Seminari, RacunV2, …)
  store/          Zustand stores (client-only state)
  utils/          env, helpers
```

## Data fetching — the target pattern

```
component → hooks/<domain>/use<X>Queries.ts → api/<x>.api.ts → BE
```

- Read data with `useQuery`, write with `useMutation` + `invalidateQueries`.
- Do **not** fetch in `useEffect` + `useState`; several older components do
  (FirmasTable, PretrageRacuna, PredefinedPretrage, Racuni page). Migrate
  them when you touch them.
- Define a query key once per domain and reuse it in queries and mutations.

## Forms

react-hook-form + `zodResolver(<Schema from ied-shared>)`. For multi-section
forms follow `components/RacunV2/` (FormProvider + `useFormContext` per
section, defaults in `schema/`) — it's the reference implementation.

## Styling

MUI components + `sx`. Use `styled` from `@mui/material/styles` only for
reusable styled primitives (`components/styled/`). No inline `style={{}}` in
new code. `styled-components` is installed but unused.

## Feature flags

`VITE_FF_RACUNI_V2` gates the `/racuni-v2` route and nav item (`App.tsx`,
`Navigation/ApplicationNavBar.tsx`).
