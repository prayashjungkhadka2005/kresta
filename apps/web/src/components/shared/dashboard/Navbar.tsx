"use client";

import React from "react";
import { Menu, Bell, UserCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ProfileDropdown } from "./ProfileDropdown";
import { Search } from "@/components/ui/Search";

interface NavbarProps {
    onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
    const { user } = useAuth();

    return (
        <header className="h-16 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-100 dark:border-zinc-800 px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
            {/* Left: Mobile Menu */}
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-gray-500 hover:text-black dark:text-zinc-400 dark:hover:text-white lg:hidden transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            {/* Right: Search, Notifications & User Profile */}
            <div className="flex items-center gap-3">
                <Search className="hidden md:flex flex-1 max-w-md mr-2" />

                <button className="p-2 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-pro relative text-gray-400 hover:text-black dark:hover:text-white transition-all">
                    <Bell className="w-[18px] h-[18px]" />
                    <span className="absolute top-2.5 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white dark:border-black transition-colors" />
                </button>

                <div className="h-5 w-px bg-gray-200 dark:bg-zinc-800 transition-colors mx-1" />

                <ProfileDropdown />
            </div>
        </header>
    );
}
