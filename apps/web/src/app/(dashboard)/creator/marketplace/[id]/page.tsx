"use client";

import React, { useState } from "react";
import { ArrowLeft, Package, ExternalLink, Copy, Check, Zap, TrendingUp, MousePointerClick, ShoppingBag, Play, Video } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Product {
    id: string;
    name: string;
    description?: string;
    price: string;
    commissionRate: string;
    productUrl: string;
    status: string;
    approvalStatus: string;
    media: { url: string; type: "IMAGE" | "VIDEO"; order: number }[];
    brand: { companyName: string; logoUrl?: string };
}

interface AffiliateLink {
    id: string;
    refCode: string;
    totalClicks: number;
    totalSales: number;
    totalEarned: string;
    createdAt: string;
}

const VideoPlayer = ({ src }: { src: string }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [progress, setProgress] = useState(0);

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const duration = videoRef.current.duration;
            setProgress((current / duration) * 100);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (videoRef.current) {
            const seekTime = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
            videoRef.current.currentTime = seekTime;
        }
    };

    return (
        <div className="relative w-full h-full group">
            <video
                ref={videoRef}
                src={src}
                autoPlay
                muted
                loop
                playsInline
                onTimeUpdate={handleTimeUpdate}
                className="w-full h-full object-cover"
            />
            {/* Custom Progress Bar Overlay */}
            <div className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center h-1.5">
                {/* Background Track */}
                <div className="absolute inset-0 bg-white/20 rounded-full" />
                {/* Progress Fill */}
                <div
                    className="absolute top-0 left-0 h-full bg-white rounded-full pointer-events-none transition-all duration-100"
                    style={{ width: `${progress}%` }}
                />
                {/* Invisible Input for interaction */}
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={progress}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-full bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-0 [&::-webkit-slider-thumb]:h-0"
                />
            </div>
        </div>
    );
};

