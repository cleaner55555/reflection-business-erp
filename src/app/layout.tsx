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
  description: "Sveobuhvatan ERP + CRM sistem za upravljanje poslovanjem. Finansije, magacin, fakture, nabavka, CRM, HR, projekti, dokumenta i izveštavanje.",
  keywords: ["ERP", "CRM", "Reflection Business", "poslovanje", "finansije", "magacin", "fakture", "Srbija"],
  authors: [{ name: "Reflection Business Team" }],
  openGraph: {
    title: "Reflection Business",
    description: "Modularni ERP + CRM sistem za efikasno upravljanje poslovanjem",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr" suppressHydrationWarning>
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
