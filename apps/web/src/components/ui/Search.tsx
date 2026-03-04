"use client";

import React from "react";
import { Search as SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchProps {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
}

export function Search({
    value,
    onChange,
    placeholder = "Search...",
    className
}: SearchProps) {
    return (
        <div className={cn(
            "flex items-center gap-2.5 bg-gray-50/50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 px-3 py-1.5 rounded-pro group focus-within:bg-white dark:focus-within:bg-black focus-within:border-zinc-300 dark:focus-within:border-zinc-700 focus-within:ring-4 focus-within:ring-black/5 dark:focus-within:ring-white/5",
            className
        )}>
            <SearchIcon className="w-4 h-4 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors flex-shrink-0" />
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="bg-transparent border-none focus:ring-0 outline-none text-[13px] font-medium w-full placeholder:text-gray-400 dark:placeholder:text-zinc-600 dark:text-white transition-colors"
                autoComplete="off"
            />
        </div>
    );
}
