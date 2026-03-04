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

function VideoPreview({ url, className }: { url: string; className?: string }) {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    const togglePlay = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(currentProgress);
        }
    };

    return (
        <div className={cn("relative w-full h-full group/video cursor-pointer", className)} onClick={togglePlay}>
            <video
                ref={videoRef}
                src={url}
                className="w-full h-full object-cover"
                onTimeUpdate={handleTimeUpdate}
                onContextMenu={(e) => e.preventDefault()}
                playsInline
                loop
            />

            {/* Play/Pause Overlay */}
            <div className={cn(
                "absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300",
                isPlaying ? "opacity-0 group-hover/video:opacity-100" : "opacity-100"
            )}>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-xl">
                    {isPlaying ? (
                        <div className="flex gap-1">
                            <div className="w-1 h-3 bg-current rounded-full" />
                            <div className="w-1 h-3 bg-current rounded-full" />
                        </div>
                    ) : (
                        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-current border-b-[6px] border-b-transparent ml-1" />
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden z-20">
                <div
                    className="h-full bg-white transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}

export function MediaUpload({
    value = [],
    onChange,
    maxFiles = 5,
    disabled = false,
}: MediaUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const normalizeMedia = (items: MediaItem[]) => {
        const firstImageIndex = items.findIndex((item) => item.type === "IMAGE");
        if (firstImageIndex > 0) {
            const normalized = [...items];
            const [firstImage] = normalized.splice(firstImageIndex, 1);
            normalized.unshift(firstImage);
            return normalized.map((item, i) => ({ ...item, order: i }));
        }
        return items.map((item, i) => ({ ...item, order: i }));
    };

    const onUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;

            if (value.length + files.length > maxFiles) {
                toast.error(`You can only upload up to ${maxFiles} files`);
                return;
            }

            const formData = new FormData();
            const selectedFiles = Array.from(files);

            // Check if we will have at least one image for the cover
            const hasExistingImage = value.some(item => item.type === "IMAGE");
            const isAddingImage = selectedFiles.some(file => file.type.startsWith("image/"));

            if (!hasExistingImage && !isAddingImage) {
                toast.error("Please upload an image first to use as the product cover.");
                return;
            }

            setIsUploading(true);
            setUploadProgress(0);

            selectedFiles.forEach((file) => {
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

                const finalMedia = normalizeMedia([...value, ...newMedia]);
                onChange(finalMedia);
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
        onChange(normalizeMedia(newValue));
    };

    const handleReorder = (newOrder: MediaItem[]) => {
        const normalized = normalizeMedia(newOrder);

        // Show informative toast if we had to move a video off the cover spot
        if (newOrder[0].type === "VIDEO" && normalized[0].type === "IMAGE") {
            toast.info("Videos cannot be the cover. An image was kept at the top.", {
                id: "cover-restriction-toast"
            });
        }

        onChange(normalized);
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
                            <VideoPreview url={item.url} />
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
                    Drag to reorder. The first item must be an image (Cover).
                </p>
            )}
        </div>
    );
}
