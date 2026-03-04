"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { LucideIcon } from "lucide-react";

interface SidebarLink {
    label: string;
    href: string;
    icon: LucideIcon;
}

interface DashboardShellProps {
    children: React.ReactNode;
    sidebarLinks: SidebarLink[];
}

export function DashboardShell({ children, sidebarLinks }: DashboardShellProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-zinc-950/30 overflow-hidden transition-colors duration-500">
            {/* Sidebar Component */}
            <Sidebar
                links={sidebarLinks}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Application Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Navbar Component */}
                <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:px-6 md:py-6 custom-scrollbar bg-transparent transition-colors">
                    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {children}
                    </div>
                </main>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #d1d5db;
                }
            `}</style>
        </div>
    );
}
