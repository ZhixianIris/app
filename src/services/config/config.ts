import { stripPort, isSubdomainOf, isSameHost, isLocalhost as isLocalhostCheck } from '@services/utils/ts/hostUtils'

// Runtime configuration cache
let runtimeConfig: Record<string, string> | null = null;

// Lazy load runtime configuration.
// The SPA is browser-only. Values arrive either baked in at build time
// (import.meta.env.*) or injected before boot through the runtime-config.js
// <head> script into window.__RUNTIME_CONFIG__. There is deliberately no
// Node/filesystem fallback: this module must never reference process/fs.
function loadRuntimeConfig(): Record<string, string> {
  if (typeof window !== 'undefined' && (window as any).__RUNTIME_CONFIG__) {
    runtimeConfig = (window as any).__RUNTIME_CONFIG__;
  }
  return runtimeConfig || {};
}

// Helper function to get config value with fallback:
// runtime config (window.__RUNTIME_CONFIG__) → import.meta.env → default.
export const getConfig = (key: string, defaultValue: string = ''): string => {
  const config = loadRuntimeConfig();

  if (config && config[key]) {
    return config[key];
  }

  const env = import.meta.env as unknown as Record<string, string | undefined>;
  return env[key] ?? defaultValue;
};

// Helper to read a cookie value by name (client-side only)
const getCookieValue = (name: string): string | null => {
  if (typeof window === 'undefined') return null
  try {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
    return match ? decodeURIComponent(match[1]) : null
  } catch {
    return null
  }
}

// Dynamic config getters - these are functions to ensure runtime values are used
const getAPP_HTTP_PROTOCOL = () =>
  (getConfig('VITE_APP_HTTPS') === 'true') ? 'https://' : 'http://'
const getAPP_BACKEND_URL = () => getConfig('VITE_BACKEND_URL', 'http://localhost/')
const getAPP_DOMAIN = () => {
  // 1. Env var (backward compat for existing deploys)
  const envVal = getConfig('VITE_APP_DOMAIN')
  if (envVal) return envVal
  // 2. Cookie set by middleware from backend instance info
  const cookieVal = getCookieValue('app_frontend_domain')
  if (cookieVal) return cookieVal
  // 3. Default
  return 'localhost'
}
const getAPP_TOP_DOMAIN = () => {
  // 1. Env var (backward compat for existing deploys)
  const envVal = getConfig('VITE_APP_TOP_DOMAIN')
  if (envVal) return envVal
  // 2. Cookie set by middleware from backend instance info
  const cookieVal = getCookieValue('app_top_domain')
  if (cookieVal) return cookieVal
  // 3. Derive from DOMAIN by stripping port
  const domain = getAPP_DOMAIN()
  return domain.split(':')[0]
}
// PostHog product analytics — opt-in. Telemetry is OFF unless this key is set
// in the deployment env. No separate enable flag: presence of the key IS the switch.
const getPOSTHOG_KEY = () => getConfig('VITE_POSTHOG_KEY', '');
const getAPP_PLATFORM_URL = (): string | null => {
  // NEXT_PUBLIC_ variant (available client-side via runtime config)
  const pubVal = getConfig('VITE_PLATFORM_URL')
  if (pubVal) return pubVal.replace(/\/+$/, '')
  // Non-prefixed variant (server-side only, backward compat)
  const val = getConfig('APP_PLATFORM_URL')
  if (val) return val.replace(/\/+$/, '')
  return null
}

// Export getter functions for dynamic runtime configuration
export const getAPP_HTTP_PROTOCOL_VAL = getAPP_HTTP_PROTOCOL
export const getAPP_BACKEND_URL_VAL = getAPP_BACKEND_URL
export const getAPP_DOMAIN_VAL = getAPP_DOMAIN
export const getAPP_TOP_DOMAIN_VAL = getAPP_TOP_DOMAIN
export const getPOSTHOG_KEY_VAL = getPOSTHOG_KEY
export const getAPP_PLATFORM_URL_VAL = getAPP_PLATFORM_URL

// Export constants for backward compatibility
// These are computed once at module load, but getConfig uses runtime values
// For middleware/proxy (where runtime is critical), use the getter functions instead
export const APP_HTTP_PROTOCOL = getAPP_HTTP_PROTOCOL()
export const APP_BACKEND_URL = getAPP_BACKEND_URL()
export const APP_DOMAIN = getAPP_DOMAIN()
export const APP_TOP_DOMAIN = getAPP_TOP_DOMAIN()

