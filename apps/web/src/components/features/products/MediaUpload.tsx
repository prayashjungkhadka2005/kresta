"use client";

import React, { useCallback, useState } from "react";
import { Upload, X, FileVideo, Loader2, GripVertical } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Reorder } from "framer-motion";

interface MediaItem {
    url: string;
    type: "IMAGE" | "VIDEO";
    order: number;
}

interface MediaUploadProps {
    value: MediaItem[];
    onChange: (value: MediaItem[]) => void;
    maxFiles?: number;
    disabled?: boolean;
}

export function MediaUpload({
    value = [],
    onChange,
    maxFiles = 5,
    disabled = false,
}: MediaUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const onUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;

            if (value.length + files.length > maxFiles) {
                toast.error(`You can only upload up to ${maxFiles} files`);
                return;
            }

            setIsUploading(true);
            setUploadProgress(0);

            const formData = new FormData();
            Array.from(files).forEach((file) => {
                formData.append("files", file);
            });

            try {
                const response = await api.post("/upload/multiple", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    onUploadProgress: (progressEvent) => {
                        const progress = progressEvent.total
                            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                            : 0;
                        setUploadProgress(progress);
                    }
                });

                const newMedia: MediaItem[] = response.data.files.map((file: any, index: number) => ({
                    url: file.url,
                    type: file.type,
                    order: value.length + index,
                }));

                onChange([...value, ...newMedia]);
                toast.success(`${newMedia.length} file(s) uploaded successfully`);
            } catch (err) {
                console.error("Upload error:", err);
                toast.error("Failed to upload files. Please try again.");
            } finally {
                setIsUploading(false);
                setUploadProgress(0);
            }
        },
        [onChange, value, maxFiles]
    );

    const removeMedia = async (index: number) => {
        const itemToRemove = value[index];
        const filename = itemToRemove.url.split("/").pop();

        if (filename) {
            try {
                console.log("Attempting to delete:", filename);
                await api.delete(`/upload/${filename}`);
            } catch (err) {
                console.error("Failed to delete file from server:", err);
            }
        }

        const newValue = [...value];
        newValue.splice(index, 1);
        const reorderedValue = newValue.map((item, i) => ({ ...item, order: i }));
        onChange(reorderedValue);
    };

    const handleReorder = (newOrder: MediaItem[]) => {
        const reordered = newOrder.map((item, i) => ({ ...item, order: i }));
        onChange(reordered);
    };

    return (
        <div className="space-y-4">
            <Reorder.Group
                axis="x"
                values={value}
                onReorder={handleReorder}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            >
                {value.map((item, index) => (
                    <Reorder.Item
                        key={item.url}
                        value={item}
                        className="group relative aspect-square rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-gray-50 dark:bg-zinc-900/50 transition-colors cursor-grab active:cursor-grabbing"
                    >
                        {item.type === "IMAGE" ? (
                            <Image
                                src={item.url}
                                alt="Product media"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                <FileVideo className="w-6 h-6 text-zinc-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Video</span>
                            </div>
                        )}

                        {/* Top Controls: Drag Handle & Delete */}
                        <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="p-1 rounded bg-black/50 text-white/70">
                                <GripVertical className="w-3 h-3" />
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeMedia(index);
                                }}
                                disabled={disabled}
                                className="p-1.5 rounded-lg bg-black/60 hover:bg-red-500 text-white shadow-sm transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/40 text-[10px] font-bold text-white border border-white/10">
                            {index === 0 ? "Cover" : `#${index + 1}`}
                        </div>
                    </Reorder.Item>
                ))}

                {/* Simple Upload Trigger */}
                {value.length < maxFiles && (
                    <label
                        className={cn(
                            "relative aspect-square rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-900/30 transition-all group",
                            (isUploading || disabled) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={onUpload}
                            disabled={isUploading || disabled}
                        />
                        {isUploading ? (
                            <div className="flex flex-col items-center gap-2 w-full px-4">
                                <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">{uploadProgress}%</span>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-5 h-5 text-zinc-400" />
                                <div className="text-center">
                                    <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">Add Media</span>
                                    <span className="block text-[9px] font-medium text-zinc-400 mt-0.5">{value.length}/{maxFiles} Files</span>
                                </div>
                            </>
                        )}
                    </label>
                )}
            </Reorder.Group>

            {value.length > 0 && (
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-2 italic">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                    Drag images to reorder. The first image is your main cover.
                </p>
            )}
        </div>
    );
}
