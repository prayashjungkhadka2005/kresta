"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Building2, UserCircle, ArrowRight } from "lucide-react";

export default function RegisterTypePage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6 dark:bg-black">
            <div className="w-full max-w-[800px] space-y-12">
                <div className="space-y-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl"
                    >
                        How will you use Kresta?
                    </motion.h1>
                    <p className="mx-auto max-w-[450px] text-lg text-zinc-500 dark:text-zinc-400">
                        Select your account type to get started with Nepal&apos;s leading affiliate network.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Link href="/register/brand" className="group">
                        <motion.div
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            className="relative h-full space-y-4 rounded-3xl border border-zinc-200 bg-white p-8 transition-shadow hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900 transition-colors group-hover:bg-black group-hover:text-white dark:bg-zinc-900 dark:text-zinc-50 dark:group-hover:bg-white dark:group-hover:text-black">
                                <Building2 className="h-7 w-7" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold dark:text-zinc-50">I am a Brand</h3>
                                <p className="text-zinc-500 dark:text-zinc-400">
                                    Boost your sales by connecting with Nepal&apos;s top content creators and influencers.
                                </p>
                            </div>
                            <div className="flex items-center text-sm font-semibold group-hover:underline">
                                Register as Brand
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </div>
                        </motion.div>
                    </Link>

                    <Link href="/register/creator" className="group">
                        <motion.div
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            className="relative h-full space-y-4 rounded-3xl border border-zinc-200 bg-white p-8 transition-shadow hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900 transition-colors group-hover:bg-black group-hover:text-white dark:bg-zinc-900 dark:text-zinc-50 dark:group-hover:bg-white dark:group-hover:text-black">
                                <UserCircle className="h-7 w-7" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold dark:text-zinc-50">I am a Creator</h3>
                                <p className="text-zinc-500 dark:text-zinc-400">
                                    Monetize your audience by promoting quality Nepali products through affiliate links.
                                </p>
                            </div>
                            <div className="flex items-center text-sm font-semibold group-hover:underline">
                                Become a Creator
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </div>
                        </motion.div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
