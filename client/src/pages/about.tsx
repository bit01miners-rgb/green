import { Link } from "wouter";
import { Leaf, Award, Target, Users, ArrowRight } from "lucide-react";
import logo from "../assets/logo.svg";

export default function About() {
    return (
        <div className="min-h-screen bg-background font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <Link href="/">
                        <div className="flex items-center gap-2 cursor-pointer">
                            <img src={logo} alt="Green Funds Logo" className="h-10 w-10" />
                            <span className="text-xl font-bold tracking-tight text-foreground/90">Green Funds</span>
                        </div>
                    </Link>
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
            <section className="relative py-24 bg-muted/30">
                <div className="mx-auto max-w-5xl px-6 text-center">
                    <h1 className="text-4xl font-bold tracking-tight mb-6">About Us</h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        We are a global systematic investment manager. Our purpose is to help more and more people experience financial well-being.
                    </p>
                </div>
            </section>

            {/* Principles */}
            <section className="py-24 px-6 mx-auto max-w-7xl">
                <div className="grid md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Target className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Our Purpose</h3>
                        <p className="text-muted-foreground">
                            To help more and more people experience financial well-being. We are dedicated to helping our clients, employees, and communities achieve financial security.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Award className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Our Ambition</h3>
                        <p className="text-muted-foreground">
                            To be the world's most compliant assets related commodities company. We strive for excellence in every aspect of our business.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Our Principles</h3>
                        <p className="text-muted-foreground">
                            Client focus, integrity, excellence, and teamwork are the core values that guide our decision-making and interactions.
                        </p>
                    </div>
                </div>
            </section>

            {/* Sustainability */}
            <section className="py-24 px-6 bg-gradient-to-br from-green-900/10 to-transparent">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600">
                                <Leaf className="h-4 w-4" /> Sustainability
                            </div>
                            <h2 className="text-3xl font-bold">Responsible Investing at Green Funds</h2>
                            <p className="text-lg text-muted-foreground">
                                We integrate environmental, social and governance (ESG) information into our analysis and decision-making across our investment teams and business lines.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="h-6 w-6 mt-1 rounded-full bg-green-500/20 flex items-center justify-center text-green-600 font-bold text-xs">1</div>
                                    <div>
                                        <h4 className="font-bold">ESG Integration</h4>
                                        <p className="text-sm text-muted-foreground">Embedded in our investment process.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="h-6 w-6 mt-1 rounded-full bg-green-500/20 flex items-center justify-center text-green-600 font-bold text-xs">2</div>
                                    <div>
                                        <h4 className="font-bold">Stewardship</h4>
                                        <p className="text-sm text-muted-foreground">Reference for responsible asset ownership.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="flex-1 bg-card border border-border p-8 rounded-2xl shadow-xl">
                            <h3 className="text-xl font-bold mb-4">The Green Funds Way</h3>
                            <p className="text-muted-foreground mb-6">
                                Risk management is at the center of our investment philosophy. We believe that managing risk effectively is essential to achieving consistent long-term returns.
                            </p>
                            <Link href="/register">
                                <span className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors w-full cursor-pointer">
                                    Join Us Today
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border bg-card py-12">
                <div className="mx-auto max-w-7xl px-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <img src={logo} alt="Green Funds Logo" className="h-8 w-8" />
                        <span className="font-bold text-lg">Green Funds</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-8">
                        Based on principles from Grinhold Invest. Securely integrate assets related commodities into your portfolio.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        © 2024 Green Funds. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
