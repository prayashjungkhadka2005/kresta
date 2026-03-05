"use client";

import { DashboardShell } from "@/components/shared/dashboard/DashboardShell";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    CreditCard,
    ShoppingBag,
    Link as LinkIcon,
    DollarSign,
    Settings,
    Store
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const brandLinks = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Products", href: "/dashboard/products", icon: Package },
    { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
    { label: "Payouts", href: "/dashboard/payouts", icon: CreditCard },
    { label: "Store Profile", href: "/dashboard/profile", icon: Settings },
];

const creatorLinks = [
    { label: "Analytics", href: "/dashboard", icon: LayoutDashboard },
    { label: "Marketplace", href: "/creator/marketplace", icon: ShoppingBag },
    { label: "Partner Brands", href: "/creator/brands", icon: Store },
    { label: "My Links", href: "/creator/links", icon: LinkIcon },
    { label: "Earnings", href: "/creator/earnings", icon: DollarSign },
    { label: "Payouts", href: "/creator/payouts", icon: CreditCard },
];

import { PageTransition } from "@/components/shared/PageTransition";
import { PageLoader } from "@/components/shared/PageLoader";

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
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black transition-colors duration-500">
                <PageLoader />
            </div>
        );
    }

    const links = user.role === "brand" ? brandLinks : creatorLinks;

    return (
        <DashboardShell sidebarLinks={links}>
            <PageTransition>
                {children}
            </PageTransition>
        </DashboardShell>
    );
}
