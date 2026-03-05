"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigationStore, StackItem } from "@/lib/navigation";

interface BackButtonProps {
    fallbackHref: string;
    label?: string;
    className?: string;
    iconClassName?: string;
}

export function BackButton({
    fallbackHref,
    label,
    className,
    iconClassName
}: BackButtonProps) {
    const router = useRouter();
    const [prevPage, setPrevPage] = useState<StackItem | null>(null);

    // Resolve stack entry on client-side to prevent hydration mismatch
    useEffect(() => {
        setPrevPage(navigationStore.peekStack());
    }, []);

    const displayLabel = label || prevPage?.label || "Back";

    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault();

        if (prevPage) {
            router.push(prevPage.url);
            return;
        }

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
            {displayLabel}
        </button>
    );
}
