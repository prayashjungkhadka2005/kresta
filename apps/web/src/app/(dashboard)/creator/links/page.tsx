"use client";

import React, { useState } from "react";
import { Link as LinkIcon, Copy, Check, ExternalLink, Package, Search as SearchIcon, Trash2, MousePointerClick, ShoppingBag, TrendingUp, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Search } from "@/components/ui/Search";
import Link from "next/link";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface AffiliateLink {
    id: string;
    refCode: string;
    totalClicks: number;
    totalSales: number;
    totalEarned: string;
    createdAt: string;
    product: {
        id: string;
        name: string;
        price: string;
        commissionRate: string;
        productUrl?: string;
        status: string;
        approvalStatus: string;
        brand: { companyName: string; logoUrl?: string };
        media: { url: string; type: "IMAGE" | "VIDEO"; order: number }[];
    };
}

export default function CreatorLinksPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const trackerBaseUrl = process.env.NEXT_PUBLIC_TRACKER_URL || "http://localhost:3002";

    // Fetch Links
    const { data: links = [], isLoading } = useQuery<AffiliateLink[]>({
        queryKey: ["creator-links"],
        queryFn: async () => {
            const response = await api.get("/creators/me/links");
            return response.data.links;
        },
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (linkId: string) => {
            await api.delete(`/creators/me/links/${linkId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["creator-links"] });
            queryClient.invalidateQueries({ queryKey: ["creator-links-ids"] }); // Sync Marketplace too
            toast.success("Link removed");
        },
        onError: () => {
            toast.error("Failed to remove link");
        },
    });

    const filteredLinks = links.filter(l =>
        l.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.product.brand.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCopy = (link: AffiliateLink) => {
        const url = `${trackerBaseUrl}/t/${link.refCode}`;
        navigator.clipboard.writeText(url);
        setCopiedId(link.id);
        toast.success("Link copied!");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = async (link: AffiliateLink) => {
        const confirmed = window.confirm(`Remove your link for "${link.product.name}"? This cannot be undone.`);
        if (!confirmed) return;
        deleteMutation.mutate(link.id);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto w-full pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">My Links</h1>
                    <p className="text-gray-500 dark:text-zinc-500 mt-1 uppercase text-pro-label font-bold tracking-widest transition-colors">
                        Your affiliate links and performance
                    </p>
                </div>
                <Link href="/creator/marketplace">
                    <Button variant="default" size="sm" className="gap-2">
                        Browse Marketplace
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                </Link>
            </div>

            {/* Controls Row */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Search
                        placeholder="Search products or brands..."
                        className="bg-gray-100 dark:bg-zinc-800 border-none rounded-lg flex-1 md:w-80"
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    />
                </div>
                {!isLoading && (
                    <p className="text-pro-label uppercase font-bold tracking-widest text-gray-400 dark:text-zinc-600 shrink-0">
                        {filteredLinks.length} {filteredLinks.length === 1 ? "link" : "links"}
                    </p>
                )}
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-28 rounded-xl bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 animate-pulse" />
                    ))}
                </div>
            ) : filteredLinks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-transparent border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100 dark:border-zinc-700/50">
                        <LinkIcon className="w-8 h-8 text-gray-300 dark:text-zinc-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">No links yet</h3>
                    <p className="text-gray-400 dark:text-zinc-500 mt-1 text-sm text-center max-w-xs">
                        {searchQuery ? "No links match your search." : "Browse the Marketplace and promote products to generate your first affiliate link."}
                    </p>
                    {!searchQuery && (
                        <Link href="/creator/marketplace" className="mt-4">
                            <Button variant="default" size="sm" className="gap-2">
                                Go to Marketplace <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredLinks.map(link => {
                        const coverImage = link.product.media.sort((a, b) => a.order - b.order)[0]?.url;
                        const trackingUrl = `${trackerBaseUrl}/t/${link.refCode}`;
                        const estEarning = (parseFloat(link.product.price) * parseFloat(link.product.commissionRate) / 100).toLocaleString();
                        const status = link.product.status ?? "ACTIVE";
                        const approvalStatus = link.product.approvalStatus ?? "APPROVED";
                        const isUnavailable = status !== "ACTIVE" || approvalStatus !== "APPROVED";

                        return (
                            <div key={link.id} className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden">
                                <div className="flex items-stretch">
                                    {/* Product Thumbnail */}
                                    <div className="w-24 md:w-28 shrink-0 bg-gray-50 dark:bg-zinc-800/50 border-r border-gray-100 dark:border-zinc-800">
                                        {coverImage ? (
                                            <img src={coverImage} alt={link.product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-6 h-6 text-gray-300 dark:text-zinc-600" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Link Info */}
                                    <div className="flex-1 min-w-0 p-4 flex flex-col justify-between gap-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-zinc-500">
                                                        {link.product.brand.companyName}
                                                    </span>
                                                    {isUnavailable && (
                                                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                                                            Unavailable
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className={`text-sm font-bold leading-tight truncate mt-0.5 ${isUnavailable ? "text-gray-400 dark:text-zinc-600" : "text-gray-900 dark:text-white"}`}>
                                                    {link.product.name}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {!isUnavailable && link.product.productUrl && (
                                                    <a href={link.product.productUrl} target="_blank" rel="noopener noreferrer">
                                                        <Button variant="outline" size="sm" className="gap-1.5 border-none bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300 h-8 text-xs">
                                                            <ExternalLink className="w-3 h-3" />
                                                        </Button>
                                                    </a>
                                                )}
                                                <Link href={`/creator/marketplace/${link.product.id}`}>
                                                    <Button variant="outline" size="sm" className="border-none bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300 h-8 text-xs">
                                                        View
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(link)}
                                                    disabled={deleteMutation.isPending && deleteMutation.variables === link.id}
                                                    className="border-none bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 dark:text-red-400 h-8"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Stats Row */}
                                        <div className="flex flex-wrap items-center gap-4">
                                            {[
                                                { label: "Clicks", value: link.totalClicks, icon: MousePointerClick },
                                                { label: "Sales", value: link.totalSales, icon: ShoppingBag },
                                                { label: "Earned", value: `NPR ${parseFloat(link.totalEarned).toLocaleString()}`, icon: TrendingUp },
                                                { label: "Per Sale", value: `NPR ${estEarning}`, icon: null },
                                            ].map(stat => (
                                                <div key={stat.label} className="flex items-center gap-1.5">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">{stat.label}</span>
                                                    <span className="text-xs font-black text-gray-900 dark:text-white">{stat.value}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Tracking URL Copy */}
                                        <div className={`flex items-center gap-2 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 ${isUnavailable ? "opacity-40" : ""}`}>
                                            <p className="flex-1 text-[11px] font-mono text-gray-500 dark:text-zinc-400 truncate">{trackingUrl}</p>
                                            <button
                                                onClick={() => !isUnavailable && handleCopy(link)}
                                                disabled={isUnavailable}
                                                className="shrink-0 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white transition-colors disabled:cursor-not-allowed"
                                            >
                                                {copiedId === link.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                {copiedId === link.id ? "Copied" : "Copy"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
