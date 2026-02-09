/**
 * Convex Environment Variables Utilities
 *
 * This module provides type-safe access to environment variables with validation
 * and helpful error messages for development.
 */

/**
 * Gets a required environment variable with type safety
 * Throws a descriptive error if the variable is not set
 */
export function getRequiredEnv(key: keyof NodeJS.ProcessEnv): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
        `Set it using: npx convex env set ${key} "your-value"`,
    );
  }
  return value;
}

/**
 * Gets an optional environment variable with fallback
 */
export function getOptionalEnv(
  key: keyof NodeJS.ProcessEnv,
  fallback: string = "",
): string {
  return process.env[key] || fallback;
}

/**
 * Gets a boolean environment variable (true/false)
 * Accepts: "true", "1", "yes", "on" as truthy values
 */
export function getBooleanEnv(
  key: keyof NodeJS.ProcessEnv,
  fallback: boolean = false,
): boolean {
  const value = process.env[key]?.toLowerCase();
  if (!value) return fallback;
  return ["true", "1", "yes", "on"].includes(value);
}

/**
 * Gets a numeric environment variable
 */
export function getNumberEnv(
  key: keyof NodeJS.ProcessEnv,
  fallback: number = 0,
): number {
  const value = process.env[key];
  if (!value) return fallback;
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    throw new Error(
      `Environment variable ${key} is not a valid number: ${value}`,
    );
  }
  return num;
}

/**
 * Validates that all required environment variables are set
 * Call this at the start of your auth functions to ensure proper configuration
 */
export function validateAuthEnvironment(): void {
  const requiredVars: Array<keyof NodeJS.ProcessEnv> = [
    "BETTER_AUTH_SECRET",
    "SITE_URL",
    "JWT_PRIVATE_KEY",
    "JWKS",
  ];

  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for authentication:\n` +
        missing.map((key) => `  - ${key}`).join("\n") +
        "\n\n" +
        "Set them using:\n" +
        missing
          .map((key) => `  npx convex env set ${key} "your-value"`)
          .join("\n"),
    );
  }
}

/**
 * Pre-defined environment variable getters with validation
 */
export const env = {
  // Required variables
  get siteUrl() {
    return getRequiredEnv("SITE_URL");
  },
  get betterAuthSecret() {
    return getRequiredEnv("BETTER_AUTH_SECRET");
  },
  get jwtPrivateKey() {
    return getRequiredEnv("JWT_PRIVATE_KEY");
  },
  get jwks() {
    return getRequiredEnv("JWKS");
  },

  // Optional variables (for OAuth)
  get googleClientId() {
    return getOptionalEnv("GOOGLE_CLIENT_ID");
  },
  get googleClientSecret() {
    return getOptionalEnv("GOOGLE_CLIENT_SECRET");
  },

  // Optional integrations
  get openaiApiKey() {
    return getOptionalEnv("CONVEX_OPENAI_API_KEY");
  },
  get openaiBaseUrl() {
    return getOptionalEnv("CONVEX_OPENAI_BASE_URL");
  },

  // Helper to check if Google OAuth is configured
  get hasGoogleOAuth() {
    return !!(this.googleClientId && this.googleClientSecret);
  },

  // Helper to check if OpenAI is configured
  get hasOpenAI() {
    return !!this.openaiApiKey;
  },
} as const;

/**
 * Type-safe environment variable names for autocomplete
 */
export type EnvVarName = keyof NodeJS.ProcessEnv;
