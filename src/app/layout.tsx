import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/error-boundary";

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
  title: "Reflection ERP — Enterprise Business Platform",
  description: "Kompletni ERP + CRM sistem za upravljanje poslovanjem. Finansije, magacin, fakture, nabavka, CRM, HR, projekti, dokumenta i izveštaji. 127+ modula, 90+ jezika. PWA podrška za mobilne uređaje.",
  keywords: ["ERP", "CRM", "Reflection ERP", "Reflection Business", "poslovanje", "finansije", "magacin", "fakture", "Srbija", "PWA", "mobilna aplikacija"],
  authors: [{ name: "Reflection Business Team" }],
  openGraph: {
    title: "Reflection ERP — Enterprise Business Platform",
    description: "Modularni ERP + CRM sistem za efikasno upravljanje poslovanjem. 127+ modula, 90+ jezika. Instaliraj kao aplikaciju.",
    type: "website",
    locale: "sr_RS",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Reflection ERP",
    startupImage: [
      { url: "/icons/icon-192.png", media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/icons/icon-384.svg", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Reflection ERP",
    "application-name": "Reflection ERP",
    "msapplication-TileColor": "#09090b",
    "msapplication-tap-highlight": "no",
    "format-detection": "telephone=no",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
 viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr" suppressHydrationWarning>
      <head>
        {/* Tailwind CSS CDN - dev mode only (avoids oxide worker OOM) */}
        <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
        {/* Apple touch icons for iOS home screen */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192.png" />
        {/* iOS splash screens */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Reflection ERP" />
        {/* Android theme color */}
        <meta name="theme-color" content="#09090b" />
        {/* Prevent phone number detection */}
        <meta name="format-detection" content="telephone=no" />
        {/* Safe area insets for notched devices */}
        <meta name="viewport-fit" content="cover" />
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
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
