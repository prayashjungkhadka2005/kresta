"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductStatus } from "shared";
import { toast } from "sonner";

interface StatusSelectProps {
    status: ProductStatus;
    approvalStatus: string;
    onUpdate: (newStatus: ProductStatus) => void;
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
}

const statusOptions: { label: string; value: ProductStatus; color: string }[] = [
    { label: "Active", value: "ACTIVE", color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20" },
    { label: "Paused", value: "PAUSED", color: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20" },
    { label: "Draft", value: "DRAFT", color: "text-gray-700 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-zinc-800/50 dark:border-zinc-700/50" },
];

export function StatusSelect({
    status,
    approvalStatus,
    onUpdate,
    isLoading = false,
    disabled = false,
    className
}: StatusSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState<{ x: number; y: number; width: number }>({ x: 0, y: 0, width: 0 });
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const updateCoords = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({
            x: rect.left + window.scrollX,
            y: rect.bottom + window.scrollY + 4,
            width: Math.max(rect.width, 120)
        });
    };

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled || isLoading) return;
        updateCoords();
        setIsOpen(!isOpen);
    };

    const handleSelect = (newStatus: ProductStatus) => {
        if (newStatus === "ACTIVE" && approvalStatus !== "APPROVED") {
            toast.error("This product must be approved by Kresta admin before it can be activated.", {
                id: "activation-block-toast"
            });
            setIsOpen(false);
            return;
        }

        if (newStatus !== status) {
            onUpdate(newStatus);
        }
        setIsOpen(false);
    };

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = () => setIsOpen(false);
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, [isOpen]);

    const activeOption = statusOptions.find(opt => opt.value === status) || statusOptions[2];

    return (
        <div className="relative inline-block">
            <button
                ref={triggerRef}
                onClick={handleToggle}
                disabled={disabled || isLoading}
                className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100",
                    activeOption.color,
                    !disabled && !isLoading && "hover:brightness-95 dark:hover:brightness-110 cursor-pointer",
                    className
                )}
            >
                {isLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                    <>
                        {activeOption.label}
                        <ChevronDown className={cn("w-3 h-3 opacity-50 transition-transform", isOpen && "rotate-180")} />
                    </>
                )}
            </button>

            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                            style={{
                                position: "absolute",
                                left: coords.x,
                                top: coords.y,
                                minWidth: coords.width,
                                zIndex: 9999
                            }}
                            className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-xl overflow-hidden p-1"
                        >
                            {statusOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelect(option.value);
                                    }}
                                    className={cn(
                                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors",
                                        option.value === status
                                            ? "bg-gray-50 dark:bg-zinc-800 text-black dark:text-white"
                                            : "text-gray-500 dark:text-zinc-500 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-zinc-300"
                                    )}
                                >
                                    {option.label}
                                    {option.value === status && <Check className="w-3 h-3" />}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
