"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Package, Edit, Archive, ExternalLink, Filter, ChevronDown, Info } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search } from "@/components/ui/Search";
import { toast } from "sonner";
import Image from "next/image";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Tooltip } from "@/components/ui/Tooltip";
import { StatusSelect } from "@/components/ui/StatusSelect";
import { ProductStatus } from "shared";

interface Product {
    id: string;
    name: string;
    description?: string;
    price: string;
    commissionRate: string;
    productUrl: string;
    status: string;
    approvalStatus: string;
    createdAt: string;
    media: { url: string; type: "IMAGE" | "VIDEO"; order: number }[];
}

export default function BrandProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("ALL");

    // Archive State
    const [productToArchive, setProductToArchive] = useState<Product | null>(null);
    const [isArchiving, setIsArchiving] = useState(false);

    // Status Update State
    const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get("/products/brand/me");
                setProducts(response.data.products);
            } catch (err: any) {
                toast.error("Failed to fetch products");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleArchive = async () => {
        if (!productToArchive) return;

        setIsArchiving(true);
        try {
            await api.delete(`/products/${productToArchive.id}`);
            setProducts(products.filter(p => p.id !== productToArchive.id));
            toast.success("Product archived");
            setProductToArchive(null);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to archive product");
        } finally {
            setIsArchiving(false);
        }
    };

    const handleStatusUpdate = async (productId: string, newStatus: ProductStatus) => {
        setUpdatingStatusId(productId);
        try {
            await api.patch(`/products/${productId}`, { status: newStatus });
            setProducts(products.map(p => p.id === productId ? { ...p, status: newStatus } : p));
            toast.success(`Product marked as ${newStatus.toLowerCase()}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update status");
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.description?.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesTab = activeTab === "ALL" || product.status === activeTab;
        return matchesSearch && matchesTab;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "ACTIVE": return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20";
            case "PAUSED": return "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20";
            case "ARCHIVED": return "text-gray-500 bg-gray-50 border-gray-200 dark:text-zinc-500 dark:bg-zinc-800/50 dark:border-zinc-700/50";
            case "DRAFT": return "text-gray-700 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-zinc-800/50 dark:border-zinc-700/50";
            default: return "text-gray-700 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-zinc-800/50 dark:border-zinc-700/50";
        }
    };

    const getApprovalStatusColor = (status: string) => {
        switch (status) {
            case "APPROVED": return "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20";
            case "PENDING": return "text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-500 dark:bg-amber-500/5 dark:border-amber-500/10";
            case "REJECTED": return "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20";
            default: return "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-zinc-800/50 dark:border-zinc-700/50";
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto w-full">
            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!productToArchive}
                onClose={() => setProductToArchive(null)}
                onConfirm={handleArchive}
                title="Archive Product"
                description={`Archive "${productToArchive?.name}"? It will be hidden from the Marketplace and creators won't be able to generate new links. You can restore it anytime by changing the status back to Active.`}
                confirmLabel="Archive Product"
                variant="danger"
                isLoading={isArchiving}
            />
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">My Products</h1>
                    <p className="text-gray-500 dark:text-zinc-500 mt-1 uppercase text-pro-label font-bold tracking-widest transition-colors">Manage your storefront and affiliate commissions.</p>
                </div>
                <Link href="/dashboard/products/new">
                    <Button size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Product
                    </Button>
                </Link>
            </div>

            {/* Controls Row */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg self-start md:self-auto">
                    {["ALL", "ACTIVE", "PAUSED", "DRAFT", "ARCHIVED"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 text-[12px] font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === tab
                                ? "bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm"
                                : "text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            {tab === "ALL" ? "All Products" : tab}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Search
                        placeholder="Search products by name or description..."
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        className="bg-gray-100 dark:bg-zinc-800 border-none rounded-lg flex-1 md:w-80"
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
                <div className="px-1">
                    <p className="text-pro-label uppercase font-bold tracking-widest text-gray-400 dark:text-zinc-600">
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                    </p>
                </div>
            )}

            {/* Content */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 rounded-xl bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 animate-pulse" />
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-transparent border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100 dark:border-zinc-700/50">
                        <Package className="w-8 h-8 text-gray-400 dark:text-zinc-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">No products found</h3>
                    <p className="text-gray-500 dark:text-zinc-400 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                    {products.length === 0 && (
                        <Link href="/dashboard/products/new">
                            <Button size="sm" variant="outline" className="px-6 hover:bg-gray-100 dark:hover:bg-zinc-800/50 transition-colors">Add Your First Product</Button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
                                    <th className="px-6 py-4 text-pro-label uppercase tracking-widest font-bold text-gray-500 dark:text-zinc-500">Product</th>
                                    <th className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-pro-label uppercase tracking-widest font-bold text-gray-500 dark:text-zinc-500">Status</span>
                                            <Tooltip content="Your manual control of visibility">
                                                <Info className="w-3.5 h-3.5 text-gray-300 dark:text-zinc-700 hover:text-gray-400 dark:hover:text-zinc-500 transition-colors cursor-help" />
                                            </Tooltip>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-pro-label uppercase tracking-widest font-bold text-gray-500 dark:text-zinc-500">Price</th>
                                    <th className="px-6 py-4 text-pro-label uppercase tracking-widest font-bold text-gray-500 dark:text-zinc-500">Commission</th>
                                    <th className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-pro-label uppercase tracking-widest font-bold text-gray-500 dark:text-zinc-500">Approval</span>
                                            <Tooltip content="Platform verification status">
                                                <Info className="w-3.5 h-3.5 text-gray-300 dark:text-zinc-700 hover:text-gray-400 dark:hover:text-zinc-500 transition-colors cursor-help" />
                                            </Tooltip>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-pro-label uppercase tracking-widest font-bold text-gray-500 dark:text-zinc-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="group hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden relative border border-gray-100 dark:border-zinc-700/50">
                                                    {product.media && product.media.length > 0 ? (
                                                        <Image
                                                            src={product.media.sort((a, b) => a.order - b.order)[0].url}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <Package className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
                                                    )}
                                                </div>
                                                <span className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusSelect
                                                status={product.status as ProductStatus}
                                                approvalStatus={product.approvalStatus}
                                                onUpdate={(newStatus) => handleStatusUpdate(product.id, newStatus)}
                                                isLoading={updatingStatusId === product.id}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                                            NPR {parseFloat(product.price).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-600 dark:text-zinc-400">
                                            {product.commissionRate}%
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${getApprovalStatusColor(product.approvalStatus)}`}>
                                                {product.approvalStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2 text-right">
                                                <Link href={`/dashboard/products/${product.id}/edit`}>
                                                    <button title="Edit" className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                <Link href={product.productUrl} target="_blank">
                                                    <button title="View Storefront" className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                {product.status !== "ARCHIVED" && (
                                                    <button
                                                        title="Archive"
                                                        onClick={() => setProductToArchive(product)}
                                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                                    >
                                                        <Archive className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>

    );
}
