"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, DollarSign, Percent, ImageIcon, Globe, Loader2, Link as LinkIcon } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MediaUpload } from "@/components/ui/MediaUpload";
import { toast } from "sonner";
import Link from "next/link";

export default function NewProductPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        commissionRate: "",
        productUrl: "",
        media: [] as { url: string; type: "IMAGE" | "VIDEO"; order: number }[],
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.media.length === 0) {
            toast.error("At least one product image is required");
            return;
        }

        setIsLoading(true);
        setFieldErrors({});

        try {
            await api.post("/products", {
                ...formData,
                price: parseFloat(formData.price),
                commissionRate: parseFloat(formData.commissionRate),
            });
            toast.success("Product created successfully!");
            router.push("/dashboard/products");
            router.refresh();
        } catch (err: any) {
            const data = err.response?.data;
            if (data?.errors) {
                setFieldErrors(data.errors);
            } else {
                toast.error(data?.message || "Failed to create product");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4 lg:space-y-5">
            {/* Navigation */}
            <Link href="/dashboard/products" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-white transition-colors group">
                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                Back to Products
            </Link>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">Add New Product</h1>
                    <p className="text-gray-500 dark:text-zinc-500 mt-1 uppercase text-pro-label font-bold tracking-widest transition-colors">
                        Tracking Mode: Connect your external product for creator promotion.
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-8 transition-colors">

                    {/* Section 1: Core Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                                <Package className="w-4 h-4 text-zinc-500" />
                            </div>
                            <h2 className="text-pro-label font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500 transition-colors">Core Information</h2>
                        </div>
                        <Input
                            label="Product Name"
                            placeholder="e.g. Premium Leather Wallet"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            error={fieldErrors.name?.[0]}
                            required
                        />

                        <div className="flex flex-col gap-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 ml-1 transition-colors">Description</label>
                            <textarea
                                className={`w-full min-h-[120px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-900/50 p-4 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:border-zinc-300 dark:focus:border-zinc-700 focus:outline-none focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 transition-all resize-none ${fieldErrors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500/5' : ''}`}
                                placeholder="Explain the features and benefits of your product..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                            {fieldErrors.description && (
                                <p className="text-[12px] font-bold text-red-500 ml-1">{fieldErrors.description[0]}</p>
                            )}
                        </div>
                    </div>

                    {/* Section 2: Media */}
                    <div className="space-y-4 pt-8 border-t border-gray-100 dark:border-zinc-800 transition-colors">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                                <ImageIcon className="w-4 h-4 text-zinc-500" />
                            </div>
                            <div>
                                <h2 className="text-pro-label font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500 transition-colors leading-none">Product Media</h2>
                                <p className="text-[10px] font-medium text-zinc-400 mt-1 uppercase tracking-tight">Upload high-quality images and videos.</p>
                            </div>
                        </div>
                        <MediaUpload
                            value={formData.media}
                            onChange={(media) => setFormData({ ...formData, media })}
                            disabled={isLoading}
                        />
                        {fieldErrors.media && (
                            <p className="text-[12px] font-bold text-red-500 ml-1 mt-2">{fieldErrors.media[0]}</p>
                        )}
                    </div>

                    {/* Section 3: Pricing & Destination */}
                    <div className="space-y-6 pt-8 border-t border-gray-100 dark:border-zinc-800 transition-colors">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left: Pricing */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                                        <DollarSign className="w-4 h-4 text-zinc-500" />
                                    </div>
                                    <h2 className="text-pro-label font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500 transition-colors">Commercials</h2>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Price (NPR)"
                                        type="number"
                                        placeholder="1500"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        error={fieldErrors.price?.[0]}
                                        required
                                    />
                                    <Input
                                        label="Commission (%)"
                                        type="number"
                                        placeholder="10"
                                        value={formData.commissionRate}
                                        onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                                        error={fieldErrors.commissionRate?.[0]}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Right: Destination */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                                        <LinkIcon className="w-4 h-4 text-zinc-500" />
                                    </div>
                                    <h2 className="text-pro-label font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500 transition-colors">Destination</h2>
                                </div>
                                <Input
                                    label="External Product URL"
                                    placeholder="https://yourstore.com/product"
                                    value={formData.productUrl}
                                    onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                                    error={fieldErrors.productUrl?.[0]}
                                    required
                                />
                                <p className="text-[10px] font-bold text-zinc-400 ml-1 uppercase tracking-widest">
                                    Creators will send shoppers to this link.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Link href="/dashboard/products">
                        <Button type="button" variant="outline" className="px-8" disabled={isLoading}>
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" className="px-12" disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            "Create Product Listing"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
