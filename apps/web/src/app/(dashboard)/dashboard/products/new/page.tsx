"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, DollarSign, Percent, ImageIcon, Globe, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
        imageUrl: "",
        productUrl: "",
        isHosted: false,
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
            <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">Add New Product</h1>
                <p className="text-gray-500 dark:text-zinc-500 mt-1 uppercase text-pro-label font-bold tracking-widest transition-colors">Detailed information helps creators promote your product better.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6 transition-colors">
                    {/* Section 1: Core Info */}
                    <div className="space-y-4">
                        <h2 className="text-pro-label font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500 transition-colors">Core Information</h2>
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

                    {/* Section 2: Pricing */}
                    <div className="space-y-4 pt-6 mt-6 border-t border-gray-100 dark:border-zinc-800 transition-colors">
                        <h2 className="text-pro-label font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500 transition-colors">Pricing & Payouts</h2>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 w-full">
                                <Input
                                    label="Price (NPR)"
                                    type="number"
                                    placeholder="1500"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    error={fieldErrors.price?.[0]}
                                    required
                                />
                            </div>
                            <div className="flex-1 w-full">
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
                    </div>

                    {/* Section 3: Links */}
                    <div className="space-y-4 pt-6 mt-6 border-t border-gray-100 dark:border-zinc-800 transition-colors">
                        <h2 className="text-pro-label font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500 transition-colors">Storefront Details</h2>
                        <Input
                            label="Image URL"
                            placeholder="https://example.com/image.jpg"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            error={fieldErrors.imageUrl?.[0]}
                        />
                        <div className="flex items-center gap-2 mb-2 ml-1">
                            <input
                                type="checkbox"
                                id="isHosted"
                                className="w-4 h-4 rounded border-2 border-gray-200 dark:border-zinc-700 bg-transparent text-black dark:text-white focus:ring-black dark:focus:ring-white transition-colors"
                                checked={formData.isHosted}
                                onChange={(e) => setFormData({ ...formData, isHosted: e.target.checked })}
                            />
                            <label htmlFor="isHosted" className="text-sm font-bold text-gray-700 dark:text-zinc-300 transition-colors">Use Kresta Hosted Checkout</label>
                        </div>

                        {!formData.isHosted && (
                            <Input
                                label="External Product URL"
                                placeholder="https://yourstore.com/product"
                                value={formData.productUrl}
                                onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                                error={fieldErrors.productUrl?.[0]}
                            />
                        )}
                    </div>
                </div>

                <div className="flex justify-end">
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
