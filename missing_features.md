# Missing Features & Future Roadmap

This document outlines high-value features missing from the current implementation that would significantly improve the user experience and utility of the application.

## 1. Advanced Analytics & Insights

The current "Analytics" tab is a static breakdown. To be a "Production-ready" tool, it needs:

- **Monthly Trend Charts**: Visualizing spending over time (line or bar charts) to see if spending is increasing or decreasing.
- **Period Comparisons**: "Your spending is 12% higher than last month" or "You saved $300 more this month".
- **Average Daily Spending**: A key metric for personal finance awareness.
- **Spending Heatmap**: Identifying which days of the week or times of day are "expensive".
- **Budget Projections**: An "AI" or algorithmic prediction: "Based on current spending, you will exceed your Food budget by the 20th."

## 2. Financial Management Core

- **Income Tracking**: Currently, the app only tracks "Outflow". Adding "Inflow" allow calculating **Savings Rate** and **Net Balance**.
- **Recurring Transactions**: Automatically log or notify for monthly subscriptions (Netflix, Rent, Insurance).
- **Multiple Wallets/Accounts**: Support for "Cash", "Bank", "Credit Card" to track where the money actually is.
- **Tagging System**: Categories are high-level. Tags (e.g., `#vacation`, `#work-expense`) allow for cross-category tracking.

## 3. Automation & Experience (Brutalist Style)

- **OCR Receipt Scanning**: Use AI to extract Amount, Date, and Category from uploaded receipt photos automatically.
- **Global Search**: A dedicated search page or command palette (`Cmd+K`) to find any historical transaction instantly.
- **Privacy Mode**: A "No Bullshit" toggle to blur all currency amounts for use in public places.
- **CSV/Bank Import**: While Export exists, the ability to import data from banks (via CSV or Plaid integration) is crucial for power users.
- **Keyboard Shortcuts**: In a "Brutalist/Industrial" app, being able to log an expense via keyboard only (e.g., `n` for new expense) fits the aesthetic perfectly.

## 4. Technical Roadmap

- **Progressive Web App (PWA)**: Allow users to "Install" the app on their phone for quick access on the go.
- **Desktop Notifications**: Budget alerts ("SYSTEM ALERT: 90% BUDGET REACHED").
- **Theme Builder**: Let users define their own "Industrial" color schemes.
- **Multi-currency Live Conversion**: If a user logs an expense in EUR while their system is USD, use an API (like ExchangeRate-API) to suggest the converted amount.
- **Offline Mode**: Using Convex's optimistic updates and local state to allow logging expenses without an internet connection.
