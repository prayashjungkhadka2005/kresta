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
    const { login } = useAuth();
    const router = useRouter();
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
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6 dark:bg-black">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[400px] space-y-8"
            >
                <div className="space-y-2 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
                        <Lock className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Welcome back
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Enter your credentials to access your dashboard
                    </p>
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
                                className="text-xs font-medium text-zinc-500 hover:text-black dark:hover:text-white"
                            >
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    {/* Error box removed in favor of Toasts */}

                    <Button className="w-full" isLoading={isLoading} type="submit">
                        Sign in
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </form>

                <p className="px-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/register"
                        className="font-semibold text-black underline-offset-4 hover:underline dark:text-white"
                    >
                        Sign up
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
