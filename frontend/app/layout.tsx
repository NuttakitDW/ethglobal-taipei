import type React from "react"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { WalletProvider } from "@/components/wallet-provider"
import { WalletConnectProvider } from "@/components/wallet-connect-provider"
import Navbar from "@/components/navbar"
import { MobileNav } from "@/components/mobile-nav"
import "@/app/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "zkOTP Wallet",
  description: "A privacy-focused wallet with zkOTP verification",
  manifest: "/manifest.json",
  themeColor: "#7c3aed",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "zkOTP Wallet",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
          <WalletConnectProvider>
            <WalletProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1 pb-16 sm:pb-0">{children}</main>
                <footer className="border-t py-6 hidden sm:block">
                  <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-center text-sm text-muted-foreground md:text-left">
                      &copy; {new Date().getFullYear()} zkOTP Wallet. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                      <a href="#" className="text-sm text-muted-foreground hover:underline">
                        Terms
                      </a>
                      <a href="#" className="text-sm text-muted-foreground hover:underline">
                        Privacy
                      </a>
                    </div>
                  </div>
                </footer>
                <MobileNav />
              </div>
              <Toaster />
            </WalletProvider>
          </WalletConnectProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'