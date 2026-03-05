"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
    Loader2,
    ArrowLeft,
    ArrowRight,
    Globe,
    Instagram,
    Twitter,
    Linkedin,
    Package,
    ExternalLink,
    Store,
    Star,
    TrendingUp,
    ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

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
    twitterUrl?: string;
    tiktokUrl?: string;
    linkedinUrl?: string;
    products: Product[];
}

export default function CreatorBrandDetailPage() {
    const params = useParams();
    const slug = params.slug as string;

    const { data: brand, isLoading, error } = useQuery<BrandProfile>({
        queryKey: ["brand-detail", slug],
        queryFn: async () => {
            const response = await api.get(`/brands/${slug}`);
            return response.data.brand;
        },
        enabled: !!slug,
    });

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
        { icon: Twitter, url: brand.twitterUrl, label: "Twitter" },
        { icon: Linkedin, url: brand.linkedinUrl, label: "LinkedIn" },
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

            {/* Profile Header */}
            <div className="rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 shrink-0 rounded-full bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 overflow-hidden flex items-center justify-center text-zinc-400">
                            {brand.logoUrl ? (
                                <Image src={brand.logoUrl} alt={brand.companyName} width={80} height={80} className="object-cover w-full h-full" />
                            ) : (
                                <Store className="w-8 h-8" />
                            )}
                        </div>
                        <div>
                            <div className="mb-2">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{brand.companyName}</h1>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-zinc-500">
                                <div className="flex items-center gap-1.5">
                                    <Package className="w-4 h-4" />
                                    <span className="font-medium">{brand.products.length} Products</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="font-medium">15% Max Commission</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {socialLinks.map((link, i) => (
                            <Link key={i} href={link.url!} target="_blank">
                                <Button variant="outline" size="default" className="w-10 h-10 p-0 rounded-lg border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all text-gray-600 dark:text-zinc-400">
                                    <link.icon className="w-4.5 h-4.5" />
                                </Button>
                            </Link>
                        ))}
                        <Link href={`/creator/marketplace?q=${brand.companyName}`}>
                            <Button className="h-10 px-6 rounded-lg text-[11px] font-bold uppercase tracking-widest gap-2 ml-2">
                                Promote Products
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Storefront Full-Width Product Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                        All Products
                    </h2>
                </div>

                {brand.products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-gray-50/50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800">
                        <Package className="w-12 h-12 text-zinc-300 mb-4" />
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">No active products</h3>
                        <p className="text-sm text-zinc-500 max-w-sm text-center">This brand hasn't listed any products for promotion yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {brand.products.map((product) => (
                            <Link key={product.id} href={`/creator/marketplace/${product.id}`}>
                                <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-100 dark:border-zinc-800 overflow-hidden hover:border-gray-200 dark:hover:border-zinc-700 transition-colors shadow-sm flex flex-col h-full">
                                    <div className="aspect-[4/3] relative bg-gray-50 dark:bg-zinc-800 border-b border-gray-100 dark:border-zinc-800 shrink-0">
                                        {product.media && product.media.length > 0 ? (
                                            <Image src={product.media[0].url} alt={product.name} fill className="object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Package className="w-8 h-8 text-zinc-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 flex flex-col h-full">
                                        <div className="flex justify-between items-start gap-2 mb-3">
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug">{product.name}</h3>
                                        </div>

                                        <div className="mt-auto flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                <TrendingUp className="w-3.5 h-3.5" />
                                                <span>{product.commissionRate}% Commission</span>
                                            </div>
                                            <p className="text-xs font-bold text-gray-500 dark:text-zinc-500">NPR {parseFloat(product.price).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
