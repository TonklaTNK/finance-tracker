# Personal Finance Tracker

A full-stack personal finance management application for tracking income, expenses, and transfers across multiple accounts with real-time balance calculation and data visualization.

## Tech Stack

- **Frontend:** React (Vite) · Tailwind CSS v4 · Recharts · Lucide React
- **Backend:** Go (net/http) · pgx
- **Database:** PostgreSQL

## Features

- **Transaction Management** — Add, edit, and delete income, expense, and transfer transactions
- **Multi-Account Support** — Track balances across multiple accounts (cash, bank, credit card)
- **Transfer Between Accounts** — Transfer funds between accounts with automatic balance updates
- **Balance Per Account** — Real-time balance calculation per account using conditional SQL aggregation (UNION ALL + subquery)
- **Monthly Summary Chart** — Bar chart comparing income vs expenses by month (Recharts)
- **Dynamic Filters** — Filter transactions by type, account, and month with server-side filtering
- **Pagination** — Server-side pagination with dynamic page count
- **Dark / Light Mode** — Theme toggle with localStorage persistence
- **Form Validation** — Inline error messages with per-field validation
- **Loading & Error States** — Spinner, empty state, and error handling for all API calls
- **Double Submit Prevention** — Button disable during API calls to prevent duplicate entries

## Getting Started

### Prerequisites

- Go 1.21+
- Node.js 18+
- PostgreSQL 15+

### Database Setup

```sql
-- Create database
CREATE DATABASE finance_tracker;

-- Run schema
psql -d finance_tracker -f db/schema.sql
```

### Backend

```bash
cd finance-api
go run main.go
# Server runs on http://localhost:8080
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

## Project Structure

```
finance-tracker/
├── finance-api/          # Go backend
│   └── main.go           # API handlers + routing
├── frontend/             # React frontend
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── AccountBalance.jsx
│           ├── SummaryCard.jsx
│           ├── SummaryChart.jsx
│           ├── ThemeToggle.jsx
│           ├── TransactionForm.jsx
│           └── TransactionList.jsx
├── db/
│   └── schema.sql        # Database schema
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /transactions | List transactions (with pagination & filters) |
| POST | /transactions | Create transaction |
| PUT | /transactions/{id} | Update transaction |
| DELETE | /transactions/{id} | Delete transaction |
| GET | /categories | List categories |
| GET | /accounts | List accounts |
| GET | /months | List available months |
| GET | /summary | Monthly income/expense summary |
| GET | /accounts/balance | Balance per account |

## Planned Features

- Budget tracking per category
- React Query for data fetching
