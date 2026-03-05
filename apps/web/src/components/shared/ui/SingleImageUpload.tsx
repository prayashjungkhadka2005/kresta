"use client";

import React, { useState } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SingleImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label: string;
    description?: string;
    aspectRatio?: "square" | "video" | "banner";
    disabled?: boolean;
}

export function SingleImageUpload({
    value,
    onChange,
    label,
    description,
    aspectRatio = "square",
    disabled = false,
}: SingleImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);

    const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setIsUploading(true);
        try {
            const response = await api.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            onChange(response.data.url);
            toast.success("Image uploaded successfully");
        } catch (err) {
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = async () => {
        if (!value) return;
        const filename = value.split("/").pop();
        if (filename) {
            try {
                await api.delete(`/upload/${filename}`);
            } catch (err) {
                console.error("Delete failed:", err);
            }
        }
        onChange("");
    };

    const ratioClasses = {
        square: "aspect-square",
        video: "aspect-video",
        banner: "aspect-[3/1]",
    };

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 ml-0.5 uppercase tracking-widest">{label}</label>
                {description && <p className="text-[10px] text-zinc-400 ml-0.5 mt-0.5 uppercase tracking-wider">{description}</p>}
            </div>

            <div className={cn(
                "relative rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 overflow-hidden bg-gray-50/20 dark:bg-zinc-950/20 transition-all group",
                ratioClasses[aspectRatio],
                !value && "hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-900",
                isUploading && "opacity-50 pointer-events-none"
            )}>
                {value ? (
                    <>
                        <Image src={value} alt={label} fill className="object-cover" />

                        {/* Control Overlay - Matches Product Media Style */}
                        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                type="button"
                                onClick={removeImage}
                                disabled={disabled}
                                className="p-1.5 rounded-lg bg-black/60 hover:bg-red-500 text-white shadow-sm transition-colors"
                                title="Remove Image"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </>
                ) : (
                    <label className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors">
                        <input type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={disabled || isUploading} />
                        {isUploading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Uploading...</span>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-5 h-5 text-zinc-400 group-hover:-translate-y-1 transition-transform" />
                                <div className="text-center">
                                    <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">Update {label}</span>
                                </div>
                            </>
                        )}
                    </label>
                )}
            </div>
        </div>
    );
}
