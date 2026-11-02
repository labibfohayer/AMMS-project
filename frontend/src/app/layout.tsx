/* eslint-disable */
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import QueryProvider from "@/providers/QueryProvider";

const skBishal = localFont({
  src: [
    {
      path: "../../public/fonts/sk-bishal.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/sk-bishal-italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-sk-bishal",
  display: "swap",
});

const hindSiliguri = Hind_Siliguri({ 
    weight: ['300', '400', '500', '600', '700'],
    subsets: ["bengali", "latin"],
    variable: "--font-hind-siliguri",
    display: "swap",
});

export const metadata: Metadata = {
  title: "আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট",
  description: "আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট এর সম্পূর্ণ ডিজিটাল ম্যানেজমেন্ট সিস্টেম",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/logo.jpg", type: "image/jpeg", sizes: "1024x1024" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
};

export const viewport = {
  themeColor: "#2E7D32",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className={`${skBishal.variable} ${hindSiliguri.variable} font-sans`}>
        <QueryProvider>
          <AuthProvider>
            <LanguageProvider>
              {children}
              <Toaster position="top-center" />
            </LanguageProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
