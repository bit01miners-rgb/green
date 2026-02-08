import { storage } from "../storage";

interface CreditScoreResult {
  score: number;
  rating: string;
  factors: {
    payment_history: { score: number; weight: number; details: string };
    utilization: { score: number; weight: number; details: string };
    account_age: { score: number; weight: number; details: string };
    credit_mix: { score: number; weight: number; details: string };
  };
}

export async function calculateCreditScore(userId: number): Promise<CreditScoreResult> {
  const [accounts, loans, loanApplications, transactions] = await Promise.all([
    storage.getAccounts(userId),
    storage.getLoans(userId),
    storage.getLoanApplications(userId),
    storage.getTransactions(userId),
  ]);

  // 1. Payment History (40%) - Based on loan payment consistency
  const paymentHistoryScore = calculatePaymentHistory(transactions, loans);

  // 2. Credit Utilization (30%) - Debt to income ratio
  const utilizationScore = calculateUtilization(accounts, loans, transactions);

  // 3. Account Age (15%) - Time since first account
  const accountAgeScore = calculateAccountAge(accounts);

  // 4. Credit Mix (15%) - Diversity of account types
  const creditMixScore = calculateCreditMix(accounts, loans);

  // Weighted score (300-850 range)
  const rawScore =
    paymentHistoryScore.score * 0.4 +
    utilizationScore.score * 0.3 +
    accountAgeScore.score * 0.15 +
    creditMixScore.score * 0.15;

  // Scale to 300-850 range
  const score = Math.round(300 + (rawScore / 100) * 550);
  const clampedScore = Math.max(300, Math.min(850, score));

  let rating: string;
  if (clampedScore >= 750) rating = "Excellent";
  else if (clampedScore >= 700) rating = "Good";
  else if (clampedScore >= 650) rating = "Fair";
  else if (clampedScore >= 550) rating = "Poor";
  else rating = "Very Poor";

  // Update credit profile in DB
  await storage.updateCreditProfile(userId, {
    score: clampedScore,
    factors: {
      ...((await storage.getCreditProfile(userId))?.factors as object || {}),
      rating,
      paymentHistoryScore: paymentHistoryScore.score,
      utilizationScore: utilizationScore.score,
      accountAgeScore: accountAgeScore.score,
      creditMixScore: creditMixScore.score,
    }
  });

  return {
    score: clampedScore,
    rating,
    factors: {
      payment_history: {
        score: paymentHistoryScore.score,
        weight: 40,
        details: paymentHistoryScore.details,
      },
      utilization: {
        score: utilizationScore.score,
        weight: 30,
        details: utilizationScore.details,
      },
      account_age: {
        score: accountAgeScore.score,
        weight: 15,
        details: accountAgeScore.details,
      },
      credit_mix: {
        score: creditMixScore.score,
        weight: 15,
        details: creditMixScore.details,
      },
    },
  };
}

function calculatePaymentHistory(
  transactions: { category?: string | null; date?: Date | null }[],
  loans: { status?: string | null }[]
): { score: number; details: string } {
  // Check for loan payment transactions
  const loanPayments = transactions.filter(
    (tx) => tx.category === "Loan Payment"
  );

  if (loans.length === 0 && loanPayments.length === 0) {
    return { score: 70, details: "No loan history. Building credit history will improve this." };
  }

  const activeLoans = loans.filter((l) => l.status === "active" || l.status === "current");
  const defaultedLoans = loans.filter((l) => l.status === "defaulted" || l.status === "delinquent");

  if (defaultedLoans.length > 0) {
    const pct = (defaultedLoans.length / loans.length) * 100;
    return {
      score: Math.max(10, 50 - pct),
      details: `${defaultedLoans.length} defaulted loan(s) detected. This significantly impacts your score.`,
    };
  }

  // Score based on payment regularity
  const recentPayments = loanPayments.filter((tx) => {
    const txDate = tx.date ? new Date(tx.date) : new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return txDate >= sixMonthsAgo;
  });

  const expectedPayments = activeLoans.length * 6; // 6 months of expected payments
  const paymentRate = expectedPayments > 0 ? Math.min(1, recentPayments.length / expectedPayments) : 0.7;
  const score = Math.round(paymentRate * 100);

  return {
    score,
    details: `${recentPayments.length} payments made in the last 6 months across ${activeLoans.length} active loan(s).`,
  };
}

