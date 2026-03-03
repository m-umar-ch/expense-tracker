# Current Issues & Bugs Audit

This document outlines the technical debt, potential bugs, and performance bottlenecks identified in the current codebase (Convex + Vite + React).

## 1. Backend (Convex)

### 🔴 N+1 Query in `listExpenses`

In `convex/functions/expenses.ts`, the `listExpenses` query maps over the filtered expenses and calls `ctx.db.get(expense.categoryId)` for each one (lines 34-47).

- **Impact**: Increased latency and redundant database reads.
- **Fix**: Fetch all user categories once and use a Map for lookups, or use a join-like pattern.

### 🟡 Memory-Only Sorting & Filtering

The `listExpenses` query fetches all expenses for a date range and then performs `.sort()` in memory (line 49).

- **Impact**: Scaleability issue. As the number of transactions grows, this will consume more memory and CPU on the Convex function execution.
- **Fix**: Utilize Convex's `.order("desc")` and index-based range queries more effectively.

### 🟡 Idempotent but Redundant Mutation Call

In `src/App.tsx`, `initializeCategories()` is called inside a `useEffect` on every render if a user is logged in (lines 27-31).

- **Impact**: Unnecessary network request on every page load/refresh.
- **Fix**: Call this only once after login or check if categories already exist before calling.

## 2. Frontend (React)

### 🔴 Inefficient Analytics Calculation ($O(N \times E)$)

In `src/components/expense/BrutalistExpenseTracker.tsx`, the `categorySpending` Map operation (line 161) contains a `.reduce()` over ALL `filteredExpenses` (line 163).

- **Impact**: For $N$ categories and $E$ expenses, this is an $O(N \times E)$ operation. With 20 categories and 1000 expenses, this is 20,000 iterations every render.
- **Fix**: Calculate the total once before mapping over categories.

### 🔴 Unused Library Power (TanStack)

`package.json` includes `@tanstack/react-table` and `@tanstack/react-form`, yet:

- `ExpenseList.tsx` uses custom manual sorting, filtering, and pagination implementation.
- `ExpenseForm.tsx` uses manual `useState` for form fields.
- **Impact**: Higher maintenance burden and missing out on advanced features like debounced filtering, accessible form validation, and robust type safety.

### 🟡 Localized Formatting Inconsistency

The `SettingsModal` allows selecting a language, but:

- `ExpenseList.tsx` hardcodes `en-US` for `formatDate` and `formatTime` (lines 58, 66).
- `formatCurrency` in `src/utils/currency.ts` is used, but doesn't seem to fully integrate with the user's language setting for locale-specific separators.

### 🟡 Inconsistent UI Patterns

- `ExpenseForm.tsx` uses the Radix `Dialog` component.
- `SettingsModal.tsx` uses a custom `fixed inset-0` div overlay.
- **Impact**: Inconsistent transition animations, keyboard nav, and "click outside to close" behavior.

## 3. Dependencies & Config

### 🔴 Redundant Dependencies

- `@convex-dev/auth`: App has migrated to `Better Auth`, making this legacy package unnecessary.
- `next-themes`: The project uses a custom `ThemeProvider` with CSS variable injection; `next-themes` is likely unused.
- **Conflicting Libraries**: Both `react-hook-form` and `@tanstack/react-form` are present. Choosing one is better for bundle size and consistency.

### 🟡 Date Management Redundancy

Date range calculation logic is duplicated or reinvented in `BrutalistExpenseTracker.tsx`. Centralizing this into a utility would prevent "off-by-one" errors in date filtering between periods.
