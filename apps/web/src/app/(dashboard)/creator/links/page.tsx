"use client";

import React, { useState } from "react";
import { Link as LinkIcon, Copy, Check, ExternalLink, Package, Search as SearchIcon, Trash2, MousePointerClick, ShoppingBag, TrendingUp, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Search } from "@/components/ui/Search";
import Link from "next/link";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

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
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Get search from URL
    const searchQuery = searchParams.get("q") || "";

    const handleSearchChange = (query: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (!query) {
            params.delete("q");
        } else {
            params.set("q", query);
        }
        router.replace(`${pathname}?${params.toString()}`);
    };

    const [linkToRemove, setLinkToRemove] = useState<AffiliateLink | null>(null);
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
            setLinkToRemove(null);
        },
        onError: () => {
            toast.error("Failed to remove link");
            setLinkToRemove(null);
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

    const handleDeleteClick = (link: AffiliateLink) => {
        setLinkToRemove(link);
    };

    const handleConfirmDelete = () => {
        if (!linkToRemove) return;
        deleteMutation.mutate(linkToRemove.id);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto w-full pb-10">
            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!linkToRemove}
                onClose={() => setLinkToRemove(null)}
                onConfirm={handleConfirmDelete}
                title="Remove Affiliate Link"
                description={`Are you sure you want to remove your link for "${linkToRemove?.product?.name}"? While your past earnings are safely stored, you will no longer be able to track new clicks or sales for this link.`}
                confirmLabel="Remove Link"
                variant="danger"
                isLoading={deleteMutation.isPending}
            />

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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)}
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
                <div className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30">
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500 whitespace-nowrap">Product</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500 whitespace-nowrap text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500 whitespace-nowrap text-center">Clicks</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500 whitespace-nowrap text-center">Sales</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500 whitespace-nowrap text-right">Earned</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500 whitespace-nowrap text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {filteredLinks.map(link => {
                                    const coverImage = link.product.media.sort((a, b) => a.order - b.order)[0]?.url;
                                    const isUnavailable = (link.product.status ?? "ACTIVE") !== "ACTIVE" || (link.product.approvalStatus ?? "APPROVED") !== "APPROVED";

                                    return (
                                        <tr key={link.id} className="group hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <Link href={`/creator/marketplace/${link.product.id}`} className="group/item flex items-center gap-4">
                                                    <div className="w-10 h-10 shrink-0 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700 overflow-hidden flex items-center justify-center transition-opacity group-hover/item:opacity-80">
                                                        {coverImage ? (
                                                            <img src={coverImage} alt={link.product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package className="w-5 h-5 text-gray-200 dark:text-zinc-700" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-zinc-500 truncate mb-0.5">
                                                            {link.product.brand.companyName}
                                                        </p>
                                                        <h4 className={`text-sm font-bold truncate leading-snug group-hover/item:text-black dark:group-hover/item:text-white transition-colors ${isUnavailable ? "text-gray-400 dark:text-zinc-600" : "text-gray-900 dark:text-white"}`}>
                                                            {link.product.name}
                                                        </h4>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border transition-colors ${isUnavailable
                                                        ? "text-gray-500 bg-gray-50 border-gray-200 dark:text-zinc-500 dark:bg-zinc-800/50 dark:border-zinc-700/50"
                                                        : "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                                                        }`}>
                                                        {isUnavailable ? "Ended" : "Active"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{link.totalClicks}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{link.totalSales}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                                                    NPR {parseFloat(link.totalEarned).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2 text-right">
                                                    <Link href={`/creator/marketplace/${link.product.id}`}>
                                                        <button title="View Product" className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                                            <ExternalLink className="w-4 h-4" />
                                                        </button>
                                                    </Link>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => !isUnavailable && handleCopy(link)}
                                                        disabled={isUnavailable}
                                                        className={`h-8 px-3 text-[10px] font-bold uppercase tracking-widest gap-2 bg-gray-50 dark:bg-zinc-800/50 border-none text-gray-600 dark:text-zinc-400 ${isUnavailable ? "opacity-30" : "hover:bg-gray-100 dark:hover:bg-zinc-800"}`}
                                                    >
                                                        {copiedId === link.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                        {copiedId === link.id ? "Copied" : "Copy Link"}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(link)}
                                                        disabled={deleteMutation.isPending && deleteMutation.variables === link.id}
                                                        className="h-8 w-8 p-0 border-none bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
