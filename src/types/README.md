# Frontend Type System

## Type Definitions for the Brutalist Expense Tracker

This file contains TypeScript type definitions that mirror the backend Convex types but are designed for frontend use.

### 🔧 Type Architecture

#### **ConvexId<T>**

A frontend-specific ID type that's compatible with Convex backend IDs but doesn't require importing Convex types:

```typescript
export type ConvexId<TableName extends string> = string & {
  __tableName: TableName;
};
```

#### **Core Domain Types**

**Category:**

- Represents spending categories (Food, Transport, etc.)
- Includes budget limits and color coding
- Links to user accounts

**Expense:**

- Individual expense records
- Links to categories and users
- Supports receipt attachments
- Includes computed fields (receiptUrl, category)

**CategorySpending:**

- Analytics type for spending summaries
- Includes budget utilization calculations
- Percentage breakdowns

#### **Utility Types**

**TimePeriod:**

- Enum for filtering expenses by time ranges
- Supports weekly, monthly, quarterly, yearly, and all-time views

### 🎯 Benefits of This Approach

1. **🛡️ Independence**: Frontend types don't depend on Convex internals
2. **🔄 Compatibility**: Types are designed to be compatible with backend responses
3. **📦 Self-Contained**: No complex import paths or module resolution issues
4. **🎯 Frontend-Focused**: Includes computed fields like `receiptUrl` and populated `category`
5. **🔧 Maintainable**: Easy to update when backend changes

### 🔄 Type Compatibility

The frontend types are designed to be structurally compatible with Convex backend types:

- `ConvexId<"expenses">` ↔ `Id<"expenses">` (from Convex)
- Frontend interfaces match backend document shapes
- Additional computed fields are marked as optional

### 💡 Usage Examples

```typescript
import type { Expense, Category, CategorySpending } from "./expense";

// Type-safe expense handling
const handleExpense = (expense: Expense) => {
  console.log(`Expense ${expense.name}: $${expense.amount}`);
  if (expense.category) {
    console.log(`Category: ${expense.category.name}`);
  }
};

// Type-safe category operations
const createCategory = (name: string, color: string): Partial<Category> => ({
  name,
  color,
  isDefault: false,
});
```

### 🚀 Future Enhancements

As the application grows, this type system can be extended with:

- **Union types** for different expense states
- **Branded types** for enhanced type safety
- **Utility types** for form handling and validation
- **Computed types** for complex business logic

This approach ensures type safety while maintaining clean separation between frontend and backend concerns.
