"use client";

import { Loader2 } from "lucide-react";

export function PageLoader({ message = "Loading..." }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 animate-in fade-in duration-700">
            <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-zinc-100 dark:border-zinc-800 transition-colors" />
                <Loader2 className="w-12 h-12 text-zinc-900 dark:text-white animate-spin absolute top-0 left-0 border-t-2 border-transparent rounded-full" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500">
                {message}
            </p>
        </div>
    );
}
