/**
 * Environment configuration
 * Uses Vite's import.meta.env for type-safe environment variable access
 */

const env = {
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT,
  CONVEX_URL: import.meta.env.VITE_CONVEX_URL,
} as const;

export default env;
