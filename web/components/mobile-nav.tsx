"use client"

import type React from "react"

import { usePathname, useRouter } from "next/navigation"
import { Home, Wallet, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWalletConnect } from "@/components/wallet-connect-provider"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { isConnected } = useWalletConnect()

  // Update the navItems array to remove Transfer and Contract routes
  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Wallets", path: "/wallets", icon: Wallet, protected: true },
  ]

  const filteredNavItems = navItems.filter((item) => !item.protected || (item.protected && isConnected))

  const handleNavigation = (path: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    router.push(path)
  }

  return (
    <>
      <div className="hidden sm:block status-bar-fill bg-gradient-to-r from-purple-600 to-indigo-600" />
      <nav className="mobile-nav sm:hidden">
        {filteredNavItems.slice(0, 4).map((item) => (
          <a
            key={item.path}
            href={item.path}
            onClick={(e) => handleNavigation(item.path, e)}
            className={cn(
              "flex flex-col items-center justify-center px-4 py-2 text-xs",
              pathname === item.path ? "text-primary font-medium" : "text-muted-foreground",
            )}
          >
            <div className={cn("p-2 rounded-full mb-1", pathname === item.path ? "bg-primary/10" : "bg-transparent")}>
              <item.icon className={cn("h-5 w-5", pathname === item.path ? "text-primary" : "text-muted-foreground")} />
            </div>
            {item.name}
          </a>
        ))}
        {filteredNavItems.length > 4 && (
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center px-4 py-2 text-xs text-muted-foreground">
                <div className="p-2 rounded-full mb-1">
                  <Menu className="h-5 w-5" />
                </div>
                More
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[40vh] rounded-t-3xl">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>Additional navigation options</SheetDescription>
              </SheetHeader>
              <div className="grid grid-cols-3 gap-4 py-4">
                {filteredNavItems.slice(4).map((item) => (
                  <a
                    key={item.path}
                    href={item.path}
                    onClick={(e) => {
                      handleNavigation(item.path, e)
                      document.body.click() // Close the sheet
                    }}
                    className="flex flex-col items-center justify-center h-24 rounded-xl shadow-sm hover:shadow-md transition-all border p-4"
                  >
                    <div className="bg-primary/10 p-3 rounded-full mb-2">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    {item.name}
                  </a>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </nav>
    </>
  )
}

