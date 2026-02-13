import { db } from "./db";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";
import {
  users,
  accounts,
  transactions,
  budgets,
  savingsGoals,
  portfolioHoldings,
  watchlist,
  loans,
  loanApplications,
  invoices,
  payrollEntries,
  walletConnections,
  defiPositions,
  aiChatHistory,
  creditProfiles,
} from "@shared/schema";
import type {
  User,
  Account,
  Transaction,
  Budget,
  SavingsGoal,
  PortfolioHolding,
  Loan,
  LoanApplication,
  Invoice,
  PayrollEntry,
  WalletConnection,
  DefiPosition,
  CreditProfile,
} from "@shared/schema";

export class Storage {
  // ── Users ──────────────────────────────────────────────────────────

  async getUser(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  }

  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username: string;
  }) {
    const [user] = await db.insert(users).values({
      email: data.email,
      password: data.password,
      username: data.username,
      name: `${data.firstName} ${data.lastName}`,
    }).returning();
    return user;
  }

  async getAllUsers() {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: number, data: Partial<typeof users.$inferInsert>) {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: number) {
    // Note: This might fail if there are foreign key constraints without CASCADE
    // Ideally we would delete related records first or use CASCADE in schema
    await db.delete(users).where(eq(users.id, id));
  }

  // ── Accounts ───────────────────────────────────────────────────────

  async getAccounts(userId: number) {
    return db.select().from(accounts).where(eq(accounts.userId, userId)).orderBy(desc(accounts.createdAt));
  }

  async createAccount(data: typeof accounts.$inferInsert) {
    const [account] = await db.insert(accounts).values(data).returning();
    return account;
  }

  async updateAccountBalance(id: number, balance: number) {
    const [account] = await db
      .update(accounts)
      .set({ balance })
      .where(eq(accounts.id, id))
      .returning();
    return account;
  }

  // ── Transactions ───────────────────────────────────────────────────

  async getTransactions(
    userId: number,
    filters?: {
      category?: string;
      startDate?: string;
      endDate?: string;
      accountId?: number;
      limit?: number;
    }
  ) {
    const conditions = [eq(transactions.userId, userId)];

    if (filters?.category) {
      conditions.push(eq(transactions.category, filters.category));
    }
    if (filters?.accountId) {
      conditions.push(eq(transactions.accountId, filters.accountId));
    }
    if (filters?.startDate) {
      conditions.push(gte(transactions.date, new Date(filters.startDate)));
    }
    if (filters?.endDate) {
      conditions.push(lte(transactions.date, new Date(filters.endDate)));
    }

    const query = db
      .select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.date));

    if (filters?.limit) {
      return query.limit(filters.limit);
    }
    return query;
  }

  async createTransaction(data: typeof transactions.$inferInsert) {
    const [tx] = await db.insert(transactions).values(data).returning();
    return tx;
  }

  async getTransactionsByAccount(accountId: number) {
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.accountId, accountId))
      .orderBy(desc(transactions.date));
  }

  // ── Budgets ────────────────────────────────────────────────────────

  async getBudgets(userId: number) {
    return db.select().from(budgets).where(eq(budgets.userId, userId));
  }

  async createBudget(data: typeof budgets.$inferInsert) {
    const [budget] = await db.insert(budgets).values(data).returning();
    return budget;
  }

  async updateBudget(id: number, data: Partial<typeof budgets.$inferInsert>) {
    const [budget] = await db
      .update(budgets)
      .set({ ...data })
      .where(eq(budgets.id, id))
      .returning();
    return budget;
  }

  // ── Savings Goals ──────────────────────────────────────────────────

  async getSavingsGoals(userId: number) {
    return db.select().from(savingsGoals).where(eq(savingsGoals.userId, userId));
  }

  async createSavingsGoal(data: typeof savingsGoals.$inferInsert) {
    const [goal] = await db.insert(savingsGoals).values(data).returning();
    return goal;
  }

  async updateSavingsGoal(id: number, data: Partial<typeof savingsGoals.$inferInsert>) {
    const [goal] = await db
      .update(savingsGoals)
      .set({ ...data })
      .where(eq(savingsGoals.id, id))
      .returning();
    return goal;
  }

  // ── Portfolio Holdings ─────────────────────────────────────────────

  async getHoldings(userId: number) {
    return db.select().from(portfolioHoldings).where(eq(portfolioHoldings.userId, userId));
  }

  async createHolding(data: typeof portfolioHoldings.$inferInsert) {
    const [holding] = await db.insert(portfolioHoldings).values(data).returning();
    return holding;
  }

  async deleteHolding(id: number) {
    await db.delete(portfolioHoldings).where(eq(portfolioHoldings.id, id));
  }

  // ── Watchlist ──────────────────────────────────────────────────────

  async getWatchlist(userId: number) {
    return db.select().from(watchlist).where(eq(watchlist.userId, userId));
  }

  async addToWatchlist(data: typeof watchlist.$inferInsert) {
    const [item] = await db.insert(watchlist).values(data).returning();
    return item;
  }

  async removeFromWatchlist(id: number) {
    await db.delete(watchlist).where(eq(watchlist.id, id));
  }

  // ── Loans ──────────────────────────────────────────────────────────

  async getLoans(userId: number) {
    return db.select().from(loans).where(eq(loans.userId, userId));
  }

  async createLoan(data: typeof loans.$inferInsert) {
    const [loan] = await db.insert(loans).values(data).returning();
    return loan;
  }

  async getLoanApplications(userId: number) {
    return db
      .select()
      .from(loanApplications)
      .where(eq(loanApplications.userId, userId))
      .orderBy(desc(loanApplications.submittedAt));
  }

  async createLoanApplication(data: typeof loanApplications.$inferInsert) {
    const [app] = await db.insert(loanApplications).values(data).returning();
    return app;
  }

  // ── Invoices ───────────────────────────────────────────────────────

  async getInvoices(userId: number, status?: string) {
    const conditions = [eq(invoices.userId, userId)];
    if (status) {
      conditions.push(eq(invoices.status, status));
    }
    return db
      .select()
      .from(invoices)
      .where(and(...conditions))
      .orderBy(desc(invoices.createdAt));
  }

  async createInvoice(data: typeof invoices.$inferInsert) {
    const [invoice] = await db.insert(invoices).values(data).returning();
    return invoice;
  }

  async updateInvoiceStatus(id: number, status: string) {
    const [invoice] = await db
      .update(invoices)
      .set({ status })
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }

  // ── Payroll ────────────────────────────────────────────────────────

  async getPayrollEntries(userId: number) {
    return db
      .select()
      .from(payrollEntries)
      .where(eq(payrollEntries.userId, userId))
      .orderBy(desc(payrollEntries.payDate));
  }

  async createPayrollEntry(data: typeof payrollEntries.$inferInsert) {
    const [entry] = await db.insert(payrollEntries).values(data).returning();
    return entry;
  }

  // ── Wallet Connections ─────────────────────────────────────────────

  async getWalletConnections(userId: number) {
    return db.select().from(walletConnections).where(eq(walletConnections.userId, userId));
  }

  async createWalletConnection(data: typeof walletConnections.$inferInsert) {
    const [wallet] = await db.insert(walletConnections).values(data).returning();
    return wallet;
  }

  async deleteWalletConnection(id: number) {
    await db.delete(walletConnections).where(eq(walletConnections.id, id));
  }

  // ── DeFi Positions ────────────────────────────────────────────────

  async getDefiPositions(userId: number) {
    return db.select().from(defiPositions).where(eq(defiPositions.userId, userId));
  }

  async createDefiPosition(data: typeof defiPositions.$inferInsert) {
    const [position] = await db.insert(defiPositions).values(data).returning();
    return position;
  }

  async getDefiPositionByToken(userId: number, protocol: string, tokenSymbol: string) {
    const [position] = await db
      .select()
      .from(defiPositions)
      .where(
        and(
          eq(defiPositions.userId, userId),
          eq(defiPositions.protocol, protocol),
          eq(defiPositions.tokenA, tokenSymbol)
        )
      );
    return position || null;
  }

  async updateDefiPosition(id: number, data: Partial<typeof defiPositions.$inferInsert>) {
    const [position] = await db
      .update(defiPositions)
      .set(data)
      .where(eq(defiPositions.id, id))
      .returning();
    return position;
  }

  // ── AI Chat History ────────────────────────────────────────────────

  async getChatHistory(userId: number) {
    return db
      .select()
      .from(aiChatHistory)
      .where(eq(aiChatHistory.userId, userId))
      .orderBy(desc(aiChatHistory.createdAt));
  }

  async addChatMessage(data: typeof aiChatHistory.$inferInsert) {
    const [message] = await db.insert(aiChatHistory).values(data).returning();
    return message;
  }

  // ── Credit Profiles ────────────────────────────────────────────────

  async getCreditProfile(userId: number) {
    const [profile] = await db
      .select()
      .from(creditProfiles)
      .where(eq(creditProfiles.userId, userId));
    return profile || null;
  }

  async updateCreditProfile(userId: number, data: Partial<typeof creditProfiles.$inferInsert>) {
    const existing = await this.getCreditProfile(userId);
    if (existing) {
      const [profile] = await db
        .update(creditProfiles)
        .set({ ...data, lastUpdated: new Date() })
        .where(eq(creditProfiles.userId, userId))
        .returning();
      return profile;
    }
    const [profile] = await db
      .insert(creditProfiles)
      .values({ userId, ...data } as typeof creditProfiles.$inferInsert)
      .returning();
    return profile;
  }

  // ── Dashboard Stats ────────────────────────────────────────────────

  async getDashboardStats(userId: number) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const userAccounts = await this.getAccounts(userId);
    const totalBalance = userAccounts.reduce(
      (sum, acc) => sum + (acc.balance || 0),
      0
    );

    const monthlyTransactions = await this.getTransactions(userId, {
      startDate: startOfMonth.toISOString(),
    });

    let income = 0;
    let expenses = 0;
    for (const tx of monthlyTransactions) {
      const amount = tx.amount || 0;
      if (tx.type === "income" || tx.type === "credit") {
        income += amount;
      } else {
        expenses += Math.abs(amount);
      }
    }

    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    return {
      totalBalance: totalBalance.toFixed(2),
      monthlyIncome: income.toFixed(2),
      monthlyExpenses: expenses.toFixed(2),
      savingsRate: savingsRate.toFixed(1),
      accountCount: userAccounts.length,
    };
  }
}

export const storage = new Storage();
