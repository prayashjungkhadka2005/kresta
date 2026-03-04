"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { ProductForm } from "@/components/features/products/ProductForm";
import { toast } from "sonner";
import Link from "next/link";

export default function NewProductPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (formData: any) => {
        setIsLoading(true);

        try {
            await api.post("/products", {
                ...formData,
                price: parseFloat(formData.price),
                commissionRate: parseFloat(formData.commissionRate),
            });
            toast.success("Product created successfully!");
            router.push("/dashboard/products");
            router.refresh();
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

            <ProductForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
                submitLabel="Create Product Listing"
            />
        </div>
    );
}
