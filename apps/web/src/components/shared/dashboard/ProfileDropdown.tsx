"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserCircle, LogOut, Settings, User, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileDropdown() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Area */}
            <div
                className={cn(
                    "flex items-center gap-3 pl-2 pr-1 py-1 rounded-pro cursor-pointer transition-all border border-transparent",
                    isOpen
                        ? "bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"
                        : "hover:bg-gray-50/50 dark:hover:bg-zinc-900/50"
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="text-right hidden sm:block">
                    <p className="text-[13px] font-bold text-gray-900 dark:text-white leading-none transition-colors">
                        {user?.companyName || user?.fullName}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-50 dark:bg-zinc-900 rounded-pro flex items-center justify-center border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-all">
                        {user?.logoUrl ? (
                            <img src={user.logoUrl} alt="profile" className="w-full h-full object-cover" />
                        ) : (
                            <UserCircle className="w-[18px] h-[18px] text-gray-400 transition-colors" />
                        )}
                    </div>
                    <ChevronDown className={cn(
                        "w-4 h-4 text-gray-400 dark:text-zinc-500 transition-transform duration-200",
                        isOpen && "rotate-180"
                    )} />
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-gray-100 dark:border-zinc-800/50">
                        <p className="text-[13px] font-bold text-gray-900 dark:text-white truncate">
                            {user?.fullName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-zinc-500 truncate mt-0.5">
                            {user?.email}
                        </p>
                    </div>

                    <div className="p-1.5">
                        <button className="w-full flex items-center gap-2.5 px-3 py-2 text-pro-ui font-medium text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-md transition-all">
                            <User className="w-[16px] h-[16px]" />
                            My Profile
                        </button>
                        <button className="w-full flex items-center gap-2.5 px-3 py-2 text-pro-ui font-medium text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-md transition-all">
                            <Settings className="w-[16px] h-[16px]" />
                            Account Settings
                        </button>
                    </div>

                    <div className="p-1.5 border-t border-gray-100 dark:border-zinc-800/50">
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-pro-ui font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-all group"
                        >
                            <LogOut className="w-[16px] h-[16px] transition-transform group-hover:-translate-x-1" />
                            Log Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
