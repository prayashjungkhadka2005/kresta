"use client";

import React, { useState } from "react";
import {
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SingleImageUpload } from "@/components/shared/ui/SingleImageUpload";
import { toast } from "sonner";

interface BrandProfileFormData {
    companyName: string;
    bio: string;
    logoUrl: string;
    websiteUrl: string;
    instagramUrl: string;
    twitterUrl: string;
    tiktokUrl: string;
    linkedinUrl: string;
}

interface BrandProfileFormProps {
    initialData: BrandProfileFormData;
    onSubmit: (data: BrandProfileFormData) => Promise<void>;
    isLoading?: boolean;
}

export function BrandProfileForm({
    initialData,
    onSubmit,
    isLoading = false
}: BrandProfileFormProps) {
    const [formData, setFormData] = useState<BrandProfileFormData>(initialData);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    // Keep form in sync with server data
    React.useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

    const handleReset = () => {
        setFormData(initialData);
        setFieldErrors({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setFieldErrors({});
            await onSubmit(formData);
        } catch (err: any) {
            const data = err.response?.data;
            if (data?.errors) {
                setFieldErrors(data.errors);
            } else {
                toast.error(data?.message || "Failed to update profile");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identity Sections Container */}
            <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-100 dark:border-zinc-800 p-6 sm:p-8 space-y-12 transition-colors shadow-sm">

                {/* Section 1: Visual Identity */}
                <div className="space-y-8">
                    <div className="border-b border-gray-100 dark:border-zinc-800 pb-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white">Visual Identity</h3>
                        <p className="text-pro-label text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest mt-1">Logo and banner represent your brand across the platform.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <SingleImageUpload
                                label="Brand Logo"
                                description="400x400 recommended"
                                value={formData.logoUrl}
                                onChange={(url) => setFormData({ ...formData, logoUrl: url })}
                                aspectRatio="square"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Core Store Info */}
                <div className="space-y-6">
                    <div className="border-b border-gray-100 dark:border-zinc-800 pb-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white">Store Details</h3>
                        <p className="text-pro-label text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest mt-1">Official business information and description.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Business Name"
                            placeholder="Your Brand Name"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            error={fieldErrors.companyName?.[0]}
                        />
                        <Input
                            label="Official Website"
                            placeholder="https://yourbrand.com"
                            value={formData.websiteUrl}
                            onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                            error={fieldErrors.websiteUrl?.[0]}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-widest">Brand Bio</label>
                        <textarea
                            className="w-full min-h-[120px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-900/50 p-4 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:border-zinc-300 dark:focus:border-zinc-700 focus:outline-none focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 transition-all resize-none"
                            placeholder="Briefly describe your brand to creators and customers..."
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        />
                    </div>
                </div>

                {/* Section 3: Social Presence */}
                <div className="space-y-6">
                    <div className="border-b border-gray-100 dark:border-zinc-800 pb-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white">Social Presence</h3>
                        <p className="text-pro-label text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest mt-1">Help creators tag you in their content.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Instagram URL"
                            placeholder="https://instagram.com/yourbrand"
                            value={formData.instagramUrl}
                            onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                        />
                        <Input
                            label="TikTok URL"
                            placeholder="https://tiktok.com/@yourbrand"
                            value={formData.tiktokUrl}
                            onChange={(e) => setFormData({ ...formData, tiktokUrl: e.target.value })}
                        />
                        <Input
                            label="Twitter / X URL"
                            placeholder="https://twitter.com/yourbrand"
                            value={formData.twitterUrl}
                            onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                        />
                        <Input
                            label="LinkedIn URL"
                            placeholder="https://linkedin.com/company/yourbrand"
                            value={formData.linkedinUrl}
                            onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <Button
                    type="button"
                    variant="outline"
                    className="px-8"
                    onClick={handleReset}
                    disabled={!isDirty || isLoading}
                >
                    Reset
                </Button>
                <Button
                    type="submit"
                    className="px-10 h-11"
                    disabled={!isDirty || isLoading}
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                </Button>
            </div>
        </form>
    );
}
