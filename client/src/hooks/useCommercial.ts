import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface Invoice {
    id: number;
    userId: number;
    clientName: string;
    clientEmail?: string;
    amount: number;
    status: InvoiceStatus;
    dueDate: string;
    invoiceNumber: string;
    items?: any;
}

export interface CashFlowData {
    month: string;
    income: string;
    expenses: string;
    net: string;
}

export function useInvoices() {
    return useQuery<Invoice[]>({
        queryKey: ["/api/commercial/invoices"],
    });
}

export function useCreateInvoice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("/api/commercial/invoices", {
                method: "POST",
                body: JSON.stringify(data)
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/commercial/invoices"] });
        },
    });
}

export function useCashFlow() {
    return useQuery<CashFlowData[]>({
        queryKey: ["/api/commercial/cashflow"],
    });
}

export function usePayroll() {
    return useQuery<any[]>({
        queryKey: ["/api/commercial/payroll"],
    });
}

export function useCreatePayroll() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("/api/commercial/payroll", {
                method: "POST",
                body: JSON.stringify(data)
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/commercial/payroll"] });
        },
    });
}

export function useUpdateInvoiceStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }: { id: number; status: string }) => {
            const res = await apiRequest(`/api/commercial/invoices/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status })
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/commercial/invoices"] });
        },
    });
}
