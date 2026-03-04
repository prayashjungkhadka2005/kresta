"use client";

import { useAuth } from "@/context/AuthContext";
import { TrendingUp, Link as LinkIcon, ShoppingBag, Zap, DollarSign, Megaphone, ShoppingCart, Users } from "lucide-react";

export default function UnifiedDashboardPage() {
    const { user } = useAuth();

    if (user?.role === "brand") {
        return <BrandOverview user={user} />;
    }

    return <CreatorOverview user={user} />;
}

function BrandOverview({ user }: { user: any }) {
    return (
        <div className="space-y-6 lg:space-y-8">
            <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">Welcome back, {user?.companyName}</h1>
                <p className="text-gray-500 dark:text-zinc-500 mt-1 uppercase text-pro-label font-bold tracking-widest transition-colors">Brand Performance Overview</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Revenue", value: "NPR 0", trend: "+0%", icon: DollarSign, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-500/10" },
                    { label: "Active Campaigns", value: "0", trend: "+0%", icon: Megaphone, color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-50 dark:bg-purple-500/10" },
                    { label: "Total Orders", value: "0", trend: "+0%", icon: ShoppingCart, color: "text-green-600 dark:text-green-400", bgColor: "bg-green-50 dark:bg-green-500/10" },
                    { label: "Affiliates", value: "0", trend: "+0%", icon: Users, color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-50 dark:bg-orange-500/10" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-3">
                            <div className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center transition-colors`}>
                                <stat.icon className={`w-5 h-5 ${stat.color} transition-colors`} />
                            </div>
                            <span className="text-[10px] font-bold bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50 px-2 py-0.5 rounded text-gray-500 dark:text-zinc-400 transition-colors">30D</span>
                        </div>
                        <p className="text-pro-label font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest transition-colors">{stat.label}</p>
                        <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white transition-colors">{stat.value}</p>
                        <p className="text-[12px] font-medium text-green-600 dark:text-green-500 mt-2">{stat.trend} <span className="text-gray-400 dark:text-zinc-500">vs last month</span></p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm min-h-[400px] flex items-center justify-center transition-colors">
                    <p className="text-gray-400 dark:text-zinc-600 font-bold uppercase tracking-widest text-sm transition-colors">Revenue Chart Placeholder</p>
                </div>
                <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm min-h-[400px] flex items-center justify-center transition-colors">
                    <p className="text-gray-400 dark:text-zinc-600 font-bold uppercase tracking-widest text-sm transition-colors">Recent Activity</p>
                </div>
            </div>
        </div>
    );
}

function CreatorOverview({ user }: { user: any }) {
    return (
        <div className="space-y-6 lg:space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">How's it going, {user?.fullName?.split(' ')[0]}?</h1>
                    <p className="text-gray-500 dark:text-zinc-500 mt-1 uppercase text-pro-label font-bold tracking-widest transition-colors">Creator Insights & Earnings</p>
                </div>
                <div className="flex gap-2">
                    <div className="px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-pro-label font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors shadow-sm">
                        <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        Pro Creator
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Earnings", value: "NPR 0", trend: "+0%", icon: DollarSign, color: "text-green-600 dark:text-green-400", bgColor: "bg-green-50 dark:bg-green-500/10" },
                    { label: "Active Links", value: "0", trend: "+0%", icon: LinkIcon, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-500/10" },
                    { label: "Total Clicks", value: "0", trend: "+0%", icon: Zap, color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-50 dark:bg-purple-500/10" },
                    { label: "Marketplace Items", value: "10+", trend: "New", icon: ShoppingBag, color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-50 dark:bg-orange-500/10" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900/50 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-3">
                            <div className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center transition-colors`}>
                                <stat.icon className={`w-5 h-5 ${stat.color} transition-colors`} />
                            </div>
                            <span className="text-[10px] font-bold bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50 px-2 py-0.5 rounded text-gray-500 dark:text-zinc-400 transition-colors">30D</span>
                        </div>
                        <p className="text-pro-label font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest transition-colors">{stat.label}</p>
                        <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white transition-colors">{stat.value}</p>
                        <p className="text-[12px] font-medium text-green-600 dark:text-green-500 mt-2">{stat.trend} <span className="text-gray-400 dark:text-zinc-500 transition-colors">vs last period</span></p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm min-h-[320px] flex flex-col items-center justify-center text-center space-y-4 transition-colors">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-zinc-800/50 rounded-xl flex items-center justify-center border border-gray-100 dark:border-zinc-700/50 transition-colors">
                        <TrendingUp className="w-6 h-6 text-gray-400 dark:text-zinc-500 transition-colors" />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-zinc-400 font-bold uppercase text-pro-label tracking-widest transition-colors">Earnings Over Time</p>
                        <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1 transition-colors">Start promoting products to see your growth!</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col min-h-[320px] transition-colors">
                    <h3 className="text-sm font-bold mb-4 text-gray-900 dark:text-white transition-colors uppercase tracking-widest">Top Performing Categories</h3>
                    <div className="flex-1 flex items-center justify-center text-center transition-colors">
                        <p className="text-gray-400 dark:text-zinc-600 font-bold uppercase tracking-widest text-pro-label transition-colors">No data available</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
