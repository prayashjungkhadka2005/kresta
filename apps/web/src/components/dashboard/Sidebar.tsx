"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ChevronRight,
    LogOut,
    LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface SidebarLink {
    label: string;
    href: string;
    icon: LucideIcon;
}

interface SidebarProps {
    links: SidebarLink[];
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ links, isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-950 border-r border-gray-100 dark:border-zinc-800 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 overflow-y-auto transition-colors",
                isOpen ? "translate-x-0 shadow-2xl lg:shadow-none" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    {/* Brand Logo Section */}
                    <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-zinc-800 transition-colors">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2.5 group"
                        >
                            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center transition-all group-hover:scale-105">
                                <span className="text-white dark:text-black font-black text-base transition-colors">K</span>
                            </div>
                            <span className="text-base font-black tracking-tighter dark:text-white transition-colors">KRESTA</span>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 p-4 space-y-1">
                        {links.map((link) => {
                            const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm font-medium transition-all relative overflow-hidden group/item",
                                        isActive
                                            ? "bg-gray-100/80 text-gray-900 dark:bg-white/10 dark:text-white"
                                            : "text-gray-600 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900"
                                    )}
                                >
                                    <link.icon className={cn(
                                        "w-[18px] h-[18px] transition-colors",
                                        isActive
                                            ? "text-gray-900 dark:text-white"
                                            : "text-gray-400 dark:text-zinc-600 group-hover/item:text-gray-900 dark:group-hover/item:text-white"
                                    )} />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-gray-100 dark:border-zinc-800 transition-colors">
                        <button
                            onClick={logout}
                            className="flex w-full items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all group"
                        >
                            <LogOut className="w-[18px] h-[18px] transition-transform group-hover:-translate-x-1" />
                            Log Out
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
