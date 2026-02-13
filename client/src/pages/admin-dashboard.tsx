import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Save,
    ShieldAlert,
    Cpu,
    Activity,
    Settings,
    Users,
    MoreVertical,
    Trash2,
    Shield
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
    id: number;
    email: string;
    name: string;
    role: "user" | "admin";
    createdAt: string;
}

export default function AdminDashboard() {
    const { user: currentUser } = useAuth();
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Protect Route
    useEffect(() => {
        if (currentUser && currentUser.role !== "admin") {
            setLocation("/");
            toast({
                title: "Access Denied",
                description: "You do not have permission to view the Admin Panel.",
                variant: "destructive"
            });
        }
    }, [currentUser, setLocation, toast]);

    // Fetch Users
    const { data: users, isLoading } = useQuery<User[]>({
        queryKey: ["/api/admin/users"],
        enabled: currentUser?.role === "admin",
    });

    // Update Role Mutation
    const updateRoleMutation = useMutation({
        mutationFn: async ({ userId, role }: { userId: number; role: "user" | "admin" }) => {
            const res = await apiRequest(`/api/admin/users/${userId}/role`, {
                method: "PATCH",
                body: JSON.stringify({ role }),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            toast({ title: "Role Updated", description: "User role has been updated successfully." });
        },
        onError: (error: any) => {
            toast({ title: "Update Failed", description: error.message, variant: "destructive" });
        }
    });

    // Delete User Mutation
    const deleteUserMutation = useMutation({
        mutationFn: async (userId: number) => {
            await apiRequest(`/api/admin/users/${userId}`, {
                method: "DELETE",
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            toast({ title: "User Deleted", description: "User has been permanently removed." });
        },
        onError: (error: any) => {
            toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
        }
    });

    // Local state for system config (placeholder for now)
    const [config, setConfig] = useState({
        maintenanceMode: false,
        tradingEnabled: true,
        aiArbitrageEnabled: true,
        platformFeePct: 0.1,
        maxLoanLTV: 75,
        minCreditScore: 600,
        riskLevel: "moderate"
    });

    // Load config from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("green-funds-admin-config");
        if (saved) {
            try { setConfig(JSON.parse(saved)); } catch (e) { console.error(e); }
        }
    }, []);

    const handleSaveConfig = () => {
        localStorage.setItem("green-funds-admin-config", JSON.stringify(config));
        toast({ title: "Settings Saved", description: "System configuration updated." });
    };

    if (!currentUser || currentUser.role !== "admin") return null;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 container mx-auto p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
                    <p className="text-muted-foreground">
                        Manage users, configure platform settings, and monitor system health.
                    </p>
                </div>
                <Button onClick={handleSaveConfig}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </div>

            <Tabs defaultValue="users" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="users">User Management</TabsTrigger>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="fees">Fees & Limits</TabsTrigger>
                    <TabsTrigger value="modules">Module Control</TabsTrigger>
                    <TabsTrigger value="risk">Risk & Compliance</TabsTrigger>
                </TabsList>

                {/* USER MANAGEMENT TAB */}
                <TabsContent value="users" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Users Directory</CardTitle>
                            <CardDescription>Manage user access and roles.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-4">Loading users...</TableCell></TableRow>
                                    ) : users?.map((u) => (
                                        <TableRow key={u.id}>
                                            <TableCell className="font-medium">{u.name}</TableCell>
                                            <TableCell>{u.email}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {u.role.toUpperCase()}
                                                </span>
                                            </TableCell>
                                            <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {u.role !== 'admin' ? (
                                                            <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ userId: u.id, role: 'admin' })}>
                                                                <Shield className="mr-2 h-4 w-4" /> Make Admin
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ userId: u.id, role: 'user' })}>
                                                                <Shield className="mr-2 h-4 w-4" /> Revoke Admin
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-600"
                                                            onClick={() => deleteUserMutation.mutate(u.id)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete User
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* GENERAL SETTINGS TAB */}
                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Platform Status</CardTitle>
                            <CardDescription>Control the overall availability of the Green Funds platform.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Maintenance Mode</Label>
                                    <p className="text-sm text-muted-foreground">Disable all user actions.</p>
                                </div>
                                <Switch
                                    checked={config.maintenanceMode}
                                    onCheckedChange={(c) => setConfig({ ...config, maintenanceMode: c })}
                                />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Global Trading</Label>
                                    <p className="text-sm text-muted-foreground">Enable or disable all trading activities.</p>
                                </div>
                                <Switch
                                    checked={config.tradingEnabled}
                                    onCheckedChange={(c) => setConfig({ ...config, tradingEnabled: c })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* FEES & LIMITS TAB */}
                <TabsContent value="fees" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Fee Configuration</CardTitle>
                            <CardDescription>Set the platform fees for various protocol interactions.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Platform Swap Fee (%)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        value={config.platformFeePct}
                                        onChange={(e) => setConfig({ ...config, platformFeePct: parseFloat(e.target.value) })}
                                    />
                                    <div className="flex items-center text-sm text-muted-foreground">%</div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Max Loan-to-Value (LTV) %</Label>
                                <Input
                                    type="number"
                                    value={config.maxLoanLTV}
                                    onChange={(e) => setConfig({ ...config, maxLoanLTV: parseFloat(e.target.value) })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* MODULES TAB */}
                <TabsContent value="modules" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Feature Modules</CardTitle>
                            <CardDescription>Enable or disable specific "God Mode" features.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between space-x-2">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-blue-500" />
                                    <div className="space-y-0.5">
                                        <Label className="text-base">AI Arbitrage Scanner</Label>
                                        <p className="text-sm text-muted-foreground">Background price scanning service.</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={config.aiArbitrageEnabled}
                                    onCheckedChange={(c) => setConfig({ ...config, aiArbitrageEnabled: c })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* RISK TAB */}
                <TabsContent value="risk" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Risk Management</CardTitle>
                            <CardDescription>Configure AI risk scoring parameters.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Minimum Credit Score for Lending</Label>
                                <Input
                                    type="number"
                                    value={config.minCreditScore}
                                    onChange={(e) => setConfig({ ...config, minCreditScore: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Global Risk Tolerance</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={config.riskLevel}
                                    onChange={(e) => setConfig({ ...config, riskLevel: e.target.value })}
                                >
                                    <option value="low">Low (Conservative)</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="high">High (Aggressive)</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
