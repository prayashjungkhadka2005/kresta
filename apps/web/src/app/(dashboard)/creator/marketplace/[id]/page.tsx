"use client";

import React, { useState } from "react";
import { ArrowLeft, Star, Share2, ShieldCheck, Globe, Info, MessageCircle, Package, ExternalLink, ChevronRight, Store, Copy, Check, Zap, TrendingUp, MousePointerClick, ShoppingBag, Play, Video, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Tooltip } from "@/components/ui/Tooltip";
import { BackButton } from "@/components/shared/ui/BackButton";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RelatedProducts } from "@/components/features/products/RelatedProducts";

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
    brand: {
        id: string;
        companyName: string;
        logoUrl?: string;
        slug: string;
    };
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
    const router = useRouter();
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
                <BackButton fallbackHref="/creator/marketplace" />
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
            <BackButton
                fallbackHref="/creator/marketplace"
            />

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
                {/* Left — Image Gallery Column */}
                <div className="lg:col-span-5">
                    <div className="border border-gray-100 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden p-6 space-y-6 flex flex-col">
                        <div className="relative aspect-square bg-gray-50 dark:bg-zinc-900/50 rounded-lg overflow-hidden flex-shrink-0">
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
                        {allMedia.length > 0 && (
                            <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar flex-shrink-0">
                                {allMedia.map((m, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(i)}
                                        className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === i ? "border-gray-900 dark:border-white shadow-sm" : "border-gray-100 dark:border-zinc-800 opacity-60 hover:opacity-100"}`}
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
                        {/* Media content */}
                    </div>
                </div>

                {/* Right — Details & CTA Column */}
                <div className="lg:col-span-7 lg:sticky lg:top-8">
                    <div className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
                        {/* Detail Header */}
                        <div className="p-6 space-y-6">
                            {/* Brand + Title Group */}
                            <div className="space-y-4">
                                <Link
                                    href={`/creator/brands/${product.brand.slug}`}
                                    className="inline-flex items-center gap-2.5 group/brand bg-gray-50/50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800/50 pl-1.5 pr-4 py-1.5 rounded-full transition-all hover:bg-gray-100 dark:hover:bg-zinc-800/50 hover:border-zinc-200 dark:hover:border-zinc-700"
                                >
                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm">
                                        {product.brand.logoUrl ? (
                                            <img src={product.brand.logoUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Store className="w-4 h-4 text-zinc-400" />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase font-black tracking-[0.2em] text-zinc-400 dark:text-zinc-500 leading-none mb-0.5">
                                            Partner Brand
                                        </span>
                                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-none">
                                            {product.brand.companyName}
                                        </span>
                                    </div>
                                </Link>

                                <h1 className="text-xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    {product.name}
                                </h1>

                            </div>

                            {/* Price + Commission Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="bg-gray-50/50 dark:bg-zinc-800/30 border border-zinc-200/50 dark:border-zinc-800/50 p-4 rounded-xl">
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Price</p>
                                    <p className="text-lg font-black text-gray-900 dark:text-white">NPR {parseFloat(product.price).toLocaleString()}</p>
                                </div>
                                <div className="bg-gray-50/50 dark:bg-zinc-800/30 border border-zinc-200/50 dark:border-zinc-800/50 p-4 rounded-xl">
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Commission</p>
                                    <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{product.commissionRate}%</p>
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 p-4 rounded-xl">
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">You Earn</p>
                                    <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">NPR {estEarning}</p>
                                </div>
                            </div>

                            {/* External Button */}
                            {product.productUrl && (
                                <a
                                    href={product.productUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Verify on brand website
                                </a>
                            )}
                        </div>

                        {/* Affiliate/Tool Section */}
                        <div className="border-t border-zinc-200/60 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-800/10 p-6 flex-1">
                            {isLoadingLink ? (
                                <div className="h-32 bg-gray-100 dark:bg-zinc-800/50 rounded-xl animate-pulse" />
                            ) : isUnavailable ? (
                                <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center max-w-md mx-auto">
                                    <Package className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                                    <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">Product Unavailable</p>
                                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">This campaign has ended or is currently paused by the brand.</p>
                                </div>
                            ) : existingLink ? (
                                <div className="space-y-6">
                                    {/* Link Stats Group */}
                                    <div className="grid grid-cols-3 gap-6">
                                        {[
                                            { label: "Clicks", value: existingLink.totalClicks, icon: MousePointerClick, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
                                            { label: "Sales", value: existingLink.totalSales, icon: ShoppingBag, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10" },
                                            { label: "Earned", value: `NPR ${parseFloat(existingLink.totalEarned).toLocaleString()}`, icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
                                        ].map(stat => (
                                            <div key={stat.label} className="text-center group/stat">
                                                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover/stat:scale-110`}>
                                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                                </div>
                                                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500">{stat.label}</p>
                                                <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">{stat.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Link Management Box */}
                                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6 space-y-4">
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-3">
                                                <h3 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 dark:text-zinc-400">Your Tracking Link</h3>
                                                <Tooltip content="Share this link to earn commission automatically">
                                                    <Info className="w-3 h-3 text-zinc-400 cursor-help" />
                                                </Tooltip>
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                                <div className="flex-1 w-full bg-gray-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 px-4 py-2.5 rounded-lg text-xs font-mono text-zinc-600 dark:text-zinc-300 truncate">
                                                    {trackingUrl}
                                                </div>
                                                <Button
                                                    onClick={handleCopy}
                                                    className="w-full sm:w-auto shrink-0 gap-2 h-10"
                                                >
                                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                    {copied ? "Copied" : "Copy Link"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CTA content */}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-6 text-center space-y-3 shadow-sm">
                                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto border border-emerald-100 dark:border-emerald-500/20">
                                        <Zap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Start Earning Points</h3>
                                        <p className="text-xs text-zinc-400 dark:text-zinc-500">Generate your tracking link to start promoting this product.</p>
                                    </div>
                                    <Button
                                        className="w-full h-11 text-xs font-bold uppercase tracking-widest"
                                        onClick={() => generateMutation.mutate()}
                                        disabled={generateMutation.isPending}
                                    >
                                        {generateMutation.isPending ? "Starting..." : "Get My Partner Link"}
                                    </Button>
                                </div>
                            )}
                        </div>
                        {/* CTA content */}
                    </div>
                </div>
            </div>

            {/* Product Description - Full Width */}
            {product.description && (
                <div className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 rounded-xl p-8 shadow-sm space-y-4">
                    <h2 className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500">About the Product</h2>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                        {product.description}
                    </p>
                </div>
            )}

            {/* Related Products */}
            <div className="pt-10 border-t border-gray-100 dark:border-zinc-800/50">
                <RelatedProducts
                    currentProductId={product.id}
                    brandId={product.brand.id}
                    brandName={product.brand.companyName}
                />
            </div>
        </div>
    );
}
