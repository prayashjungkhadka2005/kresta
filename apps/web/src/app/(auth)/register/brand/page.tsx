"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function BrandRegisterPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        companyName: "",
        websiteUrl: "",
        hasWebsite: true,
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
            await api.post("/auth/register/brand", formData);
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
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6 dark:bg-black">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[400px] space-y-8"
            >
                <div className="space-y-2 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Register as Brand</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Scale your brand with Nepal&apos;s elite creators</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Company Name"
                        placeholder="Kresta Inc."
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        error={fieldErrors.companyName?.[0]}
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        placeholder="brand@example.com"
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
                    <Input
                        label="Website (Optional)"
                        placeholder="https://example.com"
                        value={formData.websiteUrl}
                        onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                        error={fieldErrors.websiteUrl?.[0]}
                    />

                    {/* Error box removed in favor of Toasts */}

                    <Button className="w-full" isLoading={isLoading} type="submit">
                        Create account
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </form>

                <p className="px-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-black underline-offset-4 hover:underline dark:text-white">Sign in</Link>
                </p>
            </motion.div>
        </div>
    );
}
