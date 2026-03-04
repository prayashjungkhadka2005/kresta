"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function CreatorRegisterPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: "",
        username: "",
    });

    React.useEffect(() => {
        if (user && !authLoading) {
            router.replace("/dashboard");
        }
    }, [user, authLoading, router]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setFieldErrors({});
        try {
            await api.post("/auth/register/creator", formData);
            router.push("/login?registered=true");
        } catch (err: any) {
            const data = err.response?.data;
            if (data?.errors) {
                setFieldErrors(data.errors);
                setError(data.message || "Please check the fields below");
            } else {
                const message = data?.message || "Registration failed. Please try again.";
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
                className="w-full max-w-[480px] p-8 sm:p-12 rounded-[32px] border border-border-subtle dark:border-zinc-800 bg-white dark:bg-zinc-950/50 shadow-2xl shadow-black/[0.02]"
            >
                <div className="space-y-8">
                    <div className="space-y-4 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-background dark:bg-white dark:text-black transition-all shadow-2xl shadow-black/10">
                            <UserCircle className="h-7 w-7" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black tracking-tighter text-primary dark:text-white transition-colors">
                                Become a Creator
                            </h1>
                            <p className="text-secondary dark:text-zinc-400 font-medium transition-colors">
                                Join Nepal&apos;s fastest growing affiliate network
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            error={fieldErrors.fullName?.[0]}
                            required
                        />
                        <Input
                            label="Username"
                            placeholder="johndoe"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            error={fieldErrors.username?.[0]}
                            required
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            error={fieldErrors.email?.[0]}
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            error={fieldErrors.password?.[0]}
                            required
                        />

                        <Button className="w-full h-12 rounded-2xl font-black shadow-xl shadow-black/10 transition-transform active:scale-[0.98]" isLoading={isLoading} type="submit">
                            Create account
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </form>

                    <p className="text-center text-sm text-secondary dark:text-zinc-400 font-medium transition-colors">
                        Already have an account?{" "}
                        <Link href="/login" className="font-black text-primary hover:underline dark:text-white transition-colors">Sign in</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
