import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, ShieldAlert, FileText, Activity, Lock } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface ComplianceStats {
    riskScore: number;
    riskLevel: string;
    kycStatus: string;
    alertsCount: number;
    lastScreeningString: string;
}

interface ComplianceCheck {
    name: string;
    status: string;
    date: string;
}

interface ComplianceAlert {
    type: string;
    message: string;
    severity: string;
}

interface ComplianceData {
    stats: ComplianceStats;
    checks: ComplianceCheck[];
    alerts: ComplianceAlert[];
    transactionVolume24h: number;
}

export default function Compliance() {
    const { data: compliance, isLoading } = useQuery<ComplianceData>({
        queryKey: ["/api/compliance/dashboard"],
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!compliance) return <div>No data available</div>;

    const { stats, checks, alerts } = compliance;

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case "high": return "destructive";
            case "medium": return "warning"; // Need to ensure variant exists or use custom className
            case "low": return "secondary";
            default: return "default";
        }
    };

    return (
        <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Compliance Center</h2>
                    <p className="text-muted-foreground">Monitor risk, AML alerts, and regulatory reporting.</p>
                </div>
                <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Export Audit Log
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.riskScore}</div>
                        <p className="text-xs text-muted-foreground">
                            Level: <span className={stats.riskLevel === 'High' ? 'text-red-500 font-bold' : 'text-green-500'}>{stats.riskLevel}</span>
                        </p>
                        <Progress value={stats.riskScore / 8.5} className="mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.alertsCount}</div>
                        <p className="text-xs text-muted-foreground">Requires attention</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">KYC Status</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.kycStatus}</div>
                        <p className="text-xs text-muted-foreground">Last verified: {new Date(stats.lastScreeningString).toLocaleDateString()}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
                        <Lock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${compliance.transactionVolume24h.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground"> monitored transactions</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="alerts">Alerts</TabsTrigger>
                    <TabsTrigger value="checks">Verification Checks</TabsTrigger>
                    <TabsTrigger value="reports">Regulatory Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Compliance Alerts</CardTitle>
                            <CardDescription>
                                System generated alerts based on transaction patterns and list screenings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Severity</TableHead>
                                        <TableHead>Message</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {alerts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center">No active alerts. Good job!</TableCell>
                                        </TableRow>
                                    ) : (
                                        alerts.map((alert, i) => (
                                            <TableRow key={i}>
                                                <TableCell>{alert.type}</TableCell>
                                                <TableCell>
                                                    <Badge variant={alert.severity === 'High' ? "destructive" : "secondary"}>
                                                        {alert.severity}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{alert.message}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                {/* Other tabs can be implemented similarly */}
            </Tabs>
        </div>
    );
}
