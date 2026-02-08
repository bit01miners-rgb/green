import { storage } from "../storage";

interface DailyPrediction {
  date: string;
  predictedAmount: string;
  categoryBreakdown: Record<string, string>;
}

export async function predictSpending(
  userId: number,
  days: number = 30
): Promise<{
  predictions: DailyPrediction[];
  totalPredicted: string;
  averageDaily: string;
  confidence: string;
}> {
  // Get last 90 days of transactions
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const transactions = await storage.getTransactions(userId, {
    startDate: ninetyDaysAgo.toISOString(),
  });

  // Filter expenses only
  const expenses = transactions.filter(
    (tx) => tx.type === "expense" || tx.type === "debit"
  );

  if (expenses.length === 0) {
    const emptyPredictions: DailyPrediction[] = [];
    for (let i = 1; i <= days; i++) {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      emptyPredictions.push({
        date: date.toISOString().split("T")[0],
        predictedAmount: "0.00",
        categoryBreakdown: {},
      });
    }
    return {
      predictions: emptyPredictions,
      totalPredicted: "0.00",
      averageDaily: "0.00",
      confidence: "low",
    };
  }

  // Aggregate spending by day of week and category
  const dailySpending: Record<number, number[]> = {};
  const categoryDailySpending: Record<string, Record<number, number[]>> = {};

  for (let dow = 0; dow < 7; dow++) {
    dailySpending[dow] = [];
  }

  for (const tx of expenses) {
    const txDate = new Date(tx.date!);
    const dow = txDate.getDay();
    const amount = Math.abs(tx.amount || 0);

    dailySpending[dow].push(amount);

    const cat = tx.category || "Other";
    if (!categoryDailySpending[cat]) {
      categoryDailySpending[cat] = {};
      for (let d = 0; d < 7; d++) {
        categoryDailySpending[cat][d] = [];
      }
    }
    categoryDailySpending[cat][dow].push(amount);
  }

  // Calculate weighted moving averages by day of week
  // More recent data gets higher weight
  function weightedAverage(values: number[]): number {
    if (values.length === 0) return 0;
    let weightedSum = 0;
    let weightTotal = 0;
    for (let i = 0; i < values.length; i++) {
      const weight = i + 1; // More recent values have higher index
      weightedSum += values[i] * weight;
      weightTotal += weight;
    }
    return weightedSum / weightTotal;
  }

  // Generate predictions
  const predictions: DailyPrediction[] = [];
  let totalPredicted = 0;

  for (let i = 1; i <= days; i++) {
    const futureDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const dow = futureDate.getDay();

    const dailyPrediction = weightedAverage(dailySpending[dow]);
    totalPredicted += dailyPrediction;

    // Category breakdown
    const categoryBreakdown: Record<string, string> = {};
    for (const [cat, dowMap] of Object.entries(categoryDailySpending)) {
      const catPrediction = weightedAverage(dowMap[dow]);
      if (catPrediction > 0) {
        categoryBreakdown[cat] = catPrediction.toFixed(2);
      }
    }

    predictions.push({
      date: futureDate.toISOString().split("T")[0],
      predictedAmount: dailyPrediction.toFixed(2),
      categoryBreakdown,
    });
  }

  const averageDaily = totalPredicted / days;

  // Confidence based on data density
  const dataPoints = expenses.length;
  let confidence: string;
  if (dataPoints >= 60) confidence = "high";
  else if (dataPoints >= 30) confidence = "medium";
  else confidence = "low";

  return {
    predictions,
    totalPredicted: totalPredicted.toFixed(2),
    averageDaily: averageDaily.toFixed(2),
    confidence,
  };
}
