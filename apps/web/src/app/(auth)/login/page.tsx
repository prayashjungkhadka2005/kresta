"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
    const { user, isLoading: authLoading, login } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (user && !authLoading) {
            router.replace("/dashboard");
        }
    }, [user, authLoading, router]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setFieldErrors({});
        try {
            await login({ email, password });
            toast.success("Welcome back!");
            router.push("/dashboard");
        } catch (err: any) {
            const data = err.response?.data;
            if (err.response?.status === 401) {
                toast.error("Invalid email or password");
                setError("Invalid email or password");
            } else if (data?.errors) {
                setFieldErrors(data.errors);
                setError(data.message || "Check your credentials");
            } else {
                const message = data?.message || "Something went wrong. Please try again.";
                toast.error(message);
                setError(message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-6 transition-colors duration-500">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[440px] p-8 sm:p-12 rounded-[32px] border border-border-subtle dark:border-zinc-800 bg-white dark:bg-zinc-950/50 shadow-2xl shadow-black/[0.02]"
            >
                <div className="space-y-8">
                    <div className="space-y-4 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-background dark:bg-white dark:text-black transition-all shadow-2xl shadow-black/10">
                            <Lock className="h-7 w-7" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black tracking-tighter text-primary dark:text-white transition-colors">
                                Welcome back
                            </h1>
                            <p className="text-secondary dark:text-zinc-400 font-medium transition-colors">
                                Enter your credentials to access Kresta
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={fieldErrors.email?.[0]}
                            required
                            autoComplete="email"
                        />
                        <div className="space-y-1">
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={fieldErrors.password?.[0]}
                                required
                                autoComplete="current-password"
                            />
                            <div className="flex justify-end">
                                <Link
                                    href="/forgot-password"
                                    className="text-xs font-bold text-muted hover:text-primary dark:text-zinc-500 dark:hover:text-white transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <Button className="w-full h-12 rounded-2xl font-black shadow-xl shadow-black/10 transition-transform active:scale-[0.98]" isLoading={isLoading} type="submit">
                            Sign in
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </form>

                    <p className="text-center text-sm text-secondary dark:text-zinc-400 font-medium transition-colors">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/register"
                            className="font-black text-primary hover:underline dark:text-white transition-colors"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
