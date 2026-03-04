"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, ...props }, ref) => {
        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    className={cn(
                        "flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-white disabled:cursor-not-allowed disabled:opacity-50",
                        error && "border-red-500 focus:ring-red-500/30 ring-2 ring-red-500/20",
                        className
                    )}
                    aria-invalid={!!error}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-xs font-medium text-red-500"
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
