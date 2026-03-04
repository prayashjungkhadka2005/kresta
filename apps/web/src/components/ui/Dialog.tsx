"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    size?: "sm" | "md" | "lg" | "xl" | "full";
    closeOnBackdrop?: boolean;
}

export function Dialog({
    isOpen,
    onClose,
    children,
    className,
    size = "md",
    closeOnBackdrop = true
}: DialogProps) {
    // Lock scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    const sizes = {
        sm: "max-w-[420px]",
        md: "max-w-xl",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "max-w-[95vw] h-[90vh]",
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
                        onClick={closeOnBackdrop ? onClose : undefined}
                    />

                    {/* Dialog Content Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 4 }}
                        transition={{
                            duration: 0.2,
                            ease: [0.23, 1, 0.32, 1]
                        }}
                        className={cn(
                            "relative w-full bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-2xl transition-colors overflow-hidden",
                            sizes[size],
                            className
                        )}
                    >
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export function DialogHeader({
    title,
    description,
    className
}: {
    title: string;
    description?: string;
    className?: string;
}) {
    return (
        <div className={cn("px-6 py-4 flex items-center justify-between", className)}>
            <div className="space-y-1">
                <h3 className="text-[17px] font-black tracking-tight text-gray-900 dark:text-white">
                    {title}
                </h3>
                {description && (
                    <p className="text-[13px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

export function DialogBody({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("p-6", className)}>
            {children}
        </div>
    );
}

export function DialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("px-6 pb-6 pt-2 flex justify-end gap-3", className)}>
            {children}
        </div>
    );
}
