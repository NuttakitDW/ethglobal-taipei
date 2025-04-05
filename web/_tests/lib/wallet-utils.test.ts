import { detectWalletType, getWalletName } from "@/lib/wallet-utils"
import { describe, it, expect, beforeEach } from "vitest"

describe("Wallet Utilities", () => {
  describe("getWalletName", () => {
    it("returns correct name for MetaMask", () => {
      expect(getWalletName("metamask")).toBe("MetaMask")
    })

    it("returns correct name for Coinbase Wallet", () => {
      expect(getWalletName("coinbase")).toBe("Coinbase Wallet")
    })

    it("returns correct name for Trust Wallet", () => {
      expect(getWalletName("trust")).toBe("Trust Wallet")
    })

    it("returns correct name for WalletConnect", () => {
      expect(getWalletName("walletconnect")).toBe("WalletConnect")
    })

    it("returns Unknown Wallet for unknown types", () => {
      expect(getWalletName("unknown")).toBe("Unknown Wallet")
    })
  })

  describe("detectWalletType", () => {
    beforeEach(() => {
      // Reset ethereum properties
      if (window.ethereum) {
        delete window.ethereum.isMetaMask
        delete window.ethereum.isCoinbaseWallet
        delete window.ethereum.isTrust
        delete window.ethereum.isWalletConnect
      }
    })

    it("detects MetaMask wallet", () => {
      if (window.ethereum) {
        window.ethereum.isMetaMask = true
      }
      expect(detectWalletType()).toBe("metamask")
    })

    it("detects Coinbase wallet", () => {
      if (window.ethereum) {
        window.ethereum.isCoinbaseWallet = true
      }
      expect(detectWalletType()).toBe("coinbase")
    })

    it("detects Trust wallet", () => {
      if (window.ethereum) {
        window.ethereum.isTrust = true
      }
      expect(detectWalletType()).toBe("trust")
    })

    it("detects WalletConnect", () => {
      if (window.ethereum) {
        window.ethereum.isWalletConnect = true
      }
      expect(detectWalletType()).toBe("walletconnect")
    })

    it("returns unknown when no wallet detected", () => {
      // Ensure no wallet flags are set
      expect(detectWalletType()).toBe("unknown")
    })
  })
})

