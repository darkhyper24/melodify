'use client'
import { Inter } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "../providers/ReactQueryProvider";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import ServiceWorkerRegistry from "@/components/ServiceWorkerRegistry";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    adjustFontFallback: false,
    preload: false,
});

export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
        <html lang="en" className={inter.className}>
            <head>
                <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
            </head>
            <body>
                <ReactQueryProvider>
                    <main className="relative min-h-screen">
                        {children}
                        <OfflineIndicator />
                        <ServiceWorkerRegistry />
                    </main>
                </ReactQueryProvider>
            </body>
        </html>
    );
  }
