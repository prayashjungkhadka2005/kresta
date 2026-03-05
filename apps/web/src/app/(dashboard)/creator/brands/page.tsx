"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2, Store, ArrowRight, Package, ShieldCheck, Search as SearchIcon, Filter, ChevronDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Search } from "@/components/ui/Search";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface Brand {
    id: string;
    companyName: string;
    slug: string;
    logoUrl?: string;
    bannerUrl?: string;
    bio?: string;
    _count: {
        products: number;
    };
}

export default function CreatorBrandsPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const { data: brands = [], isLoading } = useQuery<Brand[]>({
        queryKey: ["partner-brands"],
        queryFn: async () => {
            const response = await api.get("/brands");
            return response.data.brands;
        },
    });

    const filteredBrands = brands.filter(brand =>
        brand.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Loading Partner Brands</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto w-full pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">Partner Brands</h1>
                    <p className="text-gray-500 dark:text-zinc-500 mt-1 uppercase text-pro-label font-bold tracking-widest transition-colors">
                        Discover and collaborate with the best brands on Kresta.
                    </p>
                </div>
            </div>

            {/* Controls Row */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm mt-6">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Search
                        placeholder="Search brands..."
                        className="bg-gray-100 dark:bg-zinc-800 border-none rounded-lg flex-1 md:w-80"
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    />
                    <Button variant="outline" size="sm" className="gap-2 border-none bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300">
                        <Filter className="w-4 h-4" />
                        <span>Filters</span>
                        <ChevronDown className="w-4 h-4 opacity-50" />
                    </Button>
                </div>

                <div className="px-1 flex justify-between items-center w-full md:w-auto">
                    <p className="text-pro-label uppercase font-bold tracking-widest text-gray-400 dark:text-zinc-600">
                        {filteredBrands.length} {filteredBrands.length === 1 ? 'brand' : 'brands'} found
                    </p>
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSearchQuery("")}
                            className="text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 h-7 px-3 ml-2"
                        >
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Grid - Expanded grid for wider cards to prevent button overflow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mt-6">
                {filteredBrands.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900/50 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 shadow-sm">
                        <Store className="w-12 h-12 text-zinc-300 mb-4" />
                        <h3 className="text-lg font-bold">No brands available yet</h3>
                        <p className="text-zinc-500 mt-2 text-sm">Check back soon as we onboard new partners!</p>
                    </div>
                ) : (
                    filteredBrands.map((brand) => (
                        <div key={brand.id} className="group flex flex-col bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-100 dark:border-zinc-800 transition-all duration-300 hover:border-gray-200 dark:hover:border-zinc-700 shadow-sm">
                            <div className="p-5 flex flex-col h-full">
                                {/* Header: Inline Logo and Info */}
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="w-14 h-14 shrink-0 rounded-full bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 overflow-hidden flex items-center justify-center text-zinc-400">
                                        {brand.logoUrl ? (
                                            <Image src={brand.logoUrl} alt={brand.companyName} width={56} height={56} className="object-cover w-full h-full" />
                                        ) : (
                                            <Store className="w-6 h-6" />
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                                            {brand.companyName}
                                        </h3>
                                    </div>
                                </div>

                                <div className="mt-auto flex flex-col gap-4">
                                    {/* Metrics */}
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-zinc-400">
                                            <Package className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                                            <span>{brand._count.products} Products</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                            <TrendingUp className="w-3.5 h-3.5" />
                                            <span>15% Commission</span>
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex gap-2">
                                        <Link href={`/creator/brands/${brand.slug}`} className="flex-1">
                                            <Button variant="outline" className="w-full h-9 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-transparent hover:bg-gray-50 dark:hover:bg-zinc-800">
                                                Profile
                                            </Button>
                                        </Link>
                                        <Link href={`/creator/marketplace?q=${brand.companyName}`} className="flex-1">
                                            <Button variant="default" className="w-full h-9 rounded-lg text-[10px] font-bold uppercase tracking-widest gap-2">
                                                Browse
                                                <ArrowRight className="w-3" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
