import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, FileText, DollarSign, Plus, ArrowRight, TrendingUp, Building2, Wallet } from "lucide-react";
import { useCashFlow, useInvoices, usePayroll } from "@/hooks/useCommercial";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default function Commercial() {
    const { data: cashflow, isLoading: isCashflowLoading } = useCashFlow();
    const { data: invoices, isLoading: isInvoicesLoading } = useInvoices();
    const { data: payroll, isLoading: isPayrollLoading } = usePayroll();

    const totalInvoices = invoices?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
    const openInvoicesCount = invoices?.filter(inv => inv.status === 'sent' || inv.status === 'overdue').length || 0;
    const payrollLiability = payroll?.reduce((sum, entry) => sum + Number(entry.amount), 0) || 0;

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500 container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Building2 className="h-8 w-8 text-primary" />
                        Commercial Banking
                    </h1>
                    <p className="text-muted-foreground mt-1">Enterprise financial management, payroll, and invoicing.</p>
                </div>
                <div className="flex gap-2">
                    <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                        <Plus className="mr-2 h-4 w-4" /> New Invoice
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wallet className="h-24 w-24" />
                    </div>
                    <CardContent className="pt-6 relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-slate-400 font-medium">Operating Account</p>
                                <h2 className="text-3xl font-bold mt-2">$245,890.00</h2>
                            </div>
                            <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                                <DollarSign className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-green-400 bg-green-400/10 w-fit px-2 py-1 rounded-full border border-green-400/20">
                            <TrendingUp className="h-3 w-3 mr-1" /> +12.5% this month
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Payroll Liability</p>
                                {isPayrollLoading ? (
                                    <Skeleton className="h-9 w-32 mt-2" />
                                ) : (
                                    <h2 className="text-3xl font-bold mt-2">{formatCurrency(payrollLiability)}</h2>
                                )}
                            </div>
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-full">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4 flex items-center gap-1">
                            <span className="font-semibold text-foreground">Next Run:</span> 15th Aug
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Accounts Receivable</p>
                                {isInvoicesLoading ? (
                                    <Skeleton className="h-9 w-32 mt-2" />
                                ) : (
                                    <h2 className="text-3xl font-bold mt-2">{formatCurrency(totalInvoices)}</h2>
                                )}
                            </div>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full">
                                <FileText className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4 flex items-center gap-1">
                            <Badge variant="secondary" className="font-normal">{openInvoicesCount} invoices pending</Badge>
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Dashboard Area */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Cash Flow Chart */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Cash Flow Analysis</CardTitle>
                            <CardDescription>Income vs Expenses over time</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            {isCashflowLoading ? (
                                <Skeleton className="h-full w-full" />
                            ) : cashflow && cashflow.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={cashflow}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
                                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(value) => `$${value}`} />
                                        <Tooltip
                                            cursor={{ fill: "hsl(var(--muted)/0.4)" }}
                                            contentStyle={{ backgroundColor: "hsl(var(--popover))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                                            labelStyle={{ color: "hsl(var(--popover-foreground))", fontWeight: "bold" }}
                                        />
                                        <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                        <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                                    No cash flow data available.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Invoices */}
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Recent Invoices</CardTitle>
                            <Button variant="ghost" size="sm" className="text-primary">View All <ArrowRight className="ml-1 h-3 w-3" /></Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {isInvoicesLoading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <div key={i} className="flex items-center space-x-4 py-2">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-[200px]" />
                                                <Skeleton className="h-4 w-[150px]" />
                                            </div>
                                        </div>
                                    ))
                                ) : invoices && invoices.length > 0 ? (
                                    invoices.slice(0, 5).map((invoice) => (
                                        <div key={invoice.id} className="flex justify-between items-center py-3 border-b border-border/50 last:border-0 hover:bg-accent/20 px-2 rounded-lg transition-colors cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                    {invoice.clientName.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm">{invoice.clientName}</div>
                                                    <div className="text-xs text-muted-foreground">{invoice.invoiceNumber} • Due {new Date(invoice.dueDate).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="font-bold">{formatCurrency(invoice.amount)}</div>
                                                <Badge
                                                    variant={invoice.status === 'paid' ? 'default' : invoice.status === 'overdue' ? 'destructive' : 'secondary'}
                                                    className={`text-[10px] uppercase h-5 ${invoice.status === 'paid' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                                                >
                                                    {invoice.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground text-sm">No recent invoices found.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-accent hover:border-primary/50 transition-all group shadow-sm bg-card">
                            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 group-hover:scale-110 transition-transform">
                                <FileText className="h-5 w-5" />
                            </div>
                            <span className="font-medium">Create Invoice</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-accent hover:border-primary/50 transition-all group shadow-sm bg-card">
                            <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 group-hover:scale-110 transition-transform">
                                <Users className="h-5 w-5" />
                            </div>
                            <span className="font-medium">Run Payroll</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-accent hover:border-primary/50 transition-all group shadow-sm bg-card">
                            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 group-hover:scale-110 transition-transform">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            <span className="font-medium">Reports</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-accent hover:border-primary/50 transition-all group shadow-sm bg-card">
                            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 group-hover:scale-110 transition-transform">
                                <DollarSign className="h-5 w-5" />
                            </div>
                            <span className="font-medium">Loans</span>
                        </Button>
                    </div>

                    <Card className="h-auto bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="p-1 bg-white/20 rounded">✨</div>
                                Business Advisor
                            </CardTitle>
                            <CardDescription className="text-primary-foreground/80">AI-powered financial insights</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10">
                                <p className="text-sm italic">"Based on your cash flow trends, you have a projected surplus of $15k next month. Consider allocating this to a high-yield business savings account to earn 4.5% APY."</p>
                            </div>
                            <Button variant="secondary" className="w-full shadow-md font-semibold text-primary">View detailed analysis</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
