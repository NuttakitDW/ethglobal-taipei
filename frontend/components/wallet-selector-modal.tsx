"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MetaMaskIcon } from "@/components/wallet-icons/metamask-icon"
import { TrustIcon } from "@/components/wallet-icons/trust-icon"
import { WalletConnectIcon } from "@/components/wallet-icons/walletconnect-icon"
import { OKXIcon } from "@/components/wallet-icons/okx-icon"
import { Loader2 } from "lucide-react"

interface WalletSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectWallet: (walletType: string) => Promise<void>
  isConnecting: boolean
}

export function WalletSelectorModal({ isOpen, onClose, onSelectWallet, isConnecting }: WalletSelectorModalProps) {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)

  const handleWalletSelect = async (walletType: string) => {
    setSelectedWallet(walletType)
    await onSelectWallet(walletType)
    setSelectedWallet(null)
  }

  const walletOptions = [
    {
      id: "metamask",
      name: "MetaMask",
      icon: <MetaMaskIcon className="h-8 w-8" />,
      description: "Connect to your MetaMask wallet",
    },
    {
      id: "okx",
      name: "OKX Wallet",
      icon: <OKXIcon className="h-8 w-8" />,
      description: "Connect to your OKX wallet",
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      icon: <WalletConnectIcon className="h-8 w-8" />,
      description: "Connect using WalletConnect protocol",
    },
    {
      id: "trust",
      name: "Trust Wallet",
      icon: <TrustIcon className="h-8 w-8" />,
      description: "Connect to your Trust wallet",
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Select a wallet to connect. Your wallet will be used as the parent wallet for your zkOTP wallets.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {walletOptions.map((wallet) => (
            <Button
              key={wallet.id}
              variant="outline"
              className={`flex items-center justify-start gap-3 p-4 h-auto rounded-xl ${
                isConnecting && selectedWallet === wallet.id ? "bg-muted" : ""
              }`}
              onClick={() => handleWalletSelect(wallet.id)}
              disabled={isConnecting}
            >
              <div className="flex-shrink-0">{wallet.icon}</div>
              <div className="flex flex-col items-start">
                <span className="font-medium">{wallet.name}</span>
                <span className="text-xs text-muted-foreground">{wallet.description}</span>
              </div>
              {isConnecting && selectedWallet === wallet.id && <Loader2 className="h-4 w-4 ml-auto animate-spin" />}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

