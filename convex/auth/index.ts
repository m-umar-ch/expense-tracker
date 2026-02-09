import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { components } from "../_generated/api";
import { DataModel } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import { env, validateAuthEnvironment } from "../lib/envUtils";
import authConfig from "../auth.config";

// Validate environment variables on module load
validateAuthEnvironment();

// Get site URL from Convex environment variables (with autocomplete!)
const siteUrl = env.siteUrl;

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    trustedOrigins: [siteUrl],
    database: authComponent.adapter(ctx),
    // baseURL: ,
    // Configure simple, non-verified email/password to get started
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      // The cross domain plugin is required for client side frameworks
      crossDomain({ siteUrl }),
      // The Convex plugin is required for Convex compatibility
      convex({ authConfig }),
    ],
    socialProviders: env.hasGoogleOAuth
      ? {
          google: {
            clientId: env.googleClientId,
            clientSecret: env.googleClientSecret,
            prompt: "select_account",
            redirectURI: `${siteUrl}/api/auth/callback/google`,
          },
        }
      : {},
  });
};
