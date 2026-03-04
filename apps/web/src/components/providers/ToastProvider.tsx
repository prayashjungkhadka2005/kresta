"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

function ToastNotifier() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        let hasShown = false;

        // 1. Handle "message" param for generic notifications
        const message = searchParams.get("message");
        const type = searchParams.get("type") || "success";

        if (message) {
            if (type === "error") {
                toast.error(message, { id: message });
            } else {
                toast.success(message, { id: message });
            }
            hasShown = true;
        }

        // 2. Handle specific action-based params for better UX
        if (searchParams.get("registered")) {
            toast.success("Account created successfully! Please sign in.", {
                id: "registration-success",
            });
            hasShown = true;
        }

        if (searchParams.get("loggedOut")) {
            toast.success("Successfully logged out.", {
                id: "logout-success",
            });
            hasShown = true;
        }

        if (searchParams.get("error")) {
            toast.error(searchParams.get("error"), {
                id: "url-error",
            });
            hasShown = true;
        }

        // 3. Clean up the URL if we showed a toast
        if (hasShown) {
            router.replace(pathname);
        }
    }, [searchParams, router, pathname]);

    return null;
}

export function ToastProvider() {
    return (
        <Suspense fallback={null}>
            <ToastNotifier />
        </Suspense>
    );
}
