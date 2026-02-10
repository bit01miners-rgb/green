# Green Funds - Fixes & Setup Guide

This document outlines the fixes applied to resolve the "Internal Server Error" and registration issues, as well as instructions to set up the database and run the application.

## 1. Database Configuration (Crucial Step)

The primary cause of the errors was a missing or unconfigured database connection. The application requires a running PostgreSQL database.

### Steps:
1.  **Ensure PostgreSQL is installed and running.**
    If you don't have it, install it from [postgresql.org](https://www.postgresql.org/download/).
2.  **Create a database** named `greenfunds` (or update `.env` to match your existing DB).
    ```sql
    CREATE DATABASE greenfunds;
    ```
3.  **Update `.env` file**:
    Edit the `.env` file in the root directory. Ensure `DATABASE_URL` is correct.
    Example for local Postgres:
    ```env
    DATABASE_URL=postgres://postgres:yourpassword@localhost:5432/greenfunds
    ```
    Replace `yourpassword` with your actual Postgres password.

## 2. Running Migrations

Once the database is running and `.env` is set, you **must** push the schema to the database.

Run the following command in the terminal:
```bash
npm run db:push
```
This uses `drizzle-kit` to create the necessary tables (`users`, `accounts`, etc.).

## 3. Improvements Made

*   **Server Stability**: proper error handling added to `server/db.ts` and `server/index.ts`. The server now checks regarding database connection on startup and logs clear errors instead of crashing obscurely.
*   **Wallet Integration**: Added a "Connect Wallet" feature using MetaMask/Ethers.js in the DeFi section.
*   **DeFi Dashboard**: Implemented a functional DeFi dashboard showing crypto prices and yield opportunities.
*   **Dashboard Improvements**: The main dashboard now fetches real Net Worth from your accounts instead of using only mock data.

## 4. Automatic Supabase Setup (Recommended)

To quickly configure Supabase and run migrations, use the included setup script:

```bash
npm run setup:supabase
```
This script will:
1.  Ask for your **Supabase Database Connection String** (Transaction Pooler or Session mode).
    *   Find this in Supabase Dashboard -> Project Settings -> Database -> Connection String.
    *   Select "Node.js" and "Transaction Pooler" (port 6543) or "Session" (port 5432).
    *   **Password**: You must replace `[YOUR-PASSWORD]` with your actual database password.
2.  Ask for API Keys (optional but recommended).
3.  Automatically update `.env`.
4.  Run `drizzle-kit push` to apply the database schema.

## 5. Running the App

After setting up the DB:

```bash
npm run dev
```

Visit `http://localhost:5000` (or the port shown in terminal).
Registration and Login should now work correctly.
