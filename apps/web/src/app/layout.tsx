import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import { ToastProvider } from "@/components/providers/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kresta | Nepal Affiliate Platform",
  description: "Nepal's premium affiliate infrastructure for brands and creators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black`}
      >
        <AuthProvider>
          <ToastProvider />
          {children}
        </AuthProvider>
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
      </body>
    </html>
  );
}