// Helper to check if we're on a custom domain (for API URL selection)
export const isOnCustomDomain = (): boolean => {
  if (typeof window === 'undefined') return false
  const hostname = window.location.hostname
  const domain = getAPP_DOMAIN()
  return !isSubdomainOf(hostname, domain) && !isSameHost(hostname, domain) && !isLocalhostCheck(hostname)
}

// Derive API URL from backend URL (with backward compat for NEXT_PUBLIC_APP_API_URL)
const deriveAPIUrl = (): string => {
  // Backward compat: if explicit API URL is set, use it
  const explicitApiUrl = getConfig('VITE_API_URL')
  if (explicitApiUrl) return explicitApiUrl
  // Derive from backend URL
  const backendUrl = getAPP_BACKEND_URL().replace(/\/+$/, '')
  return `${backendUrl}/api/v1/`
}

// For direct usage, these call the getters
export const getAPIUrl = () => {
  // On custom domains (client-side), use relative path to go through Next.js proxy
  // This ensures cookies work correctly (same-origin)
  if (isOnCustomDomain()) {
    return '/api/v1/'
  }
  return deriveAPIUrl()
}

// Always returns the full absolute API URL (never the same-origin relative
// path used for custom-domain cookie isolation).
export const getAbsoluteAPIUrl = () => {
  return deriveAPIUrl()
}

// Current org slug from the app_org cookie. For components rendered outside
// an /orgs/* route (editor surfaces) where neither OrgProvider nor route
// params are available.
export const getCurrentOrgSlug = (): string | null => {
  return getCookieValue('app_org')
}

export const getBackendUrl = () => getAPP_BACKEND_URL()

/**
 * Get the upgrade/plan URL for a given org.
 *
 * In SaaS the billing/upgrade hub lives IN-APP on the apex (example.com
 * /billing) — see app/(hub)/billing. We return an absolute apex URL so an
 * upgrade CTA rendered inside an org subdomain ({slug}.example.com) crosses
 * to the root hub; the `.{top_domain}`-scoped session cookie carries the login
 * across the hop. Returns null in OSS/EE, where there is no SaaS billing
 * surface — callers MUST treat null as "hide the upgrade CTA".
 */
export const getUpgradeUrl = (orgSlug: string, plan?: string | null): string | null => {
  const mode = getDeploymentMode()
  if (mode === 'oss' || mode === 'ee') return null
  // Deep-link: when a target plan is given, the billing page opens the switch
  // wizard straight at the Confirm step for that plan (?plan=), so a "Upgrade to
  // Standard" CTA lands the user one click from checkout instead of the plan grid.
  const planParam = plan ? `&plan=${encodeURIComponent(plan)}` : ''
  return getMainDomainUri(`/billing?org=${encodeURIComponent(orgSlug)}${planParam}`)
}

/**
 * Build a URL on the platform domain (e.g. example.com).
 * Use this for links that should point to the main platform site,
 * not the org subdomain (e.g. upgrade, billing, account management).
 * Returns null when platform URL is not configured.
 */
export const getPlatformUrl = (path: string): string | null => {
  const platformUrl = getAPP_PLATFORM_URL()
  if (!platformUrl) return null
  return `${platformUrl}${path}`
}

// Tenancy mode — the authoritative client-side getter.
//
// Reads the `app_tenancy` cookie set by the middleware on every request. The
// cookie is sourced from the backend's instance/info endpoint, so it always
// reflects the current deployment configuration. Defaults to 'single' when
// the cookie isn't present (e.g. very first request before middleware runs).
//
// We deliberately do NOT consult `NEXT_PUBLIC_APP_MULTI_ORG` here —
// stale env vars from older deploys used to override the runtime cookie and
// produce broken URLs like `default.localhost:3000`. The env var still has
// effect at backend boot time; that's the only place it should influence
// behavior.
export type TenancyMode = 'multi' | 'single'

export const getTenancy = (): TenancyMode => {
  const cookieVal = getCookieValue('app_tenancy')
  if (cookieVal === 'multi' || cookieVal === 'single') return cookieVal
  return 'single'
}

// Backward-compat shim — prefer getTenancy() in new code.
export const isMultiOrgModeEnabled = () => getTenancy() === 'multi'

/**
 * Get custom domain from context (client-side only)
 * Returns the custom domain with port if we're on one, null otherwise
 */
