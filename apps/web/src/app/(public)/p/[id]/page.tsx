"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import {
    ShoppingCart,
    Share2,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    Play,
    ExternalLink,
    Package
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function PublicProductPage() {
    const params = useParams();
    const productId = params.id as string;
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);

    const { data: product, isLoading, error } = useQuery({
        queryKey: ["public-product", productId],
        queryFn: async () => {
            const response = await api.get(`/products/${productId}`);
            return response.data.product;
        },
        enabled: !!productId,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-zinc-200 dark:border-zinc-800 border-t-black dark:border-t-white animate-spin" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Loading Experience</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950 p-6">
                <Package className="w-12 h-12 text-zinc-200 mb-4" />
                <h1 className="text-xl font-bold">Product not found</h1>
                <p className="text-zinc-500 mt-2">The link you followed may be incorrect or expired.</p>
                <Button className="mt-8 px-8" onClick={() => window.history.back()}>Go Back</Button>
            </div>
        );
    }

    const activeMedia = product.media?.[activeMediaIndex] || product.media?.[0];

    return (
        <div className="min-h-screen bg-white dark:bg-black font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-500">
            {/* Minimal Sticky Header */}
            <div className="sticky top-0 z-50 w-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-900 px-6 py-4 transition-colors duration-500">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer" onClick={() => window.location.href = "/"}>
                            <span className="text-white dark:text-black font-black text-sm italic">K</span>
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white">Kresta</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

                    {/* Media Gallery Section */}
                    <div className="space-y-6">
                        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 group shadow-2xl transition-all duration-700 border border-zinc-100 dark:border-zinc-900">
                            {activeMedia?.type === "IMAGE" ? (
                                <Image
                                    src={activeMedia.url}
                                    alt={product.name}
                                    fill
                                    priority
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Play className="w-16 h-16 text-white fill-white opacity-40" />
                                    <p className="absolute bottom-10 text-[10px] font-bold text-white uppercase tracking-widest bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">Video Experience</p>
                                </div>
                            )}

                            {/* Gallery Navigation */}
                            <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setActiveMediaIndex(prev => Math.max(0, prev - 1))}
                                    className="p-3 rounded-full bg-white/20 backdrop-blur-xl text-white hover:bg-white/40 transition-colors"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={() => setActiveMediaIndex(prev => Math.min((product.media?.length || 1) - 1, prev + 1))}
                                    className="p-3 rounded-full bg-white/20 backdrop-blur-xl text-white hover:bg-white/40 transition-colors"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
                            {product.media?.sort((a: any, b: any) => a.order - b.order).map((m: any, idx: number) => (
                                <button
                                    key={m.url}
                                    onClick={() => setActiveMediaIndex(idx)}
                                    className={cn(
                                        "relative flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden border-2 transition-all duration-300",
                                        activeMediaIndex === idx
                                            ? "border-black dark:border-white shadow-lg scale-105"
                                            : "border-transparent opacity-60 hover:opacity-100"
                                    )}
                                >
                                    <Image src={m.url} alt="" fill className="object-cover" />
                                    {m.type === "VIDEO" && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <Play className="w-4 h-4 text-white fill-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-col">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Link href={`/b/${product.brand.slug}`} className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 px-4 py-2 rounded-2xl hover:bg-white dark:hover:bg-zinc-800 transition-all hover:shadow-xl group">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
                                        {product.brand.logoUrl ? (
                                            <Image src={product.brand.logoUrl} alt={product.brand.companyName} width={32} height={32} />
                                        ) : (
                                            <span className="text-[10px] font-black italic">{product.brand.companyName.charAt(0)}</span>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-900 dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors">
                                        {product.brand.companyName}
                                    </span>
                                </Link>
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Official Product</span>
                            </div>

                            <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
                                {product.name}
                            </h1>
                        </div>

                        <div className="mt-8 space-y-6">
                            <div className="flex items-baseline gap-4">
                                <span className="text-3xl font-bold tracking-tighter text-zinc-900 dark:text-white">
                                    NPR {parseFloat(product.price).toLocaleString()}
                                </span>
                                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full">
                                    Inclusive of Tax
                                </span>
                            </div>

                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg font-medium italic border-l-4 border-zinc-100 dark:border-zinc-900 pl-6">
                                "{product.description}"
                            </p>
                        </div>

                        {/* Purchase Actions */}
                        <div className="mt-12 space-y-4">
                            <a href={product.productUrl} target="_blank" rel="noopener noreferrer">
                                <Button className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black hover:scale-[1.02] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl">
                                    <ShoppingCart className="w-5 h-5" />
                                    Buy it now
                                    <ExternalLink className="w-4 h-4 opacity-50 ml-2" />
                                </Button>
                            </a>
                        </div>

                        {/* Trust Badges */}
                        <div className="mt-12 grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-4 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 transition-colors hover:bg-white dark:hover:bg-zinc-900 hover:shadow-xl group">
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-md transition-transform group-hover:rotate-12">
                                    <ShieldCheck className="w-5 h-5 text-black dark:text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Secure</p>
                                    <p className="text-[9px] font-bold text-zinc-400">Protected link</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 transition-colors hover:bg-white dark:hover:bg-zinc-900 hover:shadow-xl group">
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-md transition-transform group-hover:rotate-12">
                                    <Package className="w-5 h-5 text-black dark:text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Official</p>
                                    <p className="text-[9px] font-bold text-zinc-400">Brand direct</p>
                                </div>
                            </div>
                        </div>

                        {/* Brand Footer */}
                        <div className="mt-auto pt-16 border-t border-zinc-100 dark:border-zinc-900 mt-16 pb-8">
                            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-400 text-center">
                                Distributed via Kresta Infrastructure
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
