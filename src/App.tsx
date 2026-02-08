import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {
  Authenticated,
  Unauthenticated,
  useQuery,
  useMutation,
} from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm, SignOutButton } from "./components/auth";
import { Toaster } from "sonner";
import { BrutalistExpenseTracker } from "./components/expense/BrutalistExpenseTracker";
import { useEffect } from "react";

// Import components
import Homepage from "./components/Homepage";
import AuthPage from "./components/AuthPage";

// Simple wrapper for authenticated routes
function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  const loggedInUser = useQuery(api.auth.getCurrentUser);
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
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <>
      <Authenticated>{children}</Authenticated>
      <Unauthenticated>
        <AuthPage />
      </Unauthenticated>
      <Toaster richColors />
    </>
  );
}

// Router configuration
const router = createBrowserRouter([
  // Homepage (unauthenticated)
  {
    path: "/",
    element: <Homepage />,
  },
  // Auth page
  {
    path: "/auth",
    element: <AuthPage />,
  },
  // Main app route (authenticated dashboard)
  {
    path: "/dashboard",
    element: (
      <AuthenticatedRoute>
        <BrutalistExpenseTracker />
      </AuthenticatedRoute>
    ),
  },
  // Catch all route - redirect to homepage
  {
    path: "*",
    element: <Homepage />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