export const getCustomDomainFromContext = (): string | null => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const host = window.location.host // includes port if non-standard
    const domain = getAPP_DOMAIN()

    // Check if current hostname is a custom domain (not a subdomain of APP_DOMAIN)
    const isSub = isSubdomainOf(hostname, domain) || isSameHost(hostname, domain)
    const isLocal = isLocalhostCheck(hostname)

    if (!isSub && !isLocal) {
      // Return host (includes port) for custom domains
      return host
    }

    // Also check cookie as fallback (for cases where hostname check might not work)
    try {
      const cookies = document.cookie.split(';')
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === 'app_custom_domain' && value) {
          // Cookie only stores hostname, so add current port if present
          const cookieDomain = decodeURIComponent(value)
          const port = window.location.port
          if (port && port !== '80' && port !== '443') {
            return `${cookieDomain}:${port}`
          }
          return cookieDomain
        }
      }
    } catch {
      // Ignore cookie parsing errors
    }
  }
  return null
}

/**
 * Build a URL for a given org's path.
 *
 * Returns a RELATIVE path whenever navigation stays on the current origin —
 * which is always the case in single tenancy and almost always in multi
 * tenancy (the user is already on the right subdomain or custom domain).
 * Only when crossing subdomains in multi tenancy do we build an absolute
 * URL.
 *
 * This is intentional: relative paths are robust against tenancy
 * misconfiguration. A stale env var or legacy cookie can no longer cause
 * the menu to forge a non-existent subdomain like `default.localhost:3000`.
 */
export const getUriWithOrg = (orgslug: string, path: string) => {
  // Final SPA semantics: every org-scoped URL lives under /orgs/{slug}.
  // There is no host-based tenancy in a single-page app, so the URL always
  // carries the org segment.
  if (!orgslug) {
    return path
  }
  return `/orgs/${orgslug}${path}`
}

/**
 * Same as `getUriWithOrg`, but always returns an absolute URL for links that
 * are shared outside the app (invites, emails, ...).
 */

export const getAbsoluteUriWithOrg = (orgslug: string, path: string) => {
  const uri = getUriWithOrg(orgslug, path)

  // Already absolute (crossing subdomains, or server-side with a known domain)
  if (/^https?:\/\//i.test(uri)) {
    return uri
  }

  // Client-side: the dashboard is served from the org's own host, so the
  // current origin is the correct one for the shared link.
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${uri}`
  }

  // Server-side fallback
  const explicitDomain = getConfig('VITE_APP_DOMAIN')
  if (explicitDomain) {
    const protocol = getAPP_HTTP_PROTOCOL()
    return `${protocol}${explicitDomain}${uri}`
  }
  return uri
}

export const getUriWithoutOrg = (path: string) => {
  // Client-side: always use current origin
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`
  }

  // Server-side fallback
  const explicitDomain = getConfig('VITE_APP_DOMAIN')
  if (explicitDomain) {
    const protocol = getAPP_HTTP_PROTOCOL()
    return `${protocol}${explicitDomain}${path}`
  }
  // No explicit domain configured: return relative path to avoid hardcoded 'localhost' URLs
  return path
}

/**
 * Build a URI on the main domain (not the org subdomain).
 * Useful for OAuth redirect URIs where only one fixed URI can be registered
 * (e.g., Stripe Connect requires exact redirect_uri matching).
 */
export const getMainDomainUri = (path: string) => {
  const protocol = getAPP_HTTP_PROTOCOL()
  const domain = getAPP_DOMAIN()
  return `${protocol}${domain}${path}`
}

export type DeploymentMode = 'saas' | 'oss' | 'ee'

/**
 * Get the current deployment mode from the app_mode cookie set by middleware.
 * Single source of truth for mode detection on the frontend.
 * Defaults to 'oss' when cookie is absent (safe fallback — blocks EE features).
 */
export const getDeploymentMode = (): DeploymentMode => {
  return (getCookieValue('app_mode') as DeploymentMode) || 'oss'
}

/**
 * OSS mode — thin wrapper over getDeploymentMode() for backward compatibility.
 */
export const isOSSMode = (): boolean => {
  return getDeploymentMode() === 'oss'
}

/**
 * EE (Enterprise Edition) availability — thin wrapper over getDeploymentMode() for backward compatibility.
 */
export const isEEAvailable = (): boolean => {
  return getDeploymentMode() === 'ee'
}

// Collaboration server WebSocket URL
export const getCollabUrl = () => getConfig('VITE_COLLAB_URL', 'ws://localhost:4000')

export const getDefaultOrg = () => {
  // 1. Env var (backward compat)
  const envVal = getConfig('VITE_APP_DEFAULT_ORG')
  if (envVal) return envVal
  // 2. Client-side: read cookie set by middleware
  const cookieVal = getCookieValue('app_default_org')
  if (cookieVal) return cookieVal
  // 3. Default
  return 'default'
}




