# ExpenseTrack - Application Documentation

## 📑 Overview

ExpenseTrack is a high-performance, production-ready personal finance management system. It features a unique dual-design philosophy: a **stark Brutalist landing page** coupled with a **premium, clean Shadcn UI dashboard** for highly functional data management.

---

## 🏗 System Architecture

### 1. Technology Stack

- **Frontend**: React 19 (Vite), TypeScript, React Router 7.
- **Styling**: Tailwind CSS v4, Shadcn UI (Clean Dashboard), Custom CSS (Brutalist Homepage).
- **Backend**: Convex (Real-time Database, Serverless Functions, Storage).
- **Authentication**: Official Convex Auth (`@convex-dev/auth`).
- **Form Management**: TanStack Form + Zod validation.
- **Notifications**: Sonner (Rich Toast Notifications).

### 2. Authentication Flow

We use the **Official Convex Auth** system with the `Password` provider.

- **Backend Logic**: Handled in `convex/auth.ts`.
- **User Profiles**: Automatically managed in the `users` table via `convex/users.ts`.
- **Session Management**: Secure, HTTP-only cookie-based sessions handled natively by Convex.
- **Guest Access**: Temporary accounts generated for trial users.

### 3. Data Architecture (Convex Schema)

- **Users**: Managed by Convex Auth (Email, Password hash, Name).
- **Categories**: Linked to `userId`. Includes `name`, `color`, and `budgetLimit`.
- **Expenses**: Core transactional data. Linked to `userId` and `categoryId`. Supports `receiptImageId` (pointing to Convex Storage).

---

## 🎨 Design Philosophy

### 1. The Brutalist Homepage (`/`)

- **Aesthetic**: Industrial, high-contrast, aggressive.
- **Colors**: Pure Black (`#000000`), Stark White (`#FFFFFF`), Danger Red (`#EF4444`).
- **Typography**: All-caps, Bold Monospace.
- **Elements**: Thick 4px borders, sharp edges, geometric noise backgrounds.

### 2. The Functional Dashboard (`/dashboard`)

- **Aesthetic**: Premium, Clean, Modern (Shadcn UI).
- **Colors**: Standard Shadcn palette (Muted backgrounds, subtle borders).
- **Typography**: Clean Sans-serif (Inter/Geist).
- **Elements**: Card-based layouts, accessible tables, smooth progress indicators for budgets.

---

## 🚀 Key Features

### 💰 Financial Management

- **Expense Tracking**: Full CRUD operations for daily transactions.
- **Category System**: Initialize default categories or create custom ones with color-coding.
- **Budget Control**: Set monthly spending limits per category with real-time utilization tracking.
- **Receipt Storage**: Upload images/PDFs directly to Convex Storage for auditing.

### 📊 Analytics & Insights

- **Time Filtering**: View data by Day, Week, Month, 3 Months, 6 Months, or Year.
- **Spending Highlights**: Automatic calculation of percentage-of-total and impact ratings.
- **Real-time Stats**: Instant breakdown of total spend, budget health, and transaction frequency.

### ⚙️ User Settings

- **Multi-Currency**: Support for 10+ major global currencies with proper localization.
- **Compact Formatting**: Option for abbreviated currency views (e.g., $1.2k).
- **Theme Engine**: Persistence of user preferences (Brutalist landing, Dark/Light dashboard).

---

## 🛡 Reliability & Security

- **Error Handling**: Global `ErrorBoundary` for unexpected crashes and a custom `RouteErrorFallback` for navigation-level errors.
- **Data Integrity**: Indexed database queries ensuring O(1) or O(log N) performance for transaction lookups.
- **Type Safety**: End-to-end TypeScript types extending from the Convex schema to the React components.

---

## 📁 Directory Structure

- `convex/`: Backend functions, schema, and authentication logic.
  - `functions/`: Modularized database operations (Expenses, Categories).
- `src/components/`:
  - `homepage/`: Modular Brutalist landing page components.
  - `expense/`: Core dashboard and transaction components.
  - `ui/`: Shared Shadcn and custom UI primitives.
- `src/contexts/`: Application-wide state (Settings, Currency).
- `src/types/`: Centralized TypeScript interfaces.

---

## 🛠 Developer Guide

- **Dev Mode**: `npm run dev` (Starts Vite and Convex in parallel).
- **Build**: `npm run build` (Type-checks and compiles production bundle).
- **Auth Setup**: Requires `JWT_PRIVATE_KEY` and `JWKS` in Convex environment variables.
