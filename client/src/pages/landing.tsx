import { Link } from "wouter";
import {
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  PieChart,
  Landmark,
  Building,
  Globe,
  Leaf
} from "lucide-react";
import logo from "../assets/logo.svg";

const features = [
  {
    icon: Globe,
    title: "Commodities / Portfolios",
    desc: "Follow your assets, find investment ideas, and spot opportunities in global markets.",
  },
  {
    icon: TrendingUp,
    title: "Stock",
    desc: "Design a unique wealth management strategy tailored to your financial goals.",
  },
  {
    icon: PieChart,
    title: "Fixed Income",
    desc: "Comprehensive approach to private wealth management to help you enjoy your wealth today.",
  },
  {
    icon: Building,
    title: "Real Estate",
    desc: "Exclusive off-market developments with large developers and property portfolios.",
  },
  {
    icon: Landmark,
    title: "Institutional Management",
    desc: "Solid performance and relationships for managing institutional assets.",
  },
  {
    icon: Shield,
    title: "Asset Management",
    desc: "Customized, integrated investment solutions for insurers and pension plans.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Green Funds Logo" className="h-10 w-10" />
            <span className="text-xl font-bold tracking-tight text-foreground/90">Green Funds</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <span className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors cursor-pointer">
                Log In
              </span>
            </Link>
            <Link href="/register">
              <span className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer">
                Get Started <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background z-0" />
        <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Zap className="h-3.5 w-3.5" />
            The world's most compliant assets company
          </div>
          <h1 className="mb-8 text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl leading-[1.1]">
            Securely integrate assets related <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-green-400">commodities</span> into your portfolio
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-xl text-muted-foreground leading-relaxed">
            Earn up to <span className="font-bold text-foreground">0.01 - 1.6% daily</span> trading with us. We work with you to build, grow, and accelerate your brand through strategic asset management.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <span className="flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 cursor-pointer shadow-lg shadow-primary/25">
                Start Investing Now <ArrowRight className="h-5 w-5" />
              </span>
            </Link>
            <Link href="/about">
              <span className="flex items-center gap-2 rounded-xl border border-input bg-background px-8 py-4 text-base font-bold hover:bg-accent transition-colors cursor-pointer">
                Learn More
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-6 py-24 bg-muted/30">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">We deliver unique results</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We render financial help with an extensive variety of instruments, taking due advantage of market volatility to achieve returns.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                {f.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-6">Our Sustainability Strategy</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Governance, Resources, and Partnerships. We integrate environmental, social, and governance (ESG) information into our analysis and decision-making.
            </p>
            <ul className="space-y-6">
              {[
                { title: "ESG Integration", desc: "Decision-making across our investment teams and business lines." },
                { title: "Dedicated Resources", desc: "Developing our sustainability strategy, policy, and research." },
                { title: "Stewardship", desc: "Active stewards of the entities in which we invest." }
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <Leaf className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{item.title}</h4>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative h-[400px] rounded-3xl overflow-hidden bg-gradient-to-br from-green-500/20 to-emerald-900/40 border border-green-500/20 flex items-center justify-center">
            <div className="text-center p-8">
              <p className="text-sm font-medium text-green-400 uppercase tracking-wider mb-2">Sustainable Growth</p>
              <div className="text-5xl font-bold text-white mb-4">1.6%</div>
              <p className="text-white/80">Daily Yield Target</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">What our clients think about us</h2>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card p-6 rounded-2xl border border-border">
            <p className="text-muted-foreground italic mb-6">"My investment experience with Green Funds has been nothing short of amazing, from guiding me in the initial days to streamlining the portfolio at present."</p>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">H</div>
              <div>
                <h4 className="font-bold">Hunter</h4>
                <p className="text-xs text-muted-foreground">Client</p>
              </div>
            </div>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border">
            <p className="text-muted-foreground italic mb-6">"One of the best fiduciary financial services in the industry. The quality of service provided with Automated Fintech tool has given everyone a lot more balance."</p>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">I</div>
              <div>
                <h4 className="font-bold">Irene</h4>
                <p className="text-xs text-muted-foreground">Web Developer</p>
              </div>
            </div>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border">
            <p className="text-muted-foreground italic mb-6">"I have found the company’s advice regarding investment opportunities particularly helpful – everything is explained fully, no matter how complex the subject."</p>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">W</div>
              <div>
                <h4 className="font-bold">Walker</h4>
                <p className="text-xs text-muted-foreground">Client</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-6 grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Green Funds Logo" className="h-8 w-8" />
              <span className="font-bold text-lg">Green Funds</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Securely integrate assets related commodities into your portfolio.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Commodities</li>
              <li>Stocks</li>
              <li>Fixed Income</li>
              <li>Real Estate</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>About Us</li>
              <li>Sustainability</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Risk Disclosure</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>© 2024 Green Funds. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
