'use client'
import { Inter } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "../providers/ReactQueryProvider";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { useEffect } from 'react';

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
});

export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            // First, unregister any existing service workers
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                registrations.forEach((registration) => {
                    registration.unregister();
                });
            }).then(() => {
                // Then register the new service worker
                return navigator.serviceWorker.register('/sw.js');
            }).then((registration) => {
                console.log('Service Worker registration successful:', registration.scope);
            }).catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
        }
    }, []);
  
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
                </main>
                </ReactQueryProvider>
            </body>
        </html>
    );
  }
