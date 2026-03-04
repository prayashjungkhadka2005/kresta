"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";

export function GlobalSearch() {
    const [query, setQuery] = useState("");

    return (
        <div className="hidden md:flex flex-1 max-w-md items-center gap-2.5 bg-gray-50/50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 px-3 py-1.5 rounded-pro group focus-within:bg-white dark:focus-within:bg-black transition-all mr-2">
            <Search className="w-4 h-4 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="bg-transparent border-none focus:ring-0 outline-none text-[13px] font-medium w-full placeholder:text-gray-400 dark:placeholder:text-zinc-600 dark:text-white transition-colors"
                autoComplete="off"
            />
            {/* Future expansion: Add Cmd+K shortcut hint here or a dropdown for search results */}
        </div>
    );
}