function calculateUtilization(
  accounts: { balance?: number | null; type?: string | null }[],
  loans: { principal?: number | null; balance?: number | null }[],
  transactions: { type?: string | null; amount?: number | null; date?: Date | null }[]
): { score: number; details: string } {
  const totalDebt = loans.reduce((sum, l) => {
    return sum + (l.balance || l.principal || 0);
  }, 0);

  // Estimate monthly income from transactions
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const recentIncome = transactions
    .filter((tx) => {
      const txDate = tx.date ? new Date(tx.date) : new Date();
      return txDate >= threeMonthsAgo && (tx.type === "income" || tx.type === "credit");
    })
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const monthlyIncome = recentIncome / 3;

  if (monthlyIncome <= 0) {
    return { score: 50, details: "Insufficient income data to calculate utilization ratio." };
  }

  const dtiRatio = totalDebt / (monthlyIncome * 12); // Annual income

  let score: number;
  if (dtiRatio <= 0.1) score = 95;
  else if (dtiRatio <= 0.2) score = 85;
  else if (dtiRatio <= 0.3) score = 75;
  else if (dtiRatio <= 0.4) score = 60;
  else if (dtiRatio <= 0.5) score = 45;
  else score = Math.max(10, 30 - (dtiRatio - 0.5) * 40);

  return {
    score: Math.round(score),
    details: `Debt-to-income ratio: ${(dtiRatio * 100).toFixed(1)}%. Total debt: $${totalDebt.toFixed(2)}, Est. annual income: $${(monthlyIncome * 12).toFixed(2)}.`,
  };
}

function calculateAccountAge(
  accounts: { createdAt?: Date | null }[]
): { score: number; details: string } {
  if (accounts.length === 0) {
    return { score: 30, details: "No accounts found. Open an account to start building history." };
  }

  const oldestDate = accounts.reduce((oldest, acc) => {
    const created = acc.createdAt ? new Date(acc.createdAt) : new Date();
    return created < oldest ? created : oldest;
  }, new Date());

  const ageMonths = Math.floor(
    (Date.now() - oldestDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  let score: number;
  if (ageMonths >= 120) score = 100; // 10+ years
  else if (ageMonths >= 60) score = 85; // 5+ years
  else if (ageMonths >= 24) score = 70; // 2+ years
  else if (ageMonths >= 12) score = 55; // 1+ year
  else if (ageMonths >= 6) score = 40;
  else score = 25;

  const years = Math.floor(ageMonths / 12);
  const months = ageMonths % 12;
  const ageStr = years > 0 ? `${years} year(s), ${months} month(s)` : `${months} month(s)`;

  return {
    score,
    details: `Account history: ${ageStr}. ${accounts.length} total account(s).`,
  };
}

function calculateCreditMix(
  accounts: { type?: string | null }[],
  loans: { type?: string | null }[]
): { score: number; details: string } {
  const types = new Set<string>();

  for (const acc of accounts) {
    if (acc.type) types.add(acc.type);
  }
  for (const loan of loans) {
    if (loan.type) types.add(`loan_${loan.type}`);
  }

  let score: number;
  const count = types.size;
  if (count >= 5) score = 100;
  else if (count >= 4) score = 85;
  else if (count >= 3) score = 70;
  else if (count >= 2) score = 55;
  else if (count >= 1) score = 40;
  else score = 20;

  return {
    score,
    details: `${count} different account type(s): ${Array.from(types).join(", ") || "none"}.`,
  };
}
