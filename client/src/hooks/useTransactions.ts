import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Transaction, InsertTransaction } from "@shared/schema";

export function useTransactions(filters?: {
  category?: string;
  startDate?: string;
  endDate?: string;
  accountId?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (filters?.category) params.set("category", filters.category);
  if (filters?.startDate) params.set("startDate", filters.startDate);
  if (filters?.endDate) params.set("endDate", filters.endDate);
  if (filters?.accountId) params.set("accountId", String(filters.accountId));
  if (filters?.limit) params.set("limit", String(filters.limit));

  const qs = params.toString();
  return useQuery<Transaction[]>({
    queryKey: [`/api/finance/transactions${qs ? `?${qs}` : ""}`],
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<InsertTransaction>) => {
      const res = await apiRequest("/api/finance/transactions", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/finance/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/banking/accounts"] });
    },
  });
}

export interface FinanceSummary {
  totalIncome: string;
  totalExpenses: string;
  savingsRate: string;
  netWorth?: number;
  topCategories: { category: string; amount: string }[];
}

export function useFinanceSummary() {
  return useQuery<FinanceSummary>({
    queryKey: ["/api/finance/summary"],
  });
}

export function useBudgets() {
  return useQuery({
    queryKey: ["/api/finance/budgets"],
  });
}

export function useSavingsGoals() {
  return useQuery({
    queryKey: ["/api/finance/savings-goals"],
  });
}
