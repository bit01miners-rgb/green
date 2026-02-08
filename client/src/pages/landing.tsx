import { Link } from "wouter";
import {
  Leaf,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  PiggyBank,
  Landmark,
  Bot,
  CircleDollarSign,
} from "lucide-react";

const features = [
  {
    icon: PiggyBank,
    title: "Personal Finance",
    desc: "Track budgets, expenses, and savings goals with smart categorization.",
  },
  {
    icon: TrendingUp,
    title: "Trading & Investing",
    desc: "Real-time market data, portfolio tracking, and technical analysis.",
  },
  {
    icon: Landmark,
    title: "Banking",
    desc: "Multi-account management, transfers, and transaction history.",
  },
  {
    icon: CircleDollarSign,
    title: "DeFi & Web3",
    desc: "Connect wallets, track DeFi positions, and browse liquidity pools.",
  },
  {
    icon: Bot,
    title: "AI Advisor",
    desc: "Intelligent spending forecasts, risk scoring, and market signals.",
  },
  {
    icon: Shield,
    title: "Commercial Finance",
    desc: "Invoice management, payroll tracking, and cash flow analysis.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">Green Funds</span>
          </div>
          <Link href="/login">
            <span className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer">
              Get Started <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Zap className="h-3.5 w-3.5" />
            DeFi-Powered Fintech Platform
          </div>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
            Your Complete{" "}
            <span className="text-primary">Financial Command Center</span>
          </h1>
          <p className="mb-10 text-lg text-muted-foreground">
            Personal finance, trading, banking, lending, DeFi, and AI-powered
            insights — all in one platform. Track everything. Optimize everything.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/login">
              <span className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer">
                Launch App <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                {f.title}
              </h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>Green Funds — DeFi & Fintech Platform. For demonstration purposes.</p>
      </footer>
    </div>
  );
}
