import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  real,
  jsonb,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==================== USERS ====================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  password: text("password"),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"), // user, admin
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== ACCOUNTS (Banking) ====================
export const accounts = pgTable(
  "accounts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    name: text("name").notNull(),
    type: text("type").notNull(), // checking, savings, investment, crypto
    balance: real("balance").notNull().default(0),
    currency: varchar("currency", { length: 10 }).notNull().default("USD"),
    institution: text("institution"),
    accountNumber: text("account_number"),
    color: text("color"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({ accountsUserIdx: index("accounts_user_idx").on(t.userId) })
);

// ==================== TRANSACTIONS ====================
export const transactions = pgTable(
  "transactions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    accountId: integer("account_id").references(() => accounts.id),
    amount: real("amount").notNull(),
    type: text("type").notNull(), // income, expense, transfer
    category: text("category").notNull(),
    description: text("description"),
    merchant: text("merchant"),
    date: timestamp("date").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    txnUserIdx: index("txn_user_idx").on(t.userId),
    txnDateIdx: index("txn_date_idx").on(t.date),
    txnCategoryIdx: index("txn_category_idx").on(t.category),
  })
);

// ==================== BUDGETS ====================
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  category: text("category").notNull(),
  amountLimit: real("amount_limit").notNull(),
  period: text("period").notNull().default("monthly"), // monthly, weekly
  spent: real("spent").notNull().default(0),
  startDate: timestamp("start_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== SAVINGS GOALS ====================
export const savingsGoals = pgTable("savings_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  targetAmount: real("target_amount").notNull(),
  currentAmount: real("current_amount").notNull().default(0),
  deadline: timestamp("deadline"),
  icon: text("icon").default("piggy-bank"),
  color: text("color").default("#22c55e"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== PORTFOLIO HOLDINGS ====================
export const portfolioHoldings = pgTable(
  "portfolio_holdings",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    symbol: text("symbol").notNull(),
    name: text("name").notNull(),
    quantity: real("quantity").notNull(),
    avgCost: real("avg_cost").notNull(),
    assetType: text("asset_type").notNull(), // stock, crypto, defi
    chain: text("chain"), // ethereum, solana, null for stocks
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({ holdingsUserIdx: index("holdings_user_idx").on(t.userId) })
);

// ==================== WATCHLIST ====================
export const watchlist = pgTable("watchlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  symbol: text("symbol").notNull(),
  assetType: text("asset_type").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

// ==================== LOANS ====================
export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // personal, mortgage, business, auto
  lender: text("lender"),
  principal: real("principal").notNull(),
  interestRate: real("interest_rate").notNull(),
  termMonths: integer("term_months").notNull(),
  monthlyPayment: real("monthly_payment").notNull(),
  balance: real("balance").notNull(),
  status: text("status").notNull().default("active"), // active, paid_off, defaulted
  startDate: timestamp("start_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== LOAN APPLICATIONS ====================
export const loanApplications = pgTable("loan_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  amountRequested: real("amount_requested").notNull(),
  termMonths: integer("term_months").notNull(),
  purpose: text("purpose"),
  status: text("status").notNull().default("pending"), // pending, approved, denied, withdrawn
  creditScore: integer("credit_score"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

// ==================== INVOICES (Commercial) ====================
export const invoices = pgTable(
  "invoices",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    invoiceNumber: text("invoice_number").notNull(),
    clientName: text("client_name").notNull(),
    clientEmail: text("client_email"),
    amount: real("amount").notNull(),
    tax: real("tax").default(0),
    status: text("status").notNull().default("draft"), // draft, sent, paid, overdue, cancelled
    dueDate: timestamp("due_date").notNull(),
    paidDate: timestamp("paid_date"),
    items: jsonb("items").notNull().default([]),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({ invoiceUserIdx: index("invoice_user_idx").on(t.userId) })
);

// ==================== PAYROLL ENTRIES ====================
export const payrollEntries = pgTable("payroll_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  employeeName: text("employee_name").notNull(),
  employeeEmail: text("employee_email"),
  amount: real("amount").notNull(),
  payDate: timestamp("pay_date").notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, cancelled
  type: text("type").notNull().default("salary"), // salary, bonus, commission
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== WALLET CONNECTIONS (Web3) ====================
export const walletConnections = pgTable("wallet_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  address: text("address").notNull(),
  chain: text("chain").notNull(), // ethereum, solana
  label: text("label"),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== DEFI POSITIONS ====================
export const defiPositions = pgTable("defi_positions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  protocol: text("protocol").notNull(),
  poolName: text("pool_name").notNull(),
  chain: text("chain").notNull(),
  depositedAmount: real("deposited_amount").notNull(),
  currentValue: real("current_value").notNull(),
  apy: real("apy"),
  tokenA: text("token_a"),
  tokenB: text("token_b"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== AI CHAT HISTORY ====================
export const aiChatHistory = pgTable(
  "ai_chat_history",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    role: text("role").notNull(), // user, assistant
    message: text("message").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({ chatUserIdx: index("chat_user_idx").on(t.userId) })
);

// ==================== CREDIT PROFILES ====================
export const creditProfiles = pgTable("credit_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id)
    .unique(),
  score: integer("score").notNull().default(650),
  factors: jsonb("factors").notNull().default({}),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// ==================== COMPLIANCE CHECKS ====================
export const complianceChecks = pgTable("compliance_checks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  checkType: text("check_type").notNull(), // kyc, aml, sanctions, pep, media
  status: text("status").notNull().default("pending"), // passed, failed, review, pending
  details: text("details"),
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
});

// ==================== COMPLIANCE ALERTS ====================
export const complianceAlerts = pgTable("compliance_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  alertType: text("alert_type").notNull(), // velocity, volume, structuring, sanctions
  severity: text("severity").notNull(), // low, medium, high, critical
  message: text("message").notNull(),
  status: text("status").notNull().default("open"), // open, investigating, closed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== TRADING BOT STRATEGIES ====================
export const botStrategies = pgTable("bot_strategies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  strategyType: text("strategy_type").notNull(), // macd, rsi, grid, arbitrage
  riskLevel: integer("risk_level").notNull().default(5), // 1-10
  isActive: boolean("is_active").default(false),
  config: jsonb("config").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== RELATIONS ====================
export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  transactions: many(transactions),
  budgets: many(budgets),
  savingsGoals: many(savingsGoals),
  portfolioHoldings: many(portfolioHoldings),
  loans: many(loans),
  invoices: many(invoices),
  walletConnections: many(walletConnections),
  defiPositions: many(defiPositions),

  creditProfile: one(creditProfiles),
  complianceChecks: many(complianceChecks),
  complianceAlerts: many(complianceAlerts),
  botStrategies: many(botStrategies),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  account: one(accounts, { fields: [transactions.accountId], references: [accounts.id] }),
}));

// ==================== TYPE EXPORTS ====================
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;
export type SavingsGoal = typeof savingsGoals.$inferSelect;
export type InsertSavingsGoal = typeof savingsGoals.$inferInsert;
export type PortfolioHolding = typeof portfolioHoldings.$inferSelect;
export type InsertPortfolioHolding = typeof portfolioHoldings.$inferInsert;
export type WatchlistItem = typeof watchlist.$inferSelect;
export type InsertWatchlistItem = typeof watchlist.$inferInsert;
export type Loan = typeof loans.$inferSelect;
export type InsertLoan = typeof loans.$inferInsert;
export type LoanApplication = typeof loanApplications.$inferSelect;
export type InsertLoanApplication = typeof loanApplications.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;
export type PayrollEntry = typeof payrollEntries.$inferSelect;
export type InsertPayrollEntry = typeof payrollEntries.$inferInsert;
export type WalletConnection = typeof walletConnections.$inferSelect;
export type InsertWalletConnection = typeof walletConnections.$inferInsert;
export type DefiPosition = typeof defiPositions.$inferSelect;
export type InsertDefiPosition = typeof defiPositions.$inferInsert;
export type AiChatMessage = typeof aiChatHistory.$inferSelect;
export type InsertAiChatMessage = typeof aiChatHistory.$inferInsert;
export type CreditProfile = typeof creditProfiles.$inferSelect;
export type InsertCreditProfile = typeof creditProfiles.$inferInsert;
export type ComplianceCheck = typeof complianceChecks.$inferSelect;
export type InsertComplianceCheck = typeof complianceChecks.$inferInsert;
export type ComplianceAlert = typeof complianceAlerts.$inferSelect;
export type InsertComplianceAlert = typeof complianceAlerts.$inferInsert;
export type BotStrategy = typeof botStrategies.$inferSelect;
export type InsertBotStrategy = typeof botStrategies.$inferInsert;
