"use client";

import React from "react";
import { ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface Product {
    id: string;
    name: string;
    description?: string;
    price: string;
    commissionRate: string;
    media: { url: string; type: "IMAGE" | "VIDEO"; order: number }[];
    brand: {
        companyName: string;
        logoUrl?: string;
        slug: string;
    };
}

interface ProductCardProps {
    product: Product;
    isPromoted?: boolean;
}

export const ProductCard = ({ product, isPromoted }: ProductCardProps) => {
    return (
        <div className="group flex flex-col bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-100 dark:border-zinc-800 overflow-hidden transition-all duration-300 hover:border-gray-200 dark:hover:border-zinc-700 shadow-sm h-full">
            {/* Image Area */}
            <div className="relative h-44 bg-gray-50 dark:bg-zinc-800/30 overflow-hidden border-b border-gray-100 dark:border-zinc-800">
                {product.media && product.media.length > 0 ? (
                    <Link href={`/creator/marketplace/${product.id}`}>
                        <img
                            src={product.media.sort((a, b) => a.order - b.order)[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                    </Link>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-zinc-700">
                        <Package className="w-8 h-8" />
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center mb-2">
                    <Link href={`/creator/brands/${product.brand.slug}`}>
                        <button className="hover:opacity-80 transition-opacity max-w-full text-left">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-md border border-gray-200 dark:border-zinc-700/50 truncate block">
                                {product.brand.companyName}
                            </span>
                        </button>
                    </Link>
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 leading-tight line-clamp-2">
                    {product.name}
                </h3>
                <p className="text-lg font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2 mt-auto">
                    NPR {parseFloat(product.price).toLocaleString()}
                </p>

                <div className="pt-3 border-t border-gray-100 dark:border-zinc-800/50 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                        <span>Est. Earning</span>
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs">
                            NPR {(parseFloat(product.price) * parseFloat(product.commissionRate) / 100).toLocaleString()}
                        </span>
                    </div>
                    <Link href={`/creator/marketplace/${product.id}`} className="block">
                        <Button variant="default" className="w-full flex items-center justify-center gap-2 group/btn rounded-lg h-9 text-sm">
                            {isPromoted ? "Manage Link" : "View Product"}
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};
