import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {
  Authenticated,
  Unauthenticated,
  useQuery,
  useMutation,
} from "convex/react";
import { api } from "../convex/_generated/api";
import { ExpenseDashboard } from "./components/expense";
import { useEffect } from "react";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";

import Homepage from "./components/homepage/Homepage";
import AuthPage from "./components/auth/AuthPage";
import { RouteErrorFallback } from "./components/shared/RouteErrorFallback";

// Component that only renders for authenticated users
function DashboardWrapper() {
  const loggedInUser = useQuery(api.users.currentUser);
  const initializeCategories = useMutation(
    api.functions.categories.initializeDefaultCategories,
  );
  const initializedRef = React.useRef(false);

  useEffect(() => {
    if (loggedInUser && !initializedRef.current) {
      initializeCategories();
      initializedRef.current = true;
    }
  }, [loggedInUser, initializeCategories]);

  // Show loading spinner while checking auth
  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  // If user is null (not authenticated), this won't render due to the Authenticated wrapper
  // But we add this check for safety
  if (!loggedInUser) {
    return null;
  }

  return <ExpenseDashboard />;
}

// Simple wrapper for protected routes with proper auth handling
function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Authenticated>{children}</Authenticated>
      <Unauthenticated>
        <AuthPage />
      </Unauthenticated>
    </>
  );
}

// Router configuration
const router = createBrowserRouter(
  [
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
          <DashboardWrapper />
        </AuthenticatedRoute>
      ),
    },
    // Catch all route - redirect to homepage
    {
      path: "*",
      element: <Homepage />,
    },
  ],
  {
    future: {
      v7_normalizeFormMethod: true,
    },
    hydrationData: undefined,
  },
);

const routesWithFallback = router.routes.map((route) => ({
  ...route,
  errorElement: <RouteErrorFallback />,
}));

const finalRouter = createBrowserRouter(routesWithFallback);

export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={finalRouter} />
    </ErrorBoundary>
  );
}
