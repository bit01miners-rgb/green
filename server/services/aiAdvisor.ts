import { storage } from "../storage";

interface PatternHandler {
  patterns: RegExp[];
  handler: (message: string, userId: number) => Promise<string>;
}

const handlers: PatternHandler[] = [
  {
    patterns: [/budget/i, /spending limit/i, /over budget/i, /underspend/i],
    handler: async (_message, userId) => {
      const budgets = await storage.getBudgets(userId);
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const txns = await storage.getTransactions(userId, {
        startDate: startOfMonth.toISOString(),
      });

      if (budgets.length === 0) {
        return "You don't have any budgets set up yet. I recommend creating budgets for your top spending categories like Food, Transport, and Entertainment. Go to the Finance section to set them up!";
      }

      const categorySpending: Record<string, number> = {};
      for (const tx of txns) {
        if (tx.type === "expense" || tx.type === "debit") {
          const cat = tx.category || "Other";
          categorySpending[cat] = (categorySpending[cat] || 0) + Math.abs(tx.amount || 0);
        }
      }

      const analysis = budgets.map((b) => {
        const spent = categorySpending[b.category] || 0;
        const limit = b.amountLimit || 0;
        const pct = limit > 0 ? (spent / limit) * 100 : 0;
        const status = pct >= 100 ? "OVER" : pct >= 80 ? "WARNING" : "OK";
        return `  - ${b.category}: $${spent.toFixed(2)} / $${limit.toFixed(2)} (${pct.toFixed(0)}%) [${status}]`;
      });

      return `Here's your budget status this month:\n${analysis.join("\n")}\n\nTip: Focus on categories where you're above 80% to stay on track.`;
    },
  },
  {
    patterns: [/sav(e|ing)/i, /save more/i, /savings rate/i, /emergency fund/i],
    handler: async (_message, userId) => {
      const stats = await storage.getDashboardStats(userId);
      const income = parseFloat(stats.monthlyIncome);
      const expenses = parseFloat(stats.monthlyExpenses);
      const rate = parseFloat(stats.savingsRate);

      const goals = await storage.getSavingsGoals(userId);

      let advice = `Your current savings rate is ${rate.toFixed(1)}% (saving $${(income - expenses).toFixed(2)} per month).\n\n`;

      if (rate < 10) {
        advice += "Your savings rate is below the recommended 20%. Here are some tips:\n";
        advice += "  1. Track your top 3 expense categories and find one to cut by 10%\n";
        advice += "  2. Set up automatic transfers to savings right after payday\n";
        advice += "  3. Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings\n";
      } else if (rate < 20) {
        advice += "You're on the right track! To reach the recommended 20%:\n";
        advice += `  - You need to save an additional $${((income * 0.2) - (income - expenses)).toFixed(2)} per month\n`;
        advice += "  - Consider automating the extra amount into a high-yield savings account\n";
      } else {
        advice += "Excellent savings rate! You're above the recommended 20%. Consider:\n";
        advice += "  - Investing surplus savings for long-term growth\n";
        advice += "  - Building a 6-month emergency fund if you haven't already\n";
      }

      if (goals.length > 0) {
        advice += "\nYour savings goals:\n";
        for (const g of goals) {
          const current = g.currentAmount || 0;
          const target = g.targetAmount || 1;
          const pct = (current / target) * 100;
          advice += `  - ${g.name}: $${current.toFixed(2)} / $${target.toFixed(2)} (${pct.toFixed(0)}%)\n`;
        }
      }

      return advice;
    },
  },
  {
    patterns: [/invest/i, /portfolio/i, /stocks?/i, /crypto/i, /allocation/i, /diversif/i],
    handler: async (_message, userId) => {
      const holdings = await storage.getHoldings(userId);

      let advice = "";
      if (holdings.length === 0) {
        advice = "You don't have any investments tracked yet. Here are some general principles:\n";
      } else {
        const totalValue = holdings.reduce((sum, h) => {
          return sum + (h.quantity || 0) * (h.avgCost || 0);
        }, 0);
        advice = `You have ${holdings.length} holdings worth approximately $${totalValue.toFixed(2)} at cost basis.\n\n`;
      }

      advice += "General investment principles (not financial advice):\n";
      advice += "  1. Diversify across asset classes (stocks, bonds, crypto, real estate)\n";
      advice += "  2. Consider your time horizon - longer horizons can tolerate more volatility\n";
      advice += "  3. Keep an emergency fund (3-6 months expenses) before investing aggressively\n";
      advice += "  4. Dollar-cost averaging reduces timing risk\n";
      advice += "  5. Rebalance your portfolio periodically\n\n";
      advice += "Disclaimer: This is educational information only, not personalized financial advice. Consult a licensed financial advisor for investment decisions.";

      return advice;
    },
  },
  {
    patterns: [/market/i, /price/i, /bitcoin/i, /ethereum/i, /bull/i, /bear/i],
    handler: async () => {
      return "For real-time market data, check the Trading section of the app. Here are some general points:\n\n" +
        "  - Always do your own research (DYOR) before making investment decisions\n" +
        "  - Past performance doesn't guarantee future results\n" +
        "  - Be cautious of FOMO (Fear Of Missing Out) during market rallies\n" +
        "  - Set stop-losses to manage downside risk\n\n" +
        "Use the Market Overview tab for current prices and trends, or check Market Signals for technical analysis.\n\n" +
        "Disclaimer: Not financial advice.";
    },
  },
  {
    patterns: [/debt/i, /loan/i, /pay off/i, /payoff/i, /interest rate/i, /owe/i],
    handler: async (_message, userId) => {
      const loans = await storage.getLoans(userId);

      let advice = "";
      if (loans.length > 0) {
        const totalDebt = loans.reduce((sum, l) => sum + (l.principal || 0), 0);
        advice = `You have ${loans.length} loan(s) totaling $${totalDebt.toFixed(2)}.\n\n`;
      }

      advice += "Debt payoff strategies:\n\n";
      advice += "  Avalanche Method (saves the most money):\n";
      advice += "    - Pay minimums on all debts\n";
      advice += "    - Put extra money toward the highest interest rate debt\n";
      advice += "    - Once paid off, roll that payment to the next highest rate\n\n";
      advice += "  Snowball Method (best for motivation):\n";
      advice += "    - Pay minimums on all debts\n";
      advice += "    - Put extra money toward the smallest balance\n";
      advice += "    - Quick wins build momentum\n\n";
      advice += "  General tips:\n";
      advice += "    - Never miss minimum payments\n";
      advice += "    - Consider consolidation if you have high-rate debt\n";
      advice += "    - Build a small emergency fund ($1,000) before aggressive payoff";

      return advice;
    },
  },
  {
    patterns: [/expense/i, /spend/i, /where.*money/i, /track/i, /categor/i],
    handler: async (_message, userId) => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const txns = await storage.getTransactions(userId, {
        startDate: startOfMonth.toISOString(),
      });

      const categorySpending: Record<string, number> = {};
      let totalExpenses = 0;

      for (const tx of txns) {
        if (tx.type === "expense" || tx.type === "debit") {
          const amount = Math.abs(tx.amount || 0);
          const cat = tx.category || "Uncategorized";
          categorySpending[cat] = (categorySpending[cat] || 0) + amount;
          totalExpenses += amount;
        }
      }

      if (totalExpenses === 0) {
        return "No expenses recorded this month yet. Start logging your transactions to get spending insights!";
      }

      const sorted = Object.entries(categorySpending)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      let response = `Your spending this month: $${totalExpenses.toFixed(2)}\n\nTop categories:\n`;
      for (const [cat, amount] of sorted) {
        const pct = (amount / totalExpenses) * 100;
        response += `  - ${cat}: $${amount.toFixed(2)} (${pct.toFixed(0)}%)\n`;
      }

      response += "\nTip: Look at your largest category - even a 10% reduction there could significantly impact your savings.";
      return response;
    },
  },
];

export async function processChat(message: string, userId: number): Promise<string> {
  // Try to match against known patterns
  for (const handler of handlers) {
    for (const pattern of handler.patterns) {
      if (pattern.test(message)) {
        return handler.handler(message, userId);
      }
    }
  }

  // Default response
  return "I'm your Green Funds financial assistant. I can help with:\n\n" +
    "  - Budget analysis and recommendations\n" +
    "  - Savings strategies and goal tracking\n" +
    "  - Investment and portfolio guidance\n" +
    "  - Debt payoff strategies\n" +
    "  - Spending analysis and insights\n" +
    "  - Market information\n\n" +
    "Try asking me something like:\n" +
    '  - "How is my budget looking?"\n' +
    '  - "How can I save more?"\n' +
    '  - "What are some debt payoff strategies?"\n' +
    '  - "Analyze my spending"';
}
