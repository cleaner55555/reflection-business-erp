import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Plus_Jakarta_Sans } from "next/font/google";
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

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Reflection",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} antialiased bg-background text-foreground`}
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
