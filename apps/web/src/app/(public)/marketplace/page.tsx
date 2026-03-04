"use client";

import React, { useEffect, useState } from "react";
import { Search, Filter, ShoppingBag, ArrowRight, Star, TrendingUp, Package } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

interface Product {
    id: string;
    name: string;
    price: string;
    commissionRate: string;
    imageUrl?: string;
    brand: {
        companyName: string;
        logoUrl?: string;
    };
}

export default function MarketplacePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get("/products");
                setProducts(response.data.products);
            } catch (err) {
                console.error("Failed to fetch marketplace products");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50/30">
            {/* Hero Section */}
            <div className="bg-black text-white py-16 px-8 rounded-b-[40px] shadow-2xl shadow-black/10">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold tracking-widest uppercase border border-white/10">
                            <TrendingUp className="w-3 h-3 text-green-400" />
                            Live Marketplace
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                            Discover the Best <span className="text-gray-400 font-serif italic">Affiliate</span> Opportunities in Nepal
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Promote high-quality brands and earn up to 40% commission on every successful sale.
                        </p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 border-dashed">
                        <div className="flex gap-4">
                            <div className="text-center px-4">
                                <p className="text-2xl font-black">10+</p>
                                <p className="text-[10px] uppercase font-bold text-gray-400">Brands</p>
                            </div>
                            <div className="w-px h-10 bg-white/10 mt-2" />
                            <div className="text-center px-4">
                                <p className="text-2xl font-black">NPR 1M+</p>
                                <p className="text-[10px] uppercase font-bold text-gray-400">Payouts</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-8 -mt-8">
                {/* Search & Filter Bar */}
                <div className="bg-white rounded-3xl p-4 shadow-xl shadow-black/5 border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search brands or products..."
                            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-black transition-all font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <Button variant="outline" className="h-12 px-6 rounded-2xl bg-gray-50 border-none hover:bg-black hover:text-white transition-all">
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </Button>
                        <Button className="h-12 px-8 rounded-2xl shadow-lg shadow-black/10">
                            Search Now
                        </Button>
                    </div>
                </div>

                {/* Grid */}
                <div className="py-12">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black flex items-center gap-2">
                            Featured Products
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        </h2>
                        <p className="text-gray-500 font-medium">{filteredProducts.length} items found</p>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-[420px] rounded-[32px] bg-white border border-gray-100 animate-pulse" />
                            ))}
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
                            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold">No products found</h3>
                            <p className="text-gray-500">Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="group flex flex-col bg-white rounded-[32px] border border-gray-100 overflow-hidden transition-all hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-2">
                                    {/* Image Area */}
                                    <div className="relative h-56 bg-gray-50 overflow-hidden">
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                <Package className="w-16 h-16" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-black shadow-sm flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-green-500" />
                                            {product.brand.companyName}
                                        </div>
                                        <div className="absolute bottom-4 right-4 bg-black text-white px-4 py-2 rounded-2xl text-xs font-black shadow-xl">
                                            {product.commissionRate}% Commission
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight group-hover:text-black">
                                            {product.name}
                                        </h3>
                                        <p className="text-3xl font-black mb-6">
                                            NPR {parseFloat(product.price).toLocaleString()}
                                        </p>

                                        <div className="mt-auto pt-6 border-t border-gray-50 space-y-3">
                                            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                <span>Potential Earning</span>
                                                <span className="text-green-600">NPR {(parseFloat(product.price) * parseFloat(product.commissionRate) / 100).toLocaleString()}+</span>
                                            </div>
                                            <Link href={`/marketplace/${product.id}`} className="block">
                                                <Button className="w-full h-12 rounded-2xl font-black bg-gray-50 text-black border-none hover:bg-black hover:text-white transition-all shadow-none flex items-center justify-center gap-2 group/btn">
                                                    Promote Now
                                                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
