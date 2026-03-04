"use client";

import React, { useState } from "react";
import { Package, DollarSign, ImageIcon, Loader2, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MediaUpload } from "./MediaUpload";
import { toast } from "sonner";

interface MediaItem {
    url: string;
    type: "IMAGE" | "VIDEO";
    order: number;
}

interface ProductFormData {
    name: string;
    description: string;
    price: string;
    commissionRate: string;
    productUrl: string;
    media: MediaItem[];
}

interface ProductFormProps {
    initialData?: ProductFormData;
    onSubmit: (data: ProductFormData) => Promise<void>;
    isLoading?: boolean;
    submitLabel?: string;
}

export function ProductForm({
    initialData,
    onSubmit,
    isLoading = false,
    submitLabel = "Save Product"
}: ProductFormProps) {
    const [formData, setFormData] = useState<ProductFormData>(initialData || {
        name: "",
        description: "",
        price: "",
        commissionRate: "",
        productUrl: "",
        media: [],
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.media.length === 0) {
            toast.error("At least one product image is required");
            return;
        }

        try {
            setFieldErrors({});
            await onSubmit(formData);
        } catch (err: any) {
            const data = err.response?.data;
            if (data?.errors) {
                setFieldErrors(data.errors);
            } else {
                toast.error(data?.message || "Something went wrong");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-8 transition-colors">
                {/* Section 1: Core Info */}
                <div className="space-y-4">
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
                        <div className="space-y-4">
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

                        <div className="space-y-4">
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
                <Button type="button" variant="outline" className="px-8" onClick={() => window.history.back()} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" className="px-12" disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        submitLabel
                    )}
                </Button>
            </div>
        </form>
    );
}
