import {
  Authenticated,
  Unauthenticated,
  useQuery,
  useMutation,
} from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm, SignOutButton } from "./components/auth";
import { Toaster } from "sonner";
import { ExpenseTracker } from "./components/expense";
import { useEffect } from "react";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-10 bg-background border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  ₨
                </span>
              </div>
              <h1 className="text-xl font-semibold text-foreground">
                Expense Tracker
              </h1>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const initializeCategories = useMutation(
    api.categories.initializeDefaultCategories,
  );

  useEffect(() => {
    if (loggedInUser) {
      initializeCategories();
    }
  }, [loggedInUser, initializeCategories]);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Authenticated>
        <ExpenseTracker />
      </Authenticated>
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center p-4">
          <SignInForm />
        </div>
      </Unauthenticated>
    </div>
  );
}
