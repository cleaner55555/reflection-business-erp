import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reflection Business — ERP + CRM Sistem",
  description: "Kompletni ERP + CRM sistem za upravljanje poslovanjem. Finansije, magacin, fakture, nabavka, CRM, HR, projekti, dokumenta i izveštaji. 148 modula, 82 zemlje, 82 jezika.",
  keywords: ["ERP", "CRM", "Reflection Business", "poslovanje", "finansije", "magacin", "fakture", "Srbija", "148 modula"],
  authors: [{ name: "Reflection Business Team" }],
  openGraph: {
    title: "Reflection Business — ERP + CRM Sistem",
    description: "Modularni ERP + CRM sistem za efikasno upravljanje poslovanjem. 148 modula, 82 zemlje, 82 jezika.",
    type: "website",
    locale: "sr_RS",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
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
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
