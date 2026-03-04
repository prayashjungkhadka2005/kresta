"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: LucideIcon;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, icon: Icon, ...props }, ref) => {
        return (
            <div className="w-full flex flex-col gap-2">
                {label && (
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {Icon && (
                        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
                    )}
                    <input
                        type={type}
                        className={cn(
                            "flex h-11 w-full rounded-xl border border-zinc-200 bg-surface px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-zinc-300 placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white dark:placeholder:text-zinc-600 dark:focus:ring-white/5 dark:focus:border-zinc-700",
                            Icon && "pl-[2.75rem]",
                            error && "border-red-500 focus:ring-red-500/10 focus:border-red-500 dark:border-red-500",
                            className
                        )}
                        aria-invalid={!!error}
                        ref={ref}
                        {...props}
                    />
                </div>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-xs font-medium text-red-500 ml-1"
                    >
                        {error}
                    </motion.p>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };
