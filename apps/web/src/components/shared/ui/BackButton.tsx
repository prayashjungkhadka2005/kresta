"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
    fallbackHref: string;
    label?: string;
    className?: string;
    iconClassName?: string;
}

/**
 * Reusable BackButton component that intelligently handles navigation.
 * It checks for context in the URL (e.g., ?fromTab=...) and falls back 
 * to a provided default or browser history.
 */
export function BackButton({
    fallbackHref,
    label = "Back",
    className,
    iconClassName
}: BackButtonProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault();

        // 1. Check for specific context in query params
        const from = searchParams.get("from");
        const fromTab = searchParams.get("fromTab");
        const q = searchParams.get("q");

        // Priority 1: Generic 'from' path (useful for cross-section navigation)
        if (from) {
            try {
                const target = decodeURIComponent(from);
                router.push(target);
                return;
            } catch (e) {
                console.error("Failed to decode back button path", e);
            }
        }

        // Priority 2: Dashboard context (tabs/search)
        if (fromTab || q) {
            let target = fallbackHref;
            const params = new URLSearchParams();

            if (fromTab) params.set("tab", fromTab);
            if (q) params.set("q", q);

            const queryString = params.toString();
            router.push(`${target}${queryString ? `?${queryString}` : ""}`);
            return;
        }

        // 2. If we have browser history, use it (industry standard for "Back")
        // Note: In Next.js, we don't always know the history state reliably 
        // without custom wrappers, but router.back() is the standard approach.
        // If we want a hard redirect to the fallback, we can ignore router.back().
        // For dashboard items, hard-linking to the list is usually safer.
        router.push(fallbackHref);
    };

    return (
        <button
            onClick={handleBack}
            className={cn(
                "inline-flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-white transition-colors group",
                className
            )}
        >
            <ArrowLeft className={cn("w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1", iconClassName)} />
            {label}
        </button>
    );
}
