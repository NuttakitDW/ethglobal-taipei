// Wallet type detection and utilities

export type WalletType = "metamask" | "walletconnect" | "coinbase" | "trust" | "okx" | "unknown"

export function detectWalletType(): WalletType {
  if (typeof window === "undefined") return "unknown"

  // Check for OKX Wallet
  if (window.okxwallet) return "okx"

  const ethereum = window.ethereum

  if (!ethereum) return "unknown"

  // Check for MetaMask
  if (ethereum.isMetaMask) return "metamask"

  // Check for Coinbase Wallet
  if (ethereum.isCoinbaseWallet) return "coinbase"

  // Check for Trust Wallet
  if (ethereum.isTrust) return "trust"

  // Check for WalletConnect
  if (ethereum.isWalletConnect) return "walletconnect"

  return "unknown"
}

export function getWalletName(type: WalletType): string {
  switch (type) {
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

