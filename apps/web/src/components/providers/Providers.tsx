"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 minute
                retry: 1,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <ToastProvider />
                {children}
                <Toaster
                    position="top-center"
                    richColors
                    theme="system"
                    visibleToasts={3}
                    swipeDirections={['top']}
                    toastOptions={{
                        duration: 3000,
                        className: "font-sans",
                        style: {
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: '700',
                            padding: '12px 16px',
                            border: '1px solid var(--border)',
                            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)',
                        },
                    }}
                />
            </AuthProvider>
        </QueryClientProvider>
    );
}
