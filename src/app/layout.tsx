import type { Metadata, Viewport } from "next";
import { Rajdhani, Inter } from "next/font/google";
import "./globals.css";
import SoundSync from "@/components/shared/SoundSync";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Shinobi Clash TCG",
  description: "A premium Naruto-themed trading card game — collect, build decks, and battle.",
  applicationName: "Shinobi Clash",
  appleWebApp: {
    capable: true,
    title: "Shinobi Clash",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  other: {
    // Legacy iOS (<16.4) requires the apple-prefixed variant in addition to the
    // standard mobile-web-app-capable meta that Next emits.
    'apple-mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1018",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${rajdhani.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-naruto-dark text-white overscroll-none touch-manipulation select-none pt-[env(safe-area-inset-top)]">
        <SoundSync />
        {children}
      </body>
    </html>
  );
}
