import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Biznis Navigator — Moderni ERP Sistem",
  description: "Sveobuhvatan informacioni sistem za upravljanje poslovanjem. Finansije, magacin, fakture, nabavka, partneri i izveštavanje.",
  keywords: ["ERP", "Biznis Navigator", "poslovanje", "finansije", "magacin", "fakture", "Srbija"],
  authors: [{ name: "Biznis Navigator Team" }],
  openGraph: {
    title: "Biznis Navigator",
    description: "Modularni ERP sistem za efikasno upravljanje poslovanjem",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
