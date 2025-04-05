"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Check, ChevronDown } from "lucide-react"
import { EthereumIcon } from "@/components/wallet-icons/ethereum-icon"
import { OptimismIcon } from "@/components/wallet-icons/optimism-icon"
import { ArbitrumIcon } from "@/components/wallet-icons/arbitrum-icon"
import { PolygonIcon } from "@/components/wallet-icons/polygon-icon"
import { BaseIcon } from "@/components/wallet-icons/base-icon"
import { CeloIcon } from "@/components/wallet-icons/celo-icon"
import { cn } from "@/lib/utils"

type Network = {
  id: string
  name: string
  icon: React.ReactNode
  isTestnet?: boolean
}

const networks: Network[] = [
  {
    id: "ethereum",
    name: "Ethereum",
    icon: <EthereumIcon className="h-5 w-5" />,
  },
  {
    id: "optimism",
    name: "Optimism",
    icon: <OptimismIcon className="h-5 w-5" />,
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    icon: <ArbitrumIcon className="h-5 w-5" />,
  },
  {
    id: "polygon",
    name: "Polygon",
    icon: <PolygonIcon className="h-5 w-5" />,
  },
  {
    id: "base",
    name: "Base",
    icon: <BaseIcon className="h-5 w-5" />,
  },
  {
    id: "celo",
    name: "Celo",
    icon: <CeloIcon className="h-5 w-5" />,
  },
]

interface NetworkSelectorProps {
  onNetworkChange?: (networkId: string) => void
  className?: string
}

export function NetworkSelector({ onNetworkChange, className }: NetworkSelectorProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(networks[0])

  const handleNetworkChange = (network: Network) => {
    setSelectedNetwork(network)
    if (onNetworkChange) {
      onNetworkChange(network.id)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-full px-4 py-2 h-auto shadow-sm transition-all",
            className,
          )}
        >
          {selectedNetwork.icon}
          <span className="font-medium text-gray-800">{selectedNetwork.name}</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px] p-2">
        {networks.map((network) => (
          <DropdownMenuItem
            key={network.id}
            className={cn(
              "flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md",
              selectedNetwork.id === network.id ? "bg-gray-100" : "hover:bg-gray-50",
            )}
            onClick={() => handleNetworkChange(network)}
          >
            {network.icon}
            <span className="flex-1 font-medium">{network.name}</span>
            {selectedNetwork.id === network.id && <Check className="h-4 w-4 text-green-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

