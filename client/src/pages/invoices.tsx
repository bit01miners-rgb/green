import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, MoreVertical, Send, Download, CheckCircle, XCircle, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useInvoices, useCreateInvoice, useUpdateInvoiceStatus, Invoice } from "@/hooks/useCommercial";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const invoiceSchema = z.object({
    clientName: z.string().min(2, "Client name is required"),
    clientEmail: z.string().email().optional().or(z.literal("")),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Amount must be a positive number"),
    dueDate: z.string().min(1, "Due date is required"),
    notes: z.string().optional(),
});

export default function Invoices() {
    const { data: invoices, isLoading } = useInvoices();
    const createInvoiceMutation = useCreateInvoice();
    const updateStatusMutation = useUpdateInvoiceStatus();
    const { toast } = useToast();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const form = useForm<z.infer<typeof invoiceSchema>>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            clientName: "",
            clientEmail: "",
            amount: "",
            dueDate: "",
            notes: "",
        },
    });

    const onSubmit = (values: z.infer<typeof invoiceSchema>) => {
        createInvoiceMutation.mutate({
            ...values,
            amount: Number(values.amount),
        }, {
            onSuccess: () => {
                toast({ title: "Invoice Created", description: "The invoice has been successfully created." });
                setIsCreateOpen(false);
                form.reset();
            },
            onError: (error) => {
                toast({ title: "Error", description: "Failed to create invoice.", variant: "destructive" });
            }
        });
    };

    const handleStatusUpdate = (id: number, status: string) => {
        updateStatusMutation.mutate({ id, status }, {
            onSuccess: () => {
                toast({ title: "Status Updated", description: `Invoice marked as ${status}.` });
            },
            onError: () => {
                toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
            }
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "paid": return "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20";
            case "sent": return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20";
            case "pending": return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20";
            case "overdue": return "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20";
            default: return "bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 border-slate-500/20";
        }
    };

    const filteredInvoices = invoices?.filter(inv =>
        inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500 container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-muted-foreground">Create and manage your client invoices.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="mr-2 h-4 w-4" /> Create Invoice
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create Invoice</DialogTitle>
                            <DialogDescription>Enter the invoice details below.</DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="clientName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Client Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Acme Corp" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="clientEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Client Email (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="billing@acme.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Amount ($)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="dueDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Due Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={createInvoiceMutation.isPending}>
                                        {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="shadow-md border-none">
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <CardTitle>All Invoices</CardTitle>
                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search clients or ID..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice ID</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredInvoices?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No invoices found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredInvoices?.map((invoice) => (
                                        <TableRow key={invoice.id} className="hover:bg-muted/50">
                                            <TableCell className="font-mono text-xs">{invoice.invoiceNumber}</TableCell>
                                            <TableCell className="font-medium">{invoice.clientName}</TableCell>
                                            <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-bold">{formatCurrency(invoice.amount)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className={`${getStatusColor(invoice.status)} uppercase text-[10px]`}>
                                                        {invoice.status}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(invoice.id, 'sent')}>
                                                            <Send className="mr-2 h-4 w-4" /> Mark as Sent
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(invoice.id, 'paid')}>
                                                            <CheckCircle className="mr-2 h-4 w-4" /> Mark as Paid
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(invoice.id, 'cancelled')}>
                                                            <XCircle className="mr-2 h-4 w-4" /> Cancel Invoice
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem>
                                                            <Download className="mr-2 h-4 w-4" /> Download PDF
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
