# Convex Backend Organization

This directory contains the organized Convex backend functions and utilities for the Brutalist Expense Tracker.

## 📁 Directory Structure

```
convex/
├── 📁 auth/                    # Authentication & Authorization
│   ├── index.ts               # Main auth functions & Better Auth setup
│   └── config.ts              # Auth configuration
│
├── 📁 functions/              # Business Logic Functions
│   ├── expenses.ts            # Expense CRUD operations
│   └── categories.ts          # Category management
│
├── 📁 lib/                    # Utilities & Shared Code
│   ├── envUtils.ts            # Environment variable utilities
│   └── env.d.ts               # TypeScript environment definitions
│
├── 📁 types/                  # TypeScript Type Definitions (future)
│   └── (add custom types here as needed)
│
├── 📁 _generated/             # Auto-generated Convex files
│   ├── api.d.ts
│   ├── api.js
│   ├── dataModel.d.ts
│   ├── server.d.ts
│   └── server.js
│
├── convex.config.ts           # Convex configuration with Better Auth
├── schema.ts                  # Database schema definitions
├── index.ts                   # Re-export all functions for easy imports
├── http.ts                    # HTTP endpoints
├── router.ts                  # API router (if used)
└── tsconfig.json              # TypeScript configuration
```

## 🎯 Import Patterns

### From Frontend (React Components)

```typescript
// Clean imports using the organized API structure
import { api } from "@/lib/convex";

// Use the organized function paths
const expenses = useQuery(api.functions.expenses.listExpenses);
const user = useQuery(api.auth.index.getCurrentUser);
const categories = useQuery(api.functions.categories.listCategories);
```

### Between Convex Functions

```typescript
// Import from organized subfolders
import { authComponent } from "../auth";
import { env } from "../lib/envUtils";
```

## 🔧 Environment Variables

Environment variables are now organized with full TypeScript support:

```typescript
// All these have autocomplete and validation!
import { env } from "./lib/envUtils";

const siteUrl = env.siteUrl; // Required, validated
const hasOAuth = env.hasGoogleOAuth; // Boolean helper
const apiKey = env.openaiApiKey; // Optional
```

Set variables using: `npx convex env set VARIABLE_NAME "value"`

## 📋 Function Categories

### 🔐 Authentication (`auth/`)

- User authentication with Better Auth
- Google OAuth integration
- Session management
- User profile queries

### 💰 Expenses (`functions/expenses.ts`)

- `listExpenses` - Get user's expenses with filtering
- `createExpense` - Add new expense
- `updateExpense` - Modify existing expense
- `deleteExpense` - Remove expense
- `getCategorySpending` - Spending analytics
- `generateUploadUrl` - Receipt file uploads

### 🏷️ Categories (`functions/categories.ts`)

- `listCategories` - Get user's categories
- `createCategory` - Add new category
- `updateCategory` - Modify category
- `deleteCategory` - Remove category
- `initializeDefaultCategories` - Setup default categories

### 🛠️ Utilities (`lib/`)

- Environment variable management with autocomplete
- Type definitions for development experience
- Shared utility functions

## 🚀 Benefits of This Organization

1. **🎯 Clear Separation**: Auth, business logic, and utilities are separated
2. **📦 Easy Imports**: Clean import paths with re-exports
3. **🔍 Discoverability**: Functions are logically grouped
4. **🛡️ Type Safety**: Full TypeScript support with autocomplete
5. **📈 Scalability**: Easy to add new function categories
6. **🔧 Maintainability**: Clear responsibility boundaries

## 💡 Adding New Functions

### Add a new business domain:

1. Create `functions/newDomain.ts`
2. Add exports to `index.ts`
3. Update this README

### Add utilities:

1. Add to `lib/` folder
2. Export from `lib/index.ts` (if created)
3. Import where needed

### Add types:

1. Create `types/domainTypes.ts`
2. Export from `index.ts`
3. Use across functions

This organization follows Convex best practices while providing excellent developer experience with TypeScript autocomplete and clear code organization.
