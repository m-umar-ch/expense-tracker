import { authComponent } from ".";
import { query } from "../_generated/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    try {
      return await authComponent.getAuthUser(ctx);
    } catch (error) {
      // Return null if user is not authenticated instead of throwing
      if (error instanceof Error && error.message.includes("Unauthenticated")) {
        return null;
      }
      // Re-throw other errors
      throw error;
    }
  },
});
