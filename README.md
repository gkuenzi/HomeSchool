# HomeSchool

HomeSchool tracks coding progress across five categories, projects, pins, and goals.

## Project structure

- `src/domain` contains the category, entity, query, and view contracts.
- `src/data` contains the versioned default state and local-storage repository.
- `src/state` exposes persisted application state through `HomeSchoolProvider` and `useHomeSchoolState`.
- `src/components` contains reusable layout primitives for the application shell and pages.
- `src/App.tsx` is intentionally a minimal composition point until the product views are implemented.

The persisted state is stored under `homeschool.state`. Invalid or outdated data falls back to an empty versioned state rather than breaking the application.

## Development

```sh
npm install
npm run dev
```

Run `npm run build` for the TypeScript and production build check.
