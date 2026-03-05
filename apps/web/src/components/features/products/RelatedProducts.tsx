"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ProductCard } from "./ProductCard";
import { ShoppingBag } from "lucide-react";

// No longer need manual path or context imports due to new Stack Architecture

interface RelatedProductsProps {
    currentProductId: string;
    brandId: string;
    brandName: string;
}

export const RelatedProducts = ({ currentProductId, brandId, brandName }: RelatedProductsProps) => {
    // Stack architecture handles context automatically
    const { data: allProducts = [], isLoading } = useQuery({
        queryKey: ["marketplace-products-discovery"],
        queryFn: async () => {
            const response = await api.get("/products");
            return response.data.products as any[];
        },
    });

    const { data: promotedIds = new Set<string>() } = useQuery<Set<string>>({
        queryKey: ["creator-links-ids"],
        queryFn: async () => {
            try {
                const response = await api.get("/creators/me/links");
                return new Set((response.data.links as any[]).map((l: any) => l.product.id));
            } catch {
                return new Set<string>();
            }
        },
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-6 w-48 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-64 bg-gray-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    // Filter products
    const brandProducts = allProducts.filter(
        (p: any) => p.brand.id === brandId && p.id !== currentProductId
    );

    const otherProducts = allProducts.filter(
        (p: any) => p.brand.id !== brandId && p.id !== currentProductId
    );

    const hasBrandProducts = brandProducts.length > 0;
    const displayProducts = hasBrandProducts ? brandProducts.slice(0, 4) : otherProducts.slice(0, 4);
    const title = hasBrandProducts ? `More from ${brandName}` : "Discover More Campaigns";


    if (displayProducts.length === 0) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                    <ShoppingBag className="w-4 h-4 text-zinc-500" />
                </div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">
                    {title}
                </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {displayProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        isPromoted={promotedIds.has(product.id)}
                    />
                ))}
            </div>
        </div>
    );
};
