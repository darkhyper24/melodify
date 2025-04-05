import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import ReactQueryProvider from "../providers/ReactQueryProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Melodify",
  description: "Your music streaming app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryProvider>
          <Navbar />
          <main className="pt-16">
            {children}
          </main>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
