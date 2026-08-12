# Aksha Farm — Poultry Management System

A simple, modern web application built for **Aksha Farm** to manage daily poultry operations, track bird batches, monitor feed & vaccinations, log sales, and view profits.

---

## Key Features

- **Flock & Batch Management**: Track Broiler and Layer batches, live bird counts, and daily mortality logs.
- **Egg Production**: Log daily egg collections, damaged eggs, and calculate sellable net yield.
- **Feed Inventory**: Track feed stock purchases, vendor logs, and daily batch consumption.
- **Health & Vaccination**: Schedule upcoming vaccines, track diseases, and record medicine expenses.
- **Sales & Invoices**: Manage bird and egg sales, generate customer invoices, and track payment status.
- **Expense & Profit Tracking**: Automatically categorize farm expenses and monitor Profit & Loss (P&L).
- **Reports**: View farm operational summaries and export audit reports.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Database**: Supabase (PostgreSQL)

---

## How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
Copy the contents of [`schema.sql`](file:///d:/Github_Proj/Poloitary_Farming/schema.sql) into your Supabase SQL Editor and run it to set up the database tables.

### 4. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## License
Created for Aksha Farm.
