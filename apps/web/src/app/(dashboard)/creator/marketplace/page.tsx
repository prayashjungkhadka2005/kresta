"use client";

import React from "react";
import { Filter, ShoppingBag, ArrowRight, Package, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Search } from "@/components/ui/Search";
import Link from "next/link";
import { ProductCard } from "@/components/features/products/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface Product {
    id: string;
    name: string;
    description?: string;
    price: string;
    commissionRate: string;
    media: { url: string; type: "IMAGE" | "VIDEO"; order: number }[];
    brand: {
        companyName: string;
        logoUrl?: string;
        slug: string;
    };
}

export default function CreatorMarketplacePage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Get search and tab from URL
    const searchQuery = searchParams.get("q") || "";
    const activeTab = searchParams.get("tab") || "ALL";

    const handleTabChange = (tab: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (tab === "ALL") {
            params.delete("tab");
        } else {
            params.set("tab", tab);
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleSearchChange = (query: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (!query) {
            params.delete("q");
        } else {
            params.set("q", query);
        }
        router.replace(`${pathname}?${params.toString()}`);
    };

    // Fetch Products
    const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
        queryKey: ["marketplace-products"],
        queryFn: async () => {
            const response = await api.get("/products");
            return response.data.products;
        },
    });

    // Fetch Creator Links to check promoted status
    const { data: promotedIds = new Set<string>(), isLoading: linksLoading } = useQuery<Set<string>>({
        queryKey: ["creator-links-ids"],
        queryFn: async () => {
            try {
                const response = await api.get("/creators/me/links");
                return new Set((response.data.links as { product: { id: string } }[]).map((l: any) => l.product.id));
            } catch {
                return new Set<string>();
            }
        },
    });

    const isLoading = productsLoading || linksLoading;

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto w-full pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">Marketplace</h1>
                    <p className="text-gray-500 dark:text-zinc-500 mt-1 uppercase text-pro-label font-bold tracking-widest transition-colors">
                        Discover products and earn commissions.
                    </p>
                </div>
            </div>

            {/* Controls Row */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg self-start md:self-auto">
                    {["ALL", "TRENDING", "HIGH COMMISSION"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`px-4 py-1.5 text-[12px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${activeTab === tab
                                ? "bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm"
                                : "text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Search
                        placeholder="Search brands or products..."
                        className="bg-gray-100 dark:bg-zinc-800 border-none rounded-lg flex-1 md:w-80"
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)}
                    />
                    <Button variant="outline" size="sm" className="gap-2 border-none bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300">
                        <Filter className="w-4 h-4" />
                        <span>Filters</span>
                        <ChevronDown className="w-4 h-4 opacity-50" />
                    </Button>
                </div>
            </div>

            {/* Product Count Indicator */}
            {!isLoading && (
                <div className="px-1 flex justify-between items-center">
                    <p className="text-pro-label uppercase font-bold tracking-widest text-gray-400 dark:text-zinc-600">
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
                    </p>
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSearchChange("")}
                            className="text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 h-7 px-3"
                        >
                            Clear Filter
                        </Button>
                    )}
                </div>
            )}

            {/* Grid Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="h-[300px] rounded-xl bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 animate-pulse" />
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-transparent border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100 dark:border-zinc-700/50">
                        <ShoppingBag className="w-8 h-8 text-gray-400 dark:text-zinc-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">No products found</h3>
                    <p className="text-gray-500 dark:text-zinc-400 mb-6 text-center max-w-sm">Try adjusting your search or browse a different category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            isPromoted={promotedIds.has(product.id)}
                            returnTo={`${pathname}?${searchParams.toString()}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
