"use client";

import React from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "default" | "danger";
    isLoading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "default",
    isLoading = false
}: ConfirmDialogProps) {
    return (
        <Dialog isOpen={isOpen} onClose={onClose} size="sm">
            <DialogHeader title={title} />
            <DialogBody className="pt-0 pb-2">
                <div className="flex items-start gap-4">
                    {variant === "danger" && (
                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                    )}
                    <p className="text-sm font-medium text-gray-600 dark:text-zinc-400 leading-relaxed">
                        {description}
                    </p>
                </div>
            </DialogBody>
            <DialogFooter>
                <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
                    {cancelLabel}
                </Button>
                <Button
                    variant={variant === "danger" ? "danger" : "default"}
                    size="sm"
                    onClick={onConfirm}
                    isLoading={isLoading}
                >
                    {confirmLabel}
                </Button>
            </DialogFooter>
        </Dialog>
    );
}
