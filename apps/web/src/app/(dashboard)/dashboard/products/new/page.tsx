"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { ProductForm } from "@/components/features/products/ProductForm";
import { BackButton } from "@/components/shared/ui/BackButton";
import { toast } from "sonner";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function NewProductPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
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

            // Return with context
            const fromTab = searchParams.get("fromTab");
            const q = searchParams.get("q");
            const params = new URLSearchParams();
            if (fromTab) params.set("tab", fromTab);
            if (q) params.set("q", q);

            const queryString = params.toString();
            router.push(`/dashboard/products${queryString ? `?${queryString}` : ""}`);
            router.refresh();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4 lg:space-y-5">
            {/* Navigation */}
            <BackButton
                fallbackHref="/dashboard/products"
                label="Back to Products"
            />

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
