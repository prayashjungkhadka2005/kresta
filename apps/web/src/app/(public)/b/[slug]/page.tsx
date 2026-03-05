"use client";

import React from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import {
    Instagram,
    Twitter,
    Link as LinkIcon,
    Globe,
    ArrowRight,
    Package,
    ShieldCheck,
    Linkedin
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

interface ProductMedia {
    url: string;
    order: number;
}

interface Product {
    id: string;
    name: string;
    price: string;
    commissionRate: number;
    media: ProductMedia[];
}

interface BrandProfile {
    companyName: string;
    logoUrl?: string;
    websiteUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    linkedinUrl?: string;
    bio?: string;
    products: Product[];
}

export default function BrandProfilePage() {
    const params = useParams();
    const slug = params.slug as string;

    const { data, isLoading, error } = useQuery<BrandProfile>({
        queryKey: ["public-brand-profile", slug],
        queryFn: async () => {
            const response = await api.get(`/brands/${slug}`);
            return response.data.brand;
        },
        enabled: !!slug,
    });

    if (isLoading) return null;

    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950 p-6">
                <Package className="w-12 h-12 text-zinc-200 mb-4" />
                <h1 className="text-xl font-bold">Brand not found</h1>
                <p className="text-zinc-500 mt-2">The storefront you are looking for doesn't exist or has moved.</p>
                <Link href="/">
                    <Button className="mt-8 px-8">Return Home</Button>
                </Link>
            </div>
        );
    }

    const brand = data;
    const products = brand.products || [];

    return (
        <div className="min-h-screen bg-white dark:bg-black font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-500 pb-20 pt-24">
            {/* Profile Header Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                        {/* Logo */}
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-white dark:bg-zinc-900 border-4 border-white dark:border-black shadow-2xl overflow-hidden flex items-center justify-center group">
                            {brand.logoUrl ? (
                                <Image src={brand.logoUrl} alt={brand.companyName} width={160} height={160} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <span className="text-4xl font-black italic">{brand.companyName.charAt(0)}</span>
                            )}
                        </div>

                        {/* Text Info */}
                        <div className="space-y-3 pb-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white">
                                    {brand.companyName}
                                </h1>
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 shadow-lg shadow-blue-500/20">
                                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                                {brand.websiteUrl && (
                                    <a href={brand.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors">
                                        <Globe className="w-4 h-4" />
                                        Official Website
                                    </a>
                                )}
                                <div className="flex items-center gap-3">
                                    {brand.instagramUrl && (
                                        <a href={brand.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-black dark:hover:text-white transition-colors">
                                            <Instagram className="w-4 h-4" />
                                        </a>
                                    )}
                                    {brand.twitterUrl && (
                                        <a href={brand.twitterUrl} target="_blank" rel="noopener noreferrer" className="hover:text-black dark:hover:text-white transition-colors">
                                            <Twitter className="w-4 h-4" />
                                        </a>
                                    )}
                                    {brand.linkedinUrl && (
                                        <a href={brand.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-black dark:hover:text-white transition-colors">
                                            <Linkedin className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pb-2">
                        <Button className="rounded-xl px-8 h-12 font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black hover:scale-105 transition-transform active:scale-95 shadow-xl">
                            Follow Brand
                        </Button>
                    </div>
                </div>

                {/* Bio & Details */}
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-zinc-100 dark:border-zinc-900 pt-12">
                    <div className="lg:col-span-1 space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">About the Brand</h3>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg font-medium italic border-l-4 border-zinc-100 dark:border-zinc-900 pl-6">
                                {brand.bio || `Welcome to the official ${brand.companyName} storefront. Discover our curated collection of premium products and exclusive deals.`}
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Products</p>
                                <p className="text-2xl font-bold mt-1">{products.length}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Creators</p>
                                <p className="text-2xl font-bold mt-1">120+</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">Product Catalog</h2>
                            <div className="h-[1px] flex-1 mx-8 bg-zinc-100 dark:bg-zinc-900" />
                        </div>

                        {products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 dark:bg-zinc-900/30 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                                <Package className="w-12 h-12 text-zinc-300 mb-4" />
                                <h3 className="text-lg font-bold">No products cataloged yet</h3>
                                <p className="text-zinc-500 mt-2">Check back soon for new arrivals!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {products.map((product: any) => (
                                    <Link key={product.id} href={`/p/${product.id}`} className="group">
                                        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-black dark:hover:border-white hover:-translate-y-1">
                                            <div className="aspect-[4/5] relative overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                                                {product.media && product.media.length > 0 ? (
                                                    <Image
                                                        src={product.media.sort((a: any, b: any) => a.order - b.order)[0].url}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                                        <Package className="w-12 h-12" />
                                                    </div>
                                                )}
                                                <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl">
                                                    <p className="text-xs font-black tracking-tight">NPR {parseFloat(product.price).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white truncate group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
                                                    {product.name}
                                                </h3>
                                                <div className="mt-4 flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full">
                                                        {product.commissionRate}% Commission
                                                    </span>
                                                    <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-black dark:group-hover:text-white transition-all transform group-hover:translate-x-1" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Brand Footer */}
            <div className="mt-32 pt-16 border-t border-zinc-100 dark:border-zinc-900 max-w-7xl mx-auto px-4">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-10 h-10 rounded-xl bg-black dark:bg-white flex items-center justify-center shadow-lg">
                        <span className="text-white dark:text-black font-black italic">K</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">
                        Kresta Commerce Infrastructure
                    </p>
                </div>
            </div>
        </div>
    );
}
