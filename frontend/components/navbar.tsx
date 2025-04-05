"use client"
import type React from "react"

import { usePathname, useRouter } from "next/navigation"
import { useWalletConnect } from "@/components/wallet-connect-provider"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Shield, ChevronDown, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { WalletIcon } from "@/components/wallet-icon"
import { getWalletName } from "@/lib/wallet-utils"

// Import the WalletSelectorModal
import { WalletSelectorModal } from "@/components/wallet-selector-modal"

// Update the Navbar component to use the wallet selector
const Navbar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const {
    isConnected,
    connect,
    connectWithWallet,
    disconnect,
    address,
    isConnecting,
    walletType,
    showWalletSelector,
    setShowWalletSelector,
  } = useWalletConnect()

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Wallets", path: "/wallets", protected: true },
  ]

  const handleNavigation = (path: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(path)
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2">
            <a
              href="/"
              onClick={(e) => handleNavigation("/", e)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-lg cursor-pointer"
            >
              <Shield className="h-5 w-5 text-white" />
            </a>
            <a
              href="/"
              onClick={(e) => handleNavigation("/", e)}
              className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 cursor-pointer"
            >
              zkOTP Wallet
            </a>
          </div>
          <nav className="mx-6 hidden md:flex items-center gap-6 text-sm">
            {navItems.map((item) => {
              if (item.protected && !isConnected) return null
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleNavigation(item.path, e)}
                  className={cn(
                    "transition-colors hover:text-foreground/80 relative group cursor-pointer",
                    pathname === item.path ? "text-foreground font-medium" : "text-foreground/60",
                  )}
                >
                  {item.name}
                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300",
                      pathname === item.path ? "w-full" : "w-0 group-hover:w-full",
                    )}
                  />
                </a>
              )
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {isConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 rounded-full border-purple-200 shadow-sm"
                  >
                    <WalletIcon walletType={walletType} className="h-4 w-4" />
                    <span className="hidden sm:inline-block">
                      {address?.substring(0, 6)}...{address?.substring(38)}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-purple-100">
                  <DropdownMenuItem className="text-muted-foreground">{getWalletName(walletType)}</DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={disconnect}
                    className="cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Disconnect All Wallets
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={connect}
                disabled={isConnecting}
                className="rounded-full shadow-md text-white"
                variant="gradient"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Add the wallet selector modal */}
      <WalletSelectorModal
        isOpen={showWalletSelector}
        onClose={() => setShowWalletSelector(false)}
        onSelectWallet={connectWithWallet}
        isConnecting={isConnecting}
      />
    </>
  )
}

export default Navbar

