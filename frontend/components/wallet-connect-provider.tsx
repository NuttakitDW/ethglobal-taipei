"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import type { WalletType as WalletDataType } from "@/components/wallet-provider"
import { detectWalletType, type WalletType } from "@/lib/wallet-utils"

type WalletConnectContextType = {
  connect: () => Promise<void>
  connectWithWallet: (walletType: string) => Promise<void>
  disconnect: () => void
  address: string | null
  isConnected: boolean
  wallets: WalletDataType[]
  addWallet: (wallet: WalletDataType) => void
  setActiveWallet: (walletId: string) => void
  activeWallet: WalletDataType | null
  isConnecting: boolean
  walletType: WalletType
  showWalletSelector: boolean
  setShowWalletSelector: (show: boolean) => void
  selectedWalletType: string | null
}

const WalletConnectContext = createContext<WalletConnectContextType | undefined>(undefined)

// Function to get wallet name based on wallet type
const getWalletName = (walletType: WalletType): string => {
  switch (walletType) {
    case "metamask":
      return "MetaMask"
    case "coinbase":
      return "Coinbase Wallet"
    case "trust":
      return "Trust Wallet"
    case "okx":
      return "OKX Wallet"
    case "walletconnect":
      return "WalletConnect"
    default:
      return "Unknown Wallet"
  }
}

