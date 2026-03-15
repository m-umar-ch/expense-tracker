# ExpenseTrack - Comprehensive Feature List

## 💰 Core Financial Management
- **Expense & Income Tracking**: Comprehensive logging for both money spent and money earned.
- **Categorization**: Create default or custom categories. Categories can be split between income and expense. Color-code categories for quick visual recognition.
- **Budget Control**: Set and track monthly spending limits per category with real-time percentage and amount-used trackers.
- **Receipt Storage**: Attach and store receipt images or PDFs directly to transactions using Convex Storage.

## 📊 Analytics & Interactive Dashboard
- **Time Filtering**: Slice your financial data intelligently by Day, Week, Month, 3 Months, 6 Months, Year, or All Time.
- **Visual Insights**: See the percentage of total spend for each category, highlighting your largest financial impacts.
- **Real-Time Statistics**: Dynamic breakdown of total expenses, total incomes, and budget health.
- **Data Export**: Export your current time period's data safely as **CSV** (for Excel/Google Sheets) or native **JSON** (for backups/development). Includes category mapping for both expenses and incomes.

## ⚙️ Advanced User Settings
- **Currency System**:
  - Switch between major global base currencies (USD, EUR, GBP, JPY, CAD, AUD, INR, PKR, CNY, etc.).
  - Edit or completely customize the symbol for the active base currency with a single click.
  - Reset back to default symbols natively.
- **Global Localization**: Set preferred language and date formats (`MM/DD/YYYY`, `DD/MM/YYYY`, `YYYY-MM-DD`).
- **Privacy Mode (No-Bullshit Mode)**: A toggleable switch designed to instantly blur all sensitive financial amounts across the app. Perfect for using the app in public spaces, cafes, or during screenshares.
- **Extensive Theme Engine**: Persistent theme selector supporting intelligent System themes alongside Light, Dark, and stylized themes (Amber, Clay, Modern, Neon, Midnight, etc).

## 🔐 Security & Reliability
- **Authentication**: Official Convex Auth (Email/Password registration and seamless login).
- **Clean Error Handling**: Detailed, safe generic error messages preventing data or structure leaks (e.g. "Invalid email or password").
- **Guest Access**: Temporary account generation ready.
- **Data Integrity**: Fully indexed database lookups resulting in rapid sub-millisecond querying over large transaction datasets. 
- **Type Safety**: Rock-solid, end-to-end type safety from the Convex database layer all the way to the frontend React components via TypeScript.
