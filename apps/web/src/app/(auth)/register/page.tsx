"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Building2, UserCircle, ArrowRight } from "lucide-react";

export default function RegisterTypePage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (user && !authLoading) {
            router.replace("/dashboard");
        }
    }, [user, authLoading, router]);

    return (
        <div className="flex min-h-screen items-center justify-center p-6 transition-colors duration-500">
            <div className="w-full max-w-[800px] space-y-12">
                <div className="space-y-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-4xl font-black tracking-tighter text-primary dark:text-white sm:text-5xl transition-colors"
                    >
                        How will you use Kresta?
                    </motion.h1>
                    <p className="mx-auto max-w-[450px] text-lg text-secondary dark:text-zinc-400 font-medium transition-colors">
                        Select your account type to get started with Nepal&apos;s leading affiliate network.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Link href="/register/brand" className="group">
                        <motion.div
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            className="relative h-full space-y-4 rounded-[40px] border border-border-subtle bg-white dark:bg-zinc-900/50 dark:border-zinc-800 p-10 transition-all hover:shadow-2xl hover:shadow-black/[0.03] dark:hover:shadow-black/20"
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface text-primary transition-colors group-hover:bg-primary group-hover:text-background dark:bg-zinc-800 dark:text-zinc-200 dark:group-hover:bg-white dark:group-hover:text-black">
                                <Building2 className="h-8 w-8" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black dark:text-white transition-colors">I am a Brand</h3>
                                <p className="text-secondary dark:text-zinc-400 font-medium leading-relaxed transition-colors">
                                    Boost your sales by connecting with Nepal&apos;s top content creators and influencers.
                                </p>
                            </div>
                            <div className="flex items-center text-sm font-black uppercase tracking-widest text-primary dark:text-white group-hover:underline pt-4">
                                Register as Brand
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </motion.div>
                    </Link>

                    <Link href="/register/creator" className="group">
                        <motion.div
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            className="relative h-full space-y-4 rounded-[40px] border border-border-subtle bg-white dark:bg-zinc-900/50 dark:border-zinc-800 p-10 transition-all hover:shadow-2xl hover:shadow-black/[0.03] dark:hover:shadow-black/20"
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface text-primary transition-colors group-hover:bg-primary group-hover:text-background dark:bg-zinc-800 dark:text-zinc-200 dark:group-hover:bg-white dark:group-hover:text-black">
                                <UserCircle className="h-8 w-8" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black dark:text-white transition-colors">I am a Creator</h3>
                                <p className="text-secondary dark:text-zinc-400 font-medium leading-relaxed transition-colors">
                                    Monetize your audience by promoting quality Nepali products through affiliate links.
                                </p>
                            </div>
                            <div className="flex items-center text-sm font-black uppercase tracking-widest text-primary dark:text-white group-hover:underline pt-4">
                                Become a Creator
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </motion.div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
