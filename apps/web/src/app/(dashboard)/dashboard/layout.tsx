"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    CreditCard,
    ShoppingBag,
    Link as LinkIcon,
    DollarSign
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const brandLinks = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Products", href: "/dashboard/products", icon: Package },
    { label: "Campaigns", href: "/dashboard/campaigns", icon: Users },
    { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
    { label: "Payouts", href: "/dashboard/payouts", icon: CreditCard },
];

const creatorLinks = [
    { label: "Analytics", href: "/dashboard", icon: LayoutDashboard },
    { label: "Marketplace", href: "/marketplace", icon: ShoppingBag },
    { label: "My Links", href: "/creator/links", icon: LinkIcon },
    { label: "Earnings", href: "/creator/earnings", icon: DollarSign },
    { label: "Payouts", href: "/creator/payouts", icon: CreditCard },
];

export default function UnifiedDashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const links = user.role === "brand" ? brandLinks : creatorLinks;

    return (
        <DashboardShell sidebarLinks={links}>
            {children}
        </DashboardShell>
    );
}
