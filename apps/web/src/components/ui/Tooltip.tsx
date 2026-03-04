"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    className?: string;
    position?: "top" | "bottom" | "left" | "right";
    delay?: number;
}

export function Tooltip({
    content,
    children,
    className,
    position = "top",
    delay = 200
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const updateCoords = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();

        let x = rect.left + rect.width / 2;
        let y = rect.top;

        if (position === "bottom") {
            y = rect.bottom;
        } else if (position === "left") {
            x = rect.left;
            y = rect.top + rect.height / 2;
        } else if (position === "right") {
            x = rect.right;
            y = rect.top + rect.height / 2;
        }

        setCoords({ x: x + window.scrollX, y: y + window.scrollY });
    };

    const handleMouseEnter = () => {
        timeoutRef.current = setTimeout(() => {
            updateCoords();
            setIsVisible(true);
        }, delay);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(false);
    };

    const getInitialAnim = () => {
        switch (position) {
            case "top": return { opacity: 0, y: 4, scale: 0.95 };
            case "bottom": return { opacity: 0, y: -4, scale: 0.95 };
            case "left": return { opacity: 0, x: 4, scale: 0.95 };
            case "right": return { opacity: 0, x: -4, scale: 0.95 };
        }
    };

    const getPosStyles = () => {
        switch (position) {
            case "top": return "-translate-x-1/2 -translate-y-[calc(100%+8px)]";
            case "bottom": return "-translate-x-1/2 translate-y-2";
            case "left": return "-translate-x-[calc(100%+8px)] -translate-y-1/2";
            case "right": return "translate-x-2 -translate-y-1/2";
        }
    };

    return (
        <div
            ref={triggerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="inline-block"
        >
            {children}
            {mounted && createPortal(
                <AnimatePresence>
                    {isVisible && (
                        <motion.div
                            initial={getInitialAnim()}
                            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                            exit={getInitialAnim()}
                            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                            style={{
                                position: "absolute",
                                left: coords.x,
                                top: coords.y,
                                zIndex: 9999,
                                pointerEvents: "none"
                            }}
                            className={cn(
                                "px-2.5 py-1.5 bg-zinc-900 dark:bg-zinc-800 text-white text-[11px] font-bold rounded-lg shadow-xl border border-white/10 whitespace-nowrap uppercase tracking-wider",
                                getPosStyles(),
                                className
                            )}
                        >
                            {content}
                            {/* Arrow */}
                            <div className={cn(
                                "absolute border-4 border-transparent",
                                position === "top" && "bottom-[-8px] left-1/2 -translate-x-1/2 border-t-zinc-900 dark:border-t-zinc-800",
                                position === "bottom" && "top-[-8px] left-1/2 -translate-x-1/2 border-b-zinc-900 dark:border-b-zinc-800",
                                position === "left" && "right-[-8px] top-1/2 -translate-y-1/2 border-l-zinc-900 dark:border-l-zinc-800",
                                position === "right" && "left-[-8px] top-1/2 -translate-y-1/2 border-r-zinc-900 dark:border-r-zinc-800",
                            )} />
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
