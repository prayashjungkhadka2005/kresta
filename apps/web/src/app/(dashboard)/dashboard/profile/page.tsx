"use client";

import React from "react";
import { BrandProfileForm } from "@/components/features/brands/BrandProfileForm";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, Loader2, Store } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function BrandProfileSettingsPage() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["my-brand-profile"],
        queryFn: async () => {
            const response = await api.get("/brands/me");
            return response.data.brand;
        },
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (formData: any) => {
            const response = await api.patch("/brands/me", formData);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Store profile updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["my-brand-profile"] });
            queryClient.invalidateQueries({ queryKey: ["public-brand-profile"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update profile");
        },
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Loading Store Profile</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto w-full pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">Store Profile</h1>
                    <p className="text-gray-500 dark:text-zinc-500 mt-1 uppercase text-pro-label font-bold tracking-widest transition-colors">
                        Customise your public store identity and social presence.
                    </p>
                </div>

                {data?.slug && (
                    <Link href={`/b/${data.slug}`} target="_blank">
                        <Button variant="outline" size="sm" className="gap-2 border-gray-100 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800/50">
                            <ExternalLink className="w-4 h-4" />
                            Public View
                        </Button>
                    </Link>
                )}
            </div>

            <BrandProfileForm
                initialData={{
                    companyName: data?.companyName || "",
                    bio: data?.bio || "",
                    logoUrl: data?.logoUrl || "",
                    websiteUrl: data?.websiteUrl || "",
                    instagramUrl: data?.instagramUrl || "",
                    twitterUrl: data?.twitterUrl || "",
                    tiktokUrl: data?.tiktokUrl || "",
                    linkedinUrl: data?.linkedinUrl || "",
                }}
                onSubmit={async (formData) => {
                    await updateProfileMutation.mutateAsync(formData);
                }}
                isLoading={updateProfileMutation.isPending}
            />
        </div>
    );
}
