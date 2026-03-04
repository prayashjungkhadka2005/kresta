"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { ProductForm } from "@/components/features/products/ProductForm";
import { toast } from "sonner";
import Link from "next/link";

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [product, setProduct] = useState<any>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${params.id}`);
                const data = response.data.product;

                // Format data for the form
                setProduct({
                    name: data.name,
                    description: data.description || "",
                    price: data.price.toString(),
                    commissionRate: data.commissionRate.toString(),
                    productUrl: data.productUrl,
                    media: data.media || [],
                });
            } catch (err: any) {
                toast.error("Failed to fetch product details");
                router.push("/dashboard/products");
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchProduct();
        }
    }, [params.id, router]);

    const handleSubmit = async (formData: any) => {
        setIsSaving(true);

        try {
            await api.patch(`/products/${params.id}`, {
                ...formData,
                price: parseFloat(formData.price),
                commissionRate: parseFloat(formData.commissionRate),
            });
            toast.success("Product updated successfully!");
            router.push("/dashboard/products");
            router.refresh();
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
                <p className="text-pro-label uppercase font-bold tracking-widest text-zinc-500">Loading Product...</p>
            </div>
        );
    }

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
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">Edit Product</h1>
                    <p className="text-gray-500 dark:text-zinc-500 mt-1 uppercase text-pro-label font-bold tracking-widest transition-colors">
                        Update your product details and promotion tracking.
                    </p>
                </div>
            </div>

            {product && (
                <ProductForm
                    initialData={product}
                    onSubmit={handleSubmit}
                    isLoading={isSaving}
                    submitLabel="Update Product Listing"
                />
            )}
        </div>
    );
}
