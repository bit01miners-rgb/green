import { Switch, Route } from "wouter";
import { useAuth } from "./hooks/useAuth";
import { AppShell } from "./components/layout/app-shell";
import Dashboard from "./pages/dashboard";
import PersonalFinance from "./pages/personal-finance";
import Trading from "./pages/trading";
import Banking from "./pages/banking";
import Lending from "./pages/lending";
import DeFi from "./pages/defi";
import Swap from "./pages/swap";
import Commercial from "./pages/commercial";
import Invoices from "./pages/invoices";
import AiAdvisor from "./pages/ai-advisor";
import SettingsPage from "./pages/settings";
import Login from "./pages/login";
import Landing from "./pages/landing";
import About from "./pages/about";
import NotFound from "./pages/not-found";
import Compliance from "./pages/compliance";

import PrivacyPool from "@/pages/privacy";
import TokenMinting from "@/pages/mint";
import CollateralOptimizer from "@/pages/collateral";
import FlashLoanExecutor from "@/pages/flash-loan";
import ArbitrageScanner from "@/pages/arbitrage";
import SentimentBot from "@/pages/sentiment";
import AdminDashboard from "@/pages/admin-dashboard";
import P2PTrading from "./pages/p2p";
import Community from "./pages/community";
import TradingBots from "./pages/bots";

function AuthenticatedApp() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/finance" component={PersonalFinance} />
        <Route path="/trading" component={Trading} />
        <Route path="/banking" component={Banking} />
        <Route path="/lending" component={Lending} />
        <Route path="/defi" component={DeFi} />
        <Route path="/swap" component={Swap} />
        <Route path="/commercial" component={Commercial} />
        <Route path="/invoices" component={Invoices} />
        <Route path="/ai" component={AiAdvisor} />
        <Route path="/wallets" component={DeFi} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/compliance" component={Compliance} />

        <Route path="/privacy" component={PrivacyPool} />
        <Route path="/p2p" component={P2PTrading} />
        <Route path="/community" component={Community} />
        <Route path="/bots" component={TradingBots} />
        <Route path="/flash-loan" component={FlashLoanExecutor} />
        <Route path="/collateral" component={CollateralOptimizer} />
        <Route path="/arbitrage" component={ArbitrageScanner} />
        <Route path="/mint" component={TokenMinting} />
        <Route path="/sentiment" component={SentimentBot} />
        <Route path="/admin" component={AdminDashboard} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

export default function App() {
  const { isAuthenticated, user, isLoading } = useAuth();



  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading Green Funds...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/about" component={About} />
        <Route path="/" component={Landing} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return <AuthenticatedApp />;
}