export default function MarketplaceProductDetailPage() {
    const params = useParams();
    const productId = params.id as string;
    const queryClient = useQueryClient();

    const [copied, setCopied] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);

    // Fetch Product Data
    const { data: product, isLoading: isLoadingProduct, error: productError } = useQuery<Product>({
        queryKey: ["product", productId],
        queryFn: async () => {
            const response = await api.get(`/products/${productId}`);
            const p = response.data.product;
            const sorted = p.media?.sort((a: any, b: any) => a.order - b.order) || [];
            return { ...p, media: sorted };
        },
    });

    // Fetch Link Status
    const { data: existingLink, isLoading: isLoadingLink } = useQuery<AffiliateLink | null>({
        queryKey: ["creator-link-product", productId],
        queryFn: async () => {
            try {
                const response = await api.get(`/creators/me/links/product/${productId}`);
                return response.data.link;
            } catch {
                return null;
            }
        },
    });

    // Generate Link Mutation
    const generateMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post("/creators/me/links", { productId });
            return response.data.link;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["creator-link-product", productId] });
            queryClient.invalidateQueries({ queryKey: ["creator-links"] });
            queryClient.invalidateQueries({ queryKey: ["creator-links-ids"] });
            toast.success("Your affiliate link is ready!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to generate link");
        },
    });

    const isNotFound = (productError as any)?.response?.status === 404;
    const trackerBaseUrl = process.env.NEXT_PUBLIC_TRACKER_URL || "http://localhost:3002";
    const trackingUrl = existingLink ? `${trackerBaseUrl}/t/${existingLink.refCode}` : "";

    const handleCopy = () => {
        navigator.clipboard.writeText(trackingUrl);
        setCopied(true);
        toast.success("Link copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    if (isNotFound) {
        return (
            <div className="space-y-6 max-w-7xl mx-auto w-full pb-10">
                <Link href="/creator/marketplace" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-white transition-colors group">
                    <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" /> Back to Marketplace
                </Link>
                <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 rounded-xl">
                    <Package className="w-10 h-10 text-gray-300 dark:text-zinc-600 mb-4" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Product not found</h2>
                    <p className="text-gray-400 dark:text-zinc-500 mt-1 text-sm">This product may have been removed.</p>
                </div>
            </div>
        );
    }

    if (isLoadingProduct) {
        return (
            <div className="space-y-6 max-w-7xl mx-auto w-full pb-10">
                <div className="h-4 w-40 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="h-96 bg-gray-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-6 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!product) return null;

    const isUnavailable = product.status !== "ACTIVE" || product.approvalStatus !== "APPROVED";
    const allMedia = product.media || [];
    const estEarning = (parseFloat(product.price) * parseFloat(product.commissionRate) / 100).toLocaleString();

    return (
        <div className="space-y-6 max-w-7xl mx-auto w-full pb-10">
            {/* Breadcrumb */}
            <Link
                href="/creator/marketplace"
                className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-white transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" /> Back to Marketplace
            </Link>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pt-4">
                {/* Left — Image Gallery Sticky */}
                <div className="lg:col-span-5">
                    <div className="lg:sticky lg:top-24 space-y-4 max-w-lg">
                        <div className="relative aspect-square bg-gray-50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                            {allMedia.length > 0 ? (
                                allMedia[selectedImage]?.type === "VIDEO" ? (
                                    <VideoPlayer src={allMedia[selectedImage].url} />
                                ) : (
                                    <img
                                        src={allMedia[selectedImage]?.url}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                )
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-zinc-700 font-bold uppercase tracking-widest text-[10px] flex-col">
                                    <Package className="w-12 h-12 mb-2 opacity-20" />
                                    <span>No Media Available</span>
                                </div>
                            )}
                        </div>
                        {/* Thumbnails */}
                        {allMedia.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                {allMedia.map((m, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(i)}
                                        className={`relative flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === i ? "border-gray-900 dark:border-white shadow-sm" : "border-gray-100 dark:border-zinc-800 opacity-60 hover:opacity-100"}`}
                                    >
                                        {m.type === "VIDEO" ? (
                                            <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                                <Video className="w-6 h-6 text-zinc-400" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                    <Play className="w-4 h-4 text-white fill-white" />
                                                </div>
                                            </div>
                                        ) : (
                                            <img src={m.url} alt="" className="w-full h-full object-cover" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right — Details & CTA (Scrolls naturally) */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Brand + Title */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md border border-gray-200 dark:border-zinc-700/50">
                            {product.brand.companyName}
                        </span>
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white mt-3">
                            {product.name}
                        </h1>
                        {product.description && (
                            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2 leading-relaxed">
                                {product.description}
                            </p>
                        )}
                    </div>

                    {/* Price + Commission Cards */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 p-3 rounded-xl text-center">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-zinc-500 mb-1">Price</p>
                            <p className="text-base font-black text-gray-900 dark:text-white">NPR {parseFloat(product.price).toLocaleString()}</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 p-3 rounded-xl text-center">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-zinc-500 mb-1">Commission</p>
                            <p className="text-base font-black text-emerald-600 dark:text-emerald-400">{product.commissionRate}%</p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 p-3 rounded-xl text-center">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">You Earn</p>
                            <p className="text-base font-black text-emerald-700 dark:text-emerald-300">NPR {estEarning}</p>
                        </div>
                    </div>

                    {/* Product URL */}
                    {product.productUrl && (
                        <a
                            href={product.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-widest"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View on brand website
                        </a>
                    )}

                    {/* Divider */}
                    <div className="border-t border-gray-100 dark:border-zinc-800" />

                    {/* Link Section */}
                    {isLoadingLink ? (
                        <div className="h-20 bg-gray-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
                    ) : isUnavailable ? (
                        /* --- Product Unavailable --- */
                        <div className="bg-gray-50 dark:bg-zinc-800/50 border border-dashed border-gray-200 dark:border-zinc-700 rounded-xl p-5 text-center">
                            <p className="text-sm font-bold text-gray-500 dark:text-zinc-400">Product no longer available</p>
                            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">This product has been paused or removed by the brand. Your existing link stats are still saved.</p>
                        </div>
                    ) : existingLink ? (
                        /* --- Existing Link UI --- */
                        <div className="space-y-4">
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: "Clicks", value: existingLink.totalClicks, icon: MousePointerClick, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
                                    { label: "Sales", value: existingLink.totalSales, icon: ShoppingBag, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10" },
                                    { label: "Earned", value: `NPR ${parseFloat(existingLink.totalEarned).toLocaleString()}`, icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
                                ].map(stat => (
                                    <div key={stat.label} className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 p-3 rounded-xl text-center">
                                        <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                        </div>
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-zinc-500">{stat.label}</p>
                                        <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">{stat.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Copy Box */}
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3">
                                <p className="flex-1 text-xs font-mono text-gray-700 dark:text-zinc-300 truncate">{trackingUrl}</p>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleCopy}
                                    className="shrink-0 gap-2"
                                >
                                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    {copied ? "Copied!" : "Copy"}
                                </Button>
                            </div>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-zinc-500 text-center">
                                Share this link to earn commission on every sale
                            </p>
                        </div>
                    ) : (
                        /* --- Generate Link UI --- */
                        <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-zinc-800/50 border border-dashed border-gray-200 dark:border-zinc-700 rounded-xl p-5 text-center space-y-3">
                                <div className="w-10 h-10 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700 rounded-xl flex items-center justify-center mx-auto">
                                    <Zap className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">You don't have a link yet</p>
                                    <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">Generate your unique tracking link to start earning.</p>
                                </div>
                                <Button
                                    variant="default"
                                    className="w-full"
                                    onClick={() => generateMutation.mutate()}
                                    disabled={generateMutation.isPending}
                                >
                                    {generateMutation.isPending ? "Generating..." : "Generate My Affiliate Link"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
