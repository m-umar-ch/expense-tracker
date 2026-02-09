/**
 * Convex Environment Variables Type Definitions
 *
 * This file provides TypeScript autocomplete and type safety for environment variables
 * used in Convex functions. These variables are set using `npx convex env set`.
 *
 * Usage:
 * - Set variables: npx convex env set VARIABLE_NAME "value"
 * - Access in functions: process.env.VARIABLE_NAME (with autocomplete!)
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // ===== AUTHENTICATION =====

      /**
       * Better Auth secret key for signing tokens
       * Set via: npx convex env set BETTER_AUTH_SECRET "your-secret-key"
       */
      BETTER_AUTH_SECRET: string;

      /**
       * JWT private key for token signing
       * Set via: npx convex env set JWT_PRIVATE_KEY "-----BEGIN PRIVATE KEY----- ..."
       */
      JWT_PRIVATE_KEY: string;

      /**
       * JSON Web Key Set for token verification
       * Set via: npx convex env set JWKS '{"keys":[...]}'
       */
      JWKS: string;

      // ===== GOOGLE OAUTH =====

      /**
       * Google OAuth Client ID for social authentication
       * Set via: npx convex env set GOOGLE_CLIENT_ID "your-google-client-id"
       */
      GOOGLE_CLIENT_ID: string;

      /**
       * Google OAuth Client Secret for social authentication
       * Set via: npx convex env set GOOGLE_CLIENT_SECRET "your-google-client-secret"
       */
      GOOGLE_CLIENT_SECRET: string;

      // ===== APPLICATION CONFIGURATION =====

      /**
       * Site URL for CORS and redirects (development/production)
       * Set via: npx convex env set SITE_URL "http://localhost:5173"
       */
      SITE_URL: string;

      // ===== EXTERNAL INTEGRATIONS =====

      /**
       * OpenAI API Key for AI features (if using)
       * Set via: npx convex env set CONVEX_OPENAI_API_KEY "your-openai-key"
       */
      CONVEX_OPENAI_API_KEY?: string;

      /**
       * OpenAI Base URL for proxy/custom endpoint (if using)
       * Set via: npx convex env set CONVEX_OPENAI_BASE_URL "https://your-proxy-url"
       */
      CONVEX_OPENAI_BASE_URL?: string;

      // ===== FUTURE ENVIRONMENT VARIABLES =====
      // Add new environment variables here as your app grows

      /**
       * Email service API key (future use)
       * Set via: npx convex env set EMAIL_API_KEY "your-email-service-key"
       */
      EMAIL_API_KEY?: string;

      /**
       * File storage service configuration (future use)
       * Set via: npx convex env set STORAGE_SERVICE_CONFIG "your-config"
       */
      STORAGE_SERVICE_CONFIG?: string;

      /**
       * Analytics service configuration (future use)
       * Set via: npx convex env set ANALYTICS_CONFIG "your-analytics-config"
       */
      ANALYTICS_CONFIG?: string;
    }
  }
}

// This export is required to make this a module file
export {};
