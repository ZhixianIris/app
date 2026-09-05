# learning-web

A standalone single-page web client built with:

- [Vite 8](https://vite.dev)
- [React 19](https://react.dev)
- [React Router 7](https://reactrouter.com)
- [TanStack Query 5](https://tanstack.com/query)
- [Tailwind CSS 4](https://tailwindcss.com)
- [Base UI](https://base-ui.com) (`@base-ui/react@1.8.0`)
- TypeScript (strict)

## Development

```bash
npm install
npm run dev        # dev server on http://localhost:3000
```

## Verification

```bash
npm run typecheck  # tsc -b (strict)
npm test           # vitest
npm run build      # production build into dist/
```

## Configuration

Build-time configuration is read from `import.meta.env` (`VITE_*` variables, see
`src/services/config/config.ts`). Runtime overrides can be injected before boot
through a generated `public/runtime-config.js` that assigns
`window.__RUNTIME_CONFIG__`.

| Variable | Purpose |
| --- | --- |
| `VITE_BACKEND_URL` | Backend origin (default `http://localhost/`) |
| `VITE_API_URL` | Explicit API base (defaults to `<backend>/api/v1/`) |
| `VITE_APP_DOMAIN` | Deployment domain for multi-tenancy |
| `VITE_COLLAB_URL` | Collaboration WebSocket endpoint |

## License

Derived from an AGPL-3.0 upstream project. See [LICENSE](LICENSE) and
[NOTICE](NOTICE).
