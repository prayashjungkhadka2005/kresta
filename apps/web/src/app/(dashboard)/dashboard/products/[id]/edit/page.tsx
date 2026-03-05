"use client";

import React from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { ProductForm } from "@/components/features/products/ProductForm";
import { BackButton } from "@/components/shared/ui/BackButton";
import { toast } from "sonner";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const productId = params.id as string;
    const queryClient = useQueryClient();

    // Fetch Product Data
    const { data: product, isLoading, error } = useQuery<ProductFormData>({
        queryKey: ["product-edit", productId],
        queryFn: async () => {
            const response = await api.get(`/products/${productId}`);
            const data = response.data.product;

            // Format data for the form
            return {
                name: data.name,
                description: data.description || "",
                price: data.price.toString(),
                commissionRate: data.commissionRate.toString(),
                productUrl: data.productUrl || "",
                media: data.media || [],
            };
        },
        enabled: !!productId,
    });

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: async (formData: ProductFormData) => {
            await api.patch(`/products/${productId}`, {
                ...formData,
                price: parseFloat(formData.price),
                commissionRate: parseFloat(formData.commissionRate),
            });
        },
        onSuccess: () => {
            toast.success("Product updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["product", productId] }); // Update Detail page cache
            queryClient.invalidateQueries({ queryKey: ["brand-products"] }); // Update Products List cache

            // Return to the original tab if specified
            const fromTab = searchParams.get("fromTab");
            const q = searchParams.get("q");
            const params = new URLSearchParams();
            if (fromTab) params.set("tab", fromTab);
            if (q) params.set("q", q);

            const queryString = params.toString();
            router.push(`/dashboard/products${queryString ? `?${queryString}` : ""}`);
            router.refresh();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to update product");
        }
    });

    const handleFormSubmit = async (formData: ProductFormData) => {
        await updateMutation.mutateAsync(formData);
    };

    if (error) {
        toast.error("Failed to fetch product details");
        router.push("/dashboard/products");
        return null;
    }

    if (isLoading) return null;

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
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">Edit Product</h1>
                    <p className="text-gray-500 dark:text-zinc-500 mt-1 uppercase text-pro-label font-bold tracking-widest transition-colors">
                        Update your product details and promotion tracking.
                    </p>
                </div>
            </div>

            {product && (
                <ProductForm
                    initialData={product}
                    onSubmit={handleFormSubmit}
                    isLoading={updateMutation.isPending}
                    submitLabel="Update Product Listing"
                />
            )}
        </div>
    );
}