export function WalletConnectProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [wallets, setWallets] = useState<WalletDataType[]>([])
  const [activeWallet, setActiveWallet] = useState<WalletDataType | null>(null)
  const [walletType, setWalletType] = useState<WalletType>("unknown")
  const [showWalletSelector, setShowWalletSelector] = useState(false)
  const [selectedWalletType, setSelectedWalletType] = useState<string | null>(null)
  const { toast } = useToast()

  // Check if wallet is already connected on mount
  useEffect(() => {
    const storedAccount = localStorage.getItem("connectedAccount")
    if (storedAccount) {
      setAddress(storedAccount)
      // Try to detect wallet type
      const storedWalletType = localStorage.getItem("walletType") as WalletType
      setWalletType(storedWalletType || detectWalletType())
    }

    // Load mock wallets from local storage
    const storedWallets = localStorage.getItem("wallets")
    if (storedWallets) {
      try {
        const parsedWallets = JSON.parse(storedWallets)

        // Convert date strings back to Date objects
        const processedWallets = parsedWallets.map((wallet: WalletDataType) => ({
          ...wallet,
          createdAt: wallet.createdAt ? new Date(wallet.createdAt) : new Date(),
        }))

        setWallets(processedWallets)

        const activeWalletId = localStorage.getItem("activeWallet")
        if (activeWalletId) {
          const foundWallet = processedWallets.find((w: WalletDataType) => w.id === activeWalletId)
          if (foundWallet) {
            setActiveWallet(foundWallet)
          }
        } else if (processedWallets.length > 0) {
          setActiveWallet(processedWallets[0])
          localStorage.setItem("activeWallet", processedWallets[0].id)
        }
      } catch (error) {
        console.error("Error parsing wallets from localStorage:", error)
        setWallets([])
      }
    }
  }, [])

  // Save wallets to local storage when updated
  useEffect(() => {
    if (wallets.length > 0) {
      localStorage.setItem("wallets", JSON.stringify(wallets))
    }
  }, [wallets])

  const connect = async () => {
    // Show wallet selector instead of directly connecting
    setShowWalletSelector(true)
  }

  const connectWithWallet = async (selectedWalletType: string) => {
    setIsConnecting(true)
    setSelectedWalletType(selectedWalletType)

    try {
      // Different connection logic based on wallet type
      switch (selectedWalletType) {
        case "metamask":
          await connectMetaMask()
          break
        case "okx":
          await connectOKX()
          break
        case "walletconnect":
          await connectWalletConnect()
          break
        case "trust":
          await connectTrustWallet()
          break
        default:
          // Fallback to mock connection
          await mockWalletConnection(selectedWalletType)
      }
    } catch (error) {
      console.error(`Error connecting with ${selectedWalletType}:`, error)
      toast({
        title: "Connection Failed",
        description: `Failed to connect with ${getWalletName(selectedWalletType as WalletType)}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
      setSelectedWalletType(null)
    }
  }

  // MetaMask connection
  const connectMetaMask = async () => {
    if (typeof window !== "undefined" && window.ethereum && window.ethereum.isMetaMask) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        handleSuccessfulConnection(accounts[0], "metamask")
        return
      }
    }

    // If MetaMask is not available or connection fails, use mock
    await mockWalletConnection("metamask")
  }

  // OKX Wallet connection
  const connectOKX = async () => {
    // In a real implementation, we would check for window.okxwallet
    // For demo purposes, we'll use a mock connection
    await mockWalletConnection("okx")
  }

  // WalletConnect connection
  const connectWalletConnect = async () => {
    // In a real implementation, we would use the WalletConnect SDK
    // For demo purposes, we'll use a mock connection
    await mockWalletConnection("walletconnect")
  }

  // Trust Wallet connection
  const connectTrustWallet = async () => {
    // In a real implementation, we would check for Trust Wallet provider
    // For demo purposes, we'll use a mock connection
    await mockWalletConnection("trust")
  }

  // Mock wallet connection for demo purposes
  const mockWalletConnection = async (walletTypeStr: string) => {
    // Generate a random Ethereum address
    const mockAddress = "0x" + Math.random().toString(16).substring(2, 42)
    handleSuccessfulConnection(mockAddress, walletTypeStr as WalletType)

    // Add a note that this is a demo connection
    toast({
      title: "Demo Mode",
      description: `This is a simulated connection to ${getWalletName(walletTypeStr as WalletType)}.`,
      variant: "default",
    })
  }

  // Handle successful connection
  const handleSuccessfulConnection = (address: string, walletTypeStr: WalletType) => {
    setAddress(address)
    localStorage.setItem("connectedAccount", address)

    setWalletType(walletTypeStr)
    localStorage.setItem("walletType", walletTypeStr)

    toast({
      title: "Wallet Connected",
      description: `Connected to ${address.substring(0, 6)}...${address.substring(38)} with ${getWalletName(walletTypeStr)}`,
    })

    setShowWalletSelector(false)
  }

  const disconnect = () => {
    // Clear parent wallet data
    setAddress(null)
    setWalletType("unknown")
    localStorage.removeItem("connectedAccount")
    localStorage.removeItem("walletType")

    // Clear child wallets data
    setWallets([])
    setActiveWallet(null)

    // Remove active wallet selection
    localStorage.removeItem("activeWallet")

    toast({
      title: "Wallet Disconnected",
      description: "Your wallet and all associated zkOTP wallets have been disconnected.",
    })
  }

  // Add a new wallet
  const addNewWallet = (wallet: WalletDataType) => {
    setWallets((prev) => [...prev, wallet])
    setActiveWallet(wallet)
    localStorage.setItem("activeWallet", wallet.id)
  }

  // Set active wallet
  const handleSetActiveWallet = (walletId: string) => {
    const wallet = wallets.find((w) => w.id === walletId)
    if (wallet) {
      setActiveWallet(wallet)
      localStorage.setItem("activeWallet", walletId)
    }
  }

  return (
    <WalletConnectContext.Provider
      value={{
        connect,
        connectWithWallet,
        disconnect,
        address,
        isConnected: !!address,
        wallets,
        addWallet: addNewWallet,
        setActiveWallet: handleSetActiveWallet,
        activeWallet,
        isConnecting,
        walletType,
        showWalletSelector,
        setShowWalletSelector,
        selectedWalletType,
      }}
    >
      {children}
    </WalletConnectContext.Provider>
  )
}

export const useWalletConnect = () => {
  const context = useContext(WalletConnectContext)
  if (context === undefined) {
    throw new Error("useWalletConnect must be used within a WalletConnectProvider")
  }
  return context
}

// Add this to make TypeScript happy with window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      isMetaMask?: boolean
      isCoinbaseWallet?: boolean
      isTrust?: boolean
      isWalletConnect?: boolean
    }
    okxwallet?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
    }
  }
}

