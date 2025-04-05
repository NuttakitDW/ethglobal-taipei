"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWallet, type WalletType } from "@/components/wallet-provider"
import { Button } from "@/components/ui/button"
import { Plus, Wallet } from "lucide-react"
import { useRouter } from "next/navigation"

interface WalletSelectProps {
  hideAddButton?: boolean
}

export function WalletSelect({ hideAddButton = false }: WalletSelectProps) {
  const { wallets, activeWallet, setActiveWallet } = useWallet()
  const router = useRouter()

  // Handle wallet selection
  const handleSelectWallet = (walletId: string) => {
    setActiveWallet(walletId)
  }

  // Handle creating a new wallet
  const handleCreateWallet = () => {
    router.push("/create-wallet")
  }

  return (
    <div className="flex flex-col md:flex-row gap-2 items-center">
      <div className="w-full md:max-w-[300px]">
        <Select value={activeWallet?.id} onValueChange={handleSelectWallet} disabled={wallets.length === 0}>
          <SelectTrigger className="rounded-xl shadow-sm border-purple-100">
            <SelectValue placeholder={wallets.length === 0 ? "No wallets available" : "Select a wallet"}>
              {activeWallet && (
                <div className="flex items-center">
                  <div className="bg-primary/10 p-1 rounded-full mr-2">
                    <Wallet className="h-4 w-4 text-primary" />
                  </div>
                  <span>
                    {activeWallet.name} ({activeWallet.balance} ETH)
                  </span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-lg border-purple-100">
            {wallets.map((wallet: WalletType) => (
              <SelectItem key={wallet.id} value={wallet.id} className="py-3 cursor-pointer hover:bg-purple-50">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-1 rounded-full mr-2">
                    <Wallet className="h-4 w-4 text-primary" />
                  </div>
                  <span>
                    {wallet.name} ({wallet.balance} ETH)
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {!hideAddButton && (
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 rounded-full shadow-sm border-purple-100 hover:shadow-md transition-all"
          onClick={handleCreateWallet}
        >
          <Plus className="h-4 w-4 text-primary" />
          <span className="sr-only">Add wallet</span>
        </Button>
      )}
    </div>
  )
}

