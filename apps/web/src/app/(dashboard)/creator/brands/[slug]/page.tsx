"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
    Loader2,
    ArrowLeft,
    Globe,
    Instagram,
    Twitter,
    Linkedin,
    Package,
    Store,
    TrendingUp,
    ChevronDown,
    Filter,
    Facebook,
    Music2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Search } from "@/components/ui/Search";
import { ProductCard } from "@/components/features/products/ProductCard";

interface Product {
    id: string;
    name: string;
    description?: string;
    price: string;
    commissionRate: string;
    media: { url: string; type: "IMAGE" | "VIDEO"; order: number }[];
}

interface BrandProfile {
    id: string;
    companyName: string;
    slug: string;
    bio?: string;
    logoUrl?: string;
    bannerUrl?: string;
    websiteUrl?: string;
    instagramUrl?: string;
    facebookUrl?: string;
    tiktokUrl?: string;
    avgCommission: number;
    products: Product[];
}

export default function CreatorBrandDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [searchQuery, setSearchQuery] = useState("");

    const { data: brand, isLoading, error } = useQuery<BrandProfile>({
        queryKey: ["brand-detail", slug],
        queryFn: async () => {
            const response = await api.get(`/brands/${slug}`);
            return response.data.brand;
        },
        enabled: !!slug,
    });

    // Fetch Creator Links to check promoted status
    const { data: promotedIds = new Set<string>() } = useQuery<Set<string>>({
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

    const filteredProducts = brand?.products.filter((p: Product) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const avgCommission = brand?.avgCommission ?? 0;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Loading Brand Profile</p>
            </div>
        );
    }

    if (error || !brand) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] gap-6 text-center px-4">
                <div className="w-20 h-20 rounded-3xl bg-gray-50 dark:bg-zinc-900 flex items-center justify-center border border-gray-100 dark:border-zinc-800">
                    <Store className="w-10 h-10 text-zinc-300" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Brand Intelligence Unavailable</h1>
                    <p className="text-sm text-zinc-500 max-w-sm">We couldn't retrieve the profile for this brand. It may have been removed or the slug is incorrect.</p>
                </div>
                <Link href="/creator/brands">
                    <Button variant="outline" className="gap-2 rounded-xl text-[11px] font-black uppercase tracking-widest">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to Directory
                    </Button>
                </Link>
            </div>
        );
    }

    const socialLinks = [
        { icon: Globe, url: brand.websiteUrl, label: "Website" },
        { icon: Instagram, url: brand.instagramUrl, label: "Instagram" },
        { icon: Facebook, url: brand.facebookUrl, label: "Facebook" },
        { icon: Music2, url: brand.tiktokUrl, label: "TikTok" },
    ].filter(link => link.url);

    return (
        <div className="max-w-7xl mx-auto w-full pb-20 space-y-8">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <Link href="/creator/brands">
                    <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-gray-500 hover:text-gray-900 dark:hover:text-white group">
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        <span className="text-[11px] font-bold uppercase tracking-widest">Directory</span>
                    </Button>
                </Link>
            </div>

            {/* Profile Header Block */}
            <div className="relative rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xl shadow-gray-200/20 dark:shadow-none">
                {/* Banner Image */}
                <div className="relative h-40 md:h-56 w-full bg-gray-50 dark:bg-zinc-800 overflow-hidden">
                    {brand.bannerUrl ? (
                        <Image src={brand.bannerUrl} alt="" fill className="object-cover" priority />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-900 opacity-50" />
                    )}
                    {/* Overlay Shadow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Info Section */}
                <div className="relative px-8 pb-8">
                    {/* Logo - Overlapping Banner */}
                    <div className="absolute -top-12 left-8 z-10">
                        <div className="w-24 h-24 rounded-xl bg-white dark:bg-zinc-900 border-4 border-white dark:border-zinc-900 shadow-xl overflow-hidden flex items-center justify-center">
                            {brand.logoUrl ? (
                                <Image src={brand.logoUrl} alt={brand.companyName} width={96} height={96} className="object-cover w-full h-full" />
                            ) : (
                                <Store className="w-10 h-10 text-zinc-300" />
                            )}
                        </div>
                    </div>

                    <div className="pt-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                        {/* Brand Info */}
                        <div className="space-y-4 max-w-2xl">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    {brand.companyName}
                                </h1>
                                {brand.bio && (
                                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                                        {brand.bio}
                                    </p>
                                )}
                            </div>

                            {/* Social Links & Action */}
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2">
                                    {socialLinks.map((link, i) => (
                                        <Link key={i} href={link.url!} target="_blank">
                                            <Button variant="outline" size="sm" className="w-9 h-9 p-0 rounded-xl border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">
                                                <link.icon className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    ))}
                                </div>
                                <div className="h-4 w-px bg-gray-100 dark:bg-zinc-800 hidden sm:block" />
                                <Link href={`/creator/marketplace?q=${brand.companyName}`}>
                                    <Button className="h-9 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-lg shadow-zinc-200 dark:shadow-none">
                                        Promote Products
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Metrics Grid — Matching Product Detail Style */}
                        <div className="grid grid-cols-2 gap-3 w-full lg:w-80 shrink-0">
                            <div className="bg-gray-50/50 dark:bg-zinc-800/30 border border-zinc-200/50 dark:border-zinc-800/50 p-4 rounded-xl text-center md:text-left">
                                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Products</p>
                                <p className="text-xl font-black text-gray-900 dark:text-white">{brand.products.length}</p>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 p-4 rounded-xl text-center md:text-left">
                                <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">Avg. Commission</p>
                                <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">{avgCommission}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Storefront Product Grid */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                        Storefront
                    </h2>
                    <p className="text-pro-label uppercase font-bold tracking-widest text-gray-400 dark:text-zinc-600">
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                    </p>
                </div>

                {/* Search & Filters Controls */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Search
                            placeholder="Search in this brand..."
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

                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSearchQuery("")}
                            className="text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 h-7 px-3"
                        >
                            Clear Search
                        </Button>
                    )}
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-transparent border border-gray-100 dark:border-zinc-800 rounded-xl">
                        <Package className="w-12 h-12 text-zinc-300 mb-4" />
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">No products found</h3>
                        <p className="text-sm text-zinc-500 max-w-sm text-center">No products matching "{searchQuery}" in this store.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {filteredProducts.map((product: Product) => (
                            <ProductCard
                                key={product.id}
                                product={{
                                    ...product,
                                    brand: {
                                        companyName: brand.companyName,
                                        slug: brand.slug,
                                        logoUrl: brand.logoUrl
                                    }
                                }}
                                isPromoted={promotedIds.has(product.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
