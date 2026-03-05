import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export type NavigationContext = 'marketplace' | 'brands' | 'dashboard' | 'product' | 'brand' | 'history';

export interface NavigationMetadata {
    label: string;
    basePath: string;
}

export interface StackItem {
    url: string;
    context: NavigationContext;
    label: string;
    basePath: string;
}

export const navigationStore = {
    getStack: (): StackItem[] => {
        if (typeof window === 'undefined') return [];
        try {
            return JSON.parse(sessionStorage.getItem('kresta_nav_stack') || '[]');
        } catch {
            return [];
        }
    },

    setStack: (stack: StackItem[]) => {
        if (typeof window === 'undefined') return;
        sessionStorage.setItem('kresta_nav_stack', JSON.stringify(stack));
    },

    pushStack: (item: StackItem) => {
        if (typeof window === 'undefined') return;
        const stack = navigationStore.getStack();
        const currentUrlBase = item.url.split('?')[0];

        // 1. Root contexts reset the stack
        if (item.context === 'marketplace' || item.context === 'brands' || item.context === 'dashboard') {
            navigationStore.setStack([item]);
            return;
        }

        // 2. Loop collapse: Is this page already in the stack?
        const existingIndex = stack.findIndex(s => s.url.split('?')[0] === currentUrlBase);

        if (existingIndex !== -1) {
            const newStack = stack.slice(0, existingIndex + 1);
            newStack[existingIndex] = item; // Update with latest search params
            navigationStore.setStack(newStack);
        } else {
            // 3. New deep page
            navigationStore.setStack([...stack, item]);
        }
    },

    peekStack: (): StackItem | null => {
        const stack = navigationStore.getStack();
        if (stack.length <= 1) return null;
        return stack[stack.length - 2];
    },

    // Legacy Stubs to prevent breaking existing code during migration
    saveFullUrl: () => { },
    getFullUrl: () => null,
    saveState: () => { },
    getMetadata: () => null,
    getState: () => null,
    clearState: () => { },
    getRecoveredUrl: (baseHref: string) => baseHref
};

export function useNavigationContext(
    context: NavigationContext,
    metadata: NavigationMetadata,
    type?: 'state' | 'full'
) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Destructure to avoid infinite re-renders from metadata object identity
    const label = metadata?.label || 'Back';
    const basePath = metadata?.basePath || '/';

    useEffect(() => {
        const searchString = searchParams.toString();
        const url = searchString ? `${pathname}?${searchString}` : pathname;

        navigationStore.pushStack({
            url,
            context,
            label,
            basePath
        });
    }, [context, label, basePath, pathname, searchParams]);
}
