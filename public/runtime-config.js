// Runtime configuration hook.
//
// Deployments can inject per-environment values by serving a generated version
// of this file that assigns the real values BEFORE this script runs, e.g.:
//
//   window.__RUNTIME_CONFIG__ = {
//     VITE_BACKEND_URL: 'https://api.example.com',
//     VITE_APP_DOMAIN: 'example.com',
//   };
//
// The frontend reads these keys through getConfig() in src/services/config/config.ts.
// Nothing is required here for local development: the config layer falls back
// to import.meta.env.* (baked at build time) and then to localhost defaults.
(function () {
  if (typeof window === 'undefined') return
  window.__RUNTIME_CONFIG__ = window.__RUNTIME_CONFIG__ || {}
})()
