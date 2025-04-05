import {
  generateRandomAddress,
  generateOtpSecret,
  generateMockTransactions,
  generateMockWallet,
  generateQrCodeUrl,
} from "@/lib/mock-data"
import { describe, it, expect } from "vitest"

describe("Mock Data Generators", () => {
  describe("generateRandomAddress", () => {
    it("generates an Ethereum address with correct format", () => {
      const address = generateRandomAddress()
      expect(address).toMatch(/^0x[a-f0-9]{40}$/)
    })
  })

  describe("generateOtpSecret", () => {
    it("generates a 32-character OTP secret", () => {
      const secret = generateOtpSecret()
      expect(secret).toHaveLength(32)
      // Should only contain valid base32 characters
      expect(secret).toMatch(/^[A-Z2-7]+$/)
    })
  })

  describe("generateMockTransactions", () => {
    it("generates the correct number of transactions", () => {
      const walletAddress = generateRandomAddress()
      const transactions = generateMockTransactions(walletAddress, 10)
      expect(transactions).toHaveLength(10)
    })

    it("generates transactions with required properties", () => {
      const walletAddress = generateRandomAddress()
      const transactions = generateMockTransactions(walletAddress, 1)
      const tx = transactions[0]

      expect(tx).toHaveProperty("id")
      expect(tx).toHaveProperty("type")
      expect(tx).toHaveProperty("amount")
      expect(tx).toHaveProperty("timestamp")
      expect(tx).toHaveProperty("status")
      expect(tx).toHaveProperty("from")
      expect(tx).toHaveProperty("to")
      expect(tx).toHaveProperty("hash")
    })

    it("sorts transactions by timestamp in descending order", () => {
      const walletAddress = generateRandomAddress()
      const transactions = generateMockTransactions(walletAddress, 5)

      // Check if timestamps are in descending order (newest first)
      for (let i = 0; i < transactions.length - 1; i++) {
        expect(transactions[i].timestamp.getTime()).toBeGreaterThanOrEqual(transactions[i + 1].timestamp.getTime())
      }
    })
  })

  describe("generateMockWallet", () => {
    it("generates a wallet with required properties", () => {
      const ownerAddress = generateRandomAddress()
      const wallet = generateMockWallet(ownerAddress, "Test Wallet")

      expect(wallet).toHaveProperty("id")
      expect(wallet).toHaveProperty("address")
      expect(wallet).toHaveProperty("name", "Test Wallet")
      expect(wallet).toHaveProperty("balance")
      expect(wallet).toHaveProperty("createdAt")
      expect(wallet).toHaveProperty("ownerAddress", ownerAddress)
    })

    it("generates a wallet with default name if not provided", () => {
      const ownerAddress = generateRandomAddress()
      const wallet = generateMockWallet(ownerAddress)

      expect(wallet.name).toMatch(/^Wallet \d+$/)
    })
  })

  describe("generateQrCodeUrl", () => {
    it("generates a QR code URL with the provided data", () => {
      const data = "test data"
      const url = generateQrCodeUrl(data)

      expect(url).toContain("/placeholder.svg")
      expect(url).toContain(encodeURIComponent(data))
    })
  })
})

