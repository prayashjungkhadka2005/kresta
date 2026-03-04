"use client";

import Link from "next/link";
import { ArrowRight, Zap, Shield, TrendingUp, ShoppingBag, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen font-sans selection:bg-primary selection:text-background transition-colors duration-500">
      {/* Header / Nav */}
      <header className="fixed top-0 w-full z-50 bg-background/80 dark:bg-black/80 backdrop-blur-xl border-b border-border-subtle dark:border-zinc-800 px-8 py-4 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary dark:bg-white rounded-xl flex items-center justify-center transition-colors">
            <span className="text-background dark:text-black font-black text-xl">K</span>
          </div>
          <span className="text-xl font-black tracking-tighter text-primary dark:text-white">KRESTA</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="font-bold">Log In</Button>
          </Link>
          <Link href="/register">
            <Button className="font-bold rounded-2xl shadow-xl shadow-black/10">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="pt-32">
        {/* Hero Section */}
        <section className="px-8 max-w-6xl mx-auto text-center space-y-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-surface dark:bg-zinc-900 rounded-full text-[10px] font-black uppercase tracking-widest border border-border-subtle dark:border-zinc-800 transition-colors"
          >
            <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            Next-Gen Affiliate Marketing in Nepal
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-primary dark:text-white transition-colors"
          >
            SCALE YOUR <br />
            <span className="text-zinc-300 dark:text-zinc-700 italic font-serif">INFLUENCE.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-secondary dark:text-zinc-400 text-xl font-medium transition-colors"
          >
            The ultimate platform connecting premium Nepalese brands with elite creators.
            Automated tracking, instant payouts, and zero friction.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link href="/marketplace">
              <Button className="h-16 px-10 rounded-3xl text-lg font-black gap-3 shadow-2xl shadow-black/20 hover:scale-[1.02] transition-transform">
                Explore Marketplace
                <ShoppingBag className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/register/brand">
              <Button variant="outline" className="h-16 px-10 rounded-3xl text-lg font-black border-2 transition-all">
                List as a Brand
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="px-8 max-w-6xl mx-auto py-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Smart Tracking",
              desc: "Advanced attribution system that never misses a click or a conversion.",
              icon: Globe,
              color: "text-blue-500"
            },
            {
              title: "Instant Payouts",
              desc: "Direct integration with eSewa & Khalti for lightning-fast withdrawals.",
              icon: TrendingUp,
              color: "text-green-500"
            },
            {
              title: "Trusted Network",
              desc: "Only verified brands and creators. High-quality inventory only.",
              icon: Shield,
              color: "text-purple-500"
            }
          ].map((feature, i) => (
            <div key={i} className="p-10 rounded-[40px] bg-surface dark:bg-zinc-900/50 border border-border-subtle dark:border-zinc-800 space-y-4 hover:bg-white dark:hover:bg-zinc-900 hover:shadow-2xl hover:shadow-black/[0.02] dark:hover:shadow-black/50 transition-all group">
              <feature.icon className={`w-10 h-10 ${feature.color}`} />
              <h3 className="text-2xl font-black tracking-tight text-primary dark:text-white transition-colors">{feature.title}</h3>
              <p className="text-secondary dark:text-zinc-400 font-medium leading-relaxed transition-colors">{feature.desc}</p>
            </div>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle dark:border-zinc-800 py-12 px-8 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center transition-colors">
              <span className="text-white dark:text-black font-black text-sm transition-colors">K</span>
            </div>
            <span className="font-black tracking-tighter text-primary dark:text-white transition-colors">KRESTA</span>
          </div>
          <p className="text-muted dark:text-zinc-500 text-sm font-bold uppercase tracking-widest transition-colors">
            © 2026 Kresta Technologies. All Rights Reserved.
          </p>
          <div className="flex gap-6">
            {["Twitter", "LinkedIn", "Instagram"].map(s => (
              <a key={s} href="#" className="text-sm font-black text-primary dark:text-zinc-400 hover:text-muted dark:hover:text-white transition-colors">{s}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
