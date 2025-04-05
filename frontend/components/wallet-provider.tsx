"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useWalletConnect } from "@/components/wallet-connect-provider"

// Mock wallet types and data
export type WalletType = {
  id: string
  address: string
  name: string
  balance: string
  createdAt: Date
  ownerAddress: string
  otpSecret?: string
  recoveryMethods?: {
    selfProtocol?: boolean
  }
  hashkeyVerified?: boolean
  hashkeyTxHash?: string
}

type WalletContextType = {
  connectedAccount: string | null
  isConnected: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  wallets: WalletType[]
  addWallet: (wallet: WalletType) => void
  setActiveWallet: (walletId: string) => void
  activeWallet: WalletType | null
  isConnecting: boolean
  updateWalletOtpSecret: (walletId: string, newSecret: string) => void
  linkRecoveryMethod: (walletId: string, method: "selfProtocol") => void
  hasRecoveryMethod: (walletId: string, method: "selfProtocol") => boolean
  verifyHashkey: (walletId: string) => Promise<boolean>
  hasHashkeyVerification: (walletId: string) => boolean
  getHashkeyTxHash: (walletId: string) => string | undefined
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallets, setWallets] = useState<WalletType[]>([])
  const [activeWallet, setActiveWallet] = useState<WalletType | null>(null)
  const { toast } = useToast()
  const {
    address: connectedAccount,
    isConnected,
    connect: connectWalletConnect,
    disconnect: disconnectWalletConnect,
    isConnecting,
  } = useWalletConnect()

  // Load mock wallets from local storage
  useEffect(() => {
    if (connectedAccount) {
      const storedWallets = localStorage.getItem("wallets")
      if (storedWallets) {
        try {
          const parsedWallets = JSON.parse(storedWallets)

          // Convert date strings back to Date objects
          const processedWallets = parsedWallets.map((wallet: WalletType) => ({
            ...wallet,
            createdAt: new Date(wallet.createdAt),
          }))

          // Filter wallets by owner address
          const filteredWallets = processedWallets.filter(
            (wallet: WalletType) => wallet.ownerAddress === connectedAccount,
          )

          setWallets(filteredWallets)

          const activeWalletId = localStorage.getItem("activeWallet")
          if (activeWalletId) {
            const foundWallet = filteredWallets.find((w: WalletType) => w.id === activeWalletId)
            if (foundWallet) {
              setActiveWallet(foundWallet)
            } else if (filteredWallets.length > 0) {
              setActiveWallet(filteredWallets[0])
              localStorage.setItem("activeWallet", filteredWallets[0].id)
            }
          } else if (filteredWallets.length > 0) {
            setActiveWallet(filteredWallets[0])
            localStorage.setItem("activeWallet", filteredWallets[0].id)
          }
        } catch (error) {
          console.error("Error parsing wallets from localStorage:", error)
          // If there's an error, start with empty wallets
          setWallets([])
        }
      }
    } else {
      // Reset wallets when disconnected
      setWallets([])
      setActiveWallet(null)
    }
  }, [connectedAccount])

  // Save wallets to local storage when updated
  useEffect(() => {
    if (wallets.length > 0) {
      // Get all wallets from storage first
      const storedWallets = localStorage.getItem("wallets")
      let allWallets: WalletType[] = []

      if (storedWallets) {
        try {
          const parsedWallets = JSON.parse(storedWallets)
          // Filter out wallets for the current account
          allWallets = parsedWallets.filter((wallet: WalletType) => wallet.ownerAddress !== connectedAccount)
        } catch (error) {
          console.error("Error parsing wallets from localStorage:", error)
        }
      }

      // Add the current account's wallets
      allWallets = [...allWallets, ...wallets]
      localStorage.setItem("wallets", JSON.stringify(allWallets))
    }
  }, [wallets, connectedAccount])

  // Connect wallet function - delegate to WalletConnect
  const connectWallet = async () => {
    await connectWalletConnect()
  }

  // Disconnect wallet function
  const disconnectWallet = () => {
    disconnectWalletConnect()
  }

  // Add a new wallet
  const addNewWallet = (wallet: WalletType) => {
    // Initialize recovery methods if not provided
    const walletWithRecovery = {
      ...wallet,
      recoveryMethods: wallet.recoveryMethods || { selfProtocol: false },
    }

    setWallets((prev) => [...prev, walletWithRecovery])
    setActiveWallet(walletWithRecovery)
    localStorage.setItem("activeWallet", walletWithRecovery.id)
  }

  // Set active wallet
  const handleSetActiveWallet = (walletId: string) => {
    const wallet = wallets.find((w) => w.id === walletId)
    if (wallet) {
      setActiveWallet(wallet)
      localStorage.setItem("activeWallet", walletId)
    }
  }

  // Update wallet OTP secret (for recovery)
  const updateWalletOtpSecret = (walletId: string, newSecret: string) => {
    setWallets((prev) =>
      prev.map((wallet) => {
        if (wallet.id === walletId) {
          return { ...wallet, otpSecret: newSecret }
        }
        return wallet
      }),
    )

    // Update active wallet if it's the one being updated
    if (activeWallet && activeWallet.id === walletId) {
      setActiveWallet((prev) => (prev ? { ...prev, otpSecret: newSecret } : null))
    }

    toast({
      title: "OTP Secret Updated",
      description: "Your wallet's OTP secret has been updated successfully.",
    })
  }

  // Link a recovery method to a wallet
  const linkRecoveryMethod = (walletId: string, method: "selfProtocol") => {
    setWallets((prev) =>
      prev.map((wallet) => {
        if (wallet.id === walletId) {
          return {
            ...wallet,
            recoveryMethods: {
              ...wallet.recoveryMethods,
              [method]: true,
            },
          }
        }
        return wallet
      }),
    )

    // Update active wallet if it's the one being updated
    if (activeWallet && activeWallet.id === walletId) {
      setActiveWallet((prev) => {
        if (prev) {
          return {
            ...prev,
            recoveryMethods: {
              ...prev.recoveryMethods,
              [method]: true,
            },
          }
        }
        return prev
      })
    }

    toast({
      title: "Recovery Method Linked",
      description: "Self Protocol has been linked to your wallet.",
    })
  }

  // Check if a wallet has a specific recovery method
  const hasRecoveryMethod = (walletId: string, method: "selfProtocol") => {
    const wallet = wallets.find((w) => w.id === walletId)
    return wallet?.recoveryMethods?.[method] || false
  }

  // Verify wallet on Hashkey chain
  const verifyHashkey = async (walletId: string) => {
    const wallet = wallets.find((w) => w.id === walletId)
    if (!wallet) {
      toast({
        title: "Wallet Not Found",
        description: "The selected wallet could not be found.",
        variant: "destructive",
      })
      return false
    }

    // Check if Self Protocol is verified first
    if (!wallet.recoveryMethods?.selfProtocol) {
      toast({
        title: "Self Protocol Required",
        description: "You must verify with Self Protocol before enabling Hashkey KYC.",
        variant: "destructive",
      })
      return false
    }

    try {
      // Simulate cross-chain communication with a delay
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Generate a mock transaction hash
      const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`

      // Update the wallet with Hashkey verification
      setWallets((prev) =>
        prev.map((w) => {
          if (w.id === walletId) {
            return {
              ...w,
              hashkeyVerified: true,
              hashkeyTxHash: txHash,
            }
          }
          return w
        }),
      )

      // Update active wallet if it's the one being verified
      if (activeWallet && activeWallet.id === walletId) {
        setActiveWallet((prev) => {
          if (prev) {
            return {
              ...prev,
              hashkeyVerified: true,
              hashkeyTxHash: txHash,
            }
          }
          return prev
        })
      }

      toast({
        title: "Hashkey Verification Successful",
        description: "Your wallet has been verified on Hashkey chain.",
      })

      return true
    } catch (error) {
      console.error("Error verifying on Hashkey:", error)
      toast({
        title: "Verification Failed",
        description: "Failed to verify on Hashkey chain. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  // Check if a wallet has Hashkey verification
  const hasHashkeyVerification = (walletId: string) => {
    const wallet = wallets.find((w) => w.id === walletId)
    return wallet?.hashkeyVerified || false
  }

  // Get the Hashkey transaction hash for a wallet
  const getHashkeyTxHash = (walletId: string) => {
    const wallet = wallets.find((w) => w.id === walletId)
    return wallet?.hashkeyTxHash
  }

  return (
    <WalletContext.Provider
      value={{
        connectedAccount,
        isConnected,
        connectWallet,
        disconnectWallet,
        wallets,
        addWallet: addNewWallet,
        setActiveWallet: handleSetActiveWallet,
        activeWallet,
        isConnecting,
        updateWalletOtpSecret,
        linkRecoveryMethod,
        hasRecoveryMethod,
        verifyHashkey,
        hasHashkeyVerification,
        getHashkeyTxHash,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

// Add this to make TypeScript happy with window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
    }
  }
}

