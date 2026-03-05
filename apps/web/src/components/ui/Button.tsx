"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    variant?: "default" | "outline" | "ghost" | "danger";
    size?: "default" | "sm" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, children, isLoading, variant = "default", size = "default", disabled, ...props }, ref) => {
        const variants = {
            default: "bg-primary text-background hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200",
            outline: "bg-transparent border-2 border-border-subtle text-foreground hover:bg-surface dark:border-zinc-800 dark:text-white dark:hover:bg-zinc-900",
            ghost: "bg-transparent text-foreground hover:bg-surface-alt dark:text-white dark:hover:bg-zinc-900",
            danger: "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
        };

        const sizes = {
            default: "h-11 px-8 text-sm",
            sm: "h-9 px-4 text-[13px]",
            lg: "h-12 px-10 text-base",
        };

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center rounded-xl font-medium transition-all outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 active:scale-95",
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                disabled={isLoading || disabled}
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-inherit" />
                ) : (
                    children
                )}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button };
