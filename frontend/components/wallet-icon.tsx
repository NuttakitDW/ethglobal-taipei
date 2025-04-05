import type { WalletType } from "@/lib/wallet-utils"
import { Wallet } from "lucide-react"
import { MetaMaskIcon } from "./wallet-icons/metamask-icon"
import { CoinbaseIcon } from "./wallet-icons/coinbase-icon"
import { TrustIcon } from "./wallet-icons/trust-icon"
import { WalletConnectIcon } from "./wallet-icons/walletconnect-icon"
// Import the OKX icon
import { OKXIcon } from "./wallet-icons/okx-icon"

interface WalletIconProps {
  walletType: WalletType
  className?: string
}

export function WalletIcon({ walletType, className = "" }: WalletIconProps) {
  // Update the switch statement to include okx
  switch (walletType) {
    case "metamask":
      return <MetaMaskIcon className={className} />
    case "coinbase":
      return <CoinbaseIcon className={className} />
    case "trust":
      return <TrustIcon className={className} />
    case "walletconnect":
      return <WalletConnectIcon className={className} />
    case "okx":
      return <OKXIcon className={className} />
    default:
      return <Wallet className={className} />
  }
}

