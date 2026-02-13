import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface Loan {
    id: number;
    userId: number;
    type: string;
    amount: number;
    interestRate: number;
    status: "active" | "paid" | "defaulted";
    startDate: string;
    endDate: string;
}

export interface LoanApplication {
    id: number;
    userId: number;
    type: string;
    amountRequested: number;
    status: "pending" | "approved" | "rejected";
    submittedAt: string;
    creditScore: number;
}

export function useLoans() {
    return useQuery<Loan[]>({
        queryKey: ["/api/lending/loans"],
    });
}

export function useLoanApplications() {
    return useQuery<LoanApplication[]>({
        queryKey: ["/api/lending/applications"],
    });
}

export function useApplyLoan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("/api/lending/apply", {
                method: "POST",
                body: JSON.stringify(data)
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/lending/applications"] });
        },
    });
}

export function useSupply() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { asset: string; amount: number }) => {
            const res = await apiRequest("/api/lending/supply", {
                method: "POST",
                body: JSON.stringify(data)
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/lending/positions"] });
            queryClient.invalidateQueries({ queryKey: ["/api/commercial/cashflow"] }); // Refresh balance potentially
        },
    });
}

export function useWithdraw() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { asset: string; amount: number }) => {
            const res = await apiRequest("/api/lending/withdraw", {
                method: "POST",
                body: JSON.stringify(data)
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/lending/positions"] });
        },
    });
}

export function useBorrow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { asset: string; amount: number }) => {
            const res = await apiRequest("/api/lending/borrow", {
                method: "POST",
                body: JSON.stringify(data)
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/lending/loans"] });
        },
    });
}

export function useRepay() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { loanId: number; amount: number }) => {
            const res = await apiRequest("/api/lending/repay", {
                method: "POST",
                body: JSON.stringify(data)
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/lending/loans"] });
        },
    });
}

export function useCreditScore() {
    return useQuery<{ score: number; tier: string; history: any[] }>({
        queryKey: ["/api/lending/credit-score"],
    });
}
