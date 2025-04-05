import {
  getTokenBySymbol,
  calculateExchangeAmount,
  calculatePriceImpact,
  calculateGasFee,
  mockTokens,
} from "@/lib/mock-tokens"
import { describe, it, expect } from "vitest"

describe("Token Utilities", () => {
  describe("getTokenBySymbol", () => {
    it("returns the correct token for a valid symbol", () => {
      const token = getTokenBySymbol("ETH")
      expect(token).toBeDefined()
      expect(token?.symbol).toBe("ETH")
    })

    it("returns undefined for an invalid symbol", () => {
      const token = getTokenBySymbol("INVALID")
      expect(token).toBeUndefined()
    })
  })

  describe("calculateExchangeAmount", () => {
    it("calculates the correct exchange amount", () => {
      const ethToken = mockTokens.find((t) => t.symbol === "ETH")!
      const usdcToken = mockTokens.find((t) => t.symbol === "USDC")!

      // ETH at $3500, USDC at $1
      // 1 ETH should be 3500 USDC
      const result = calculateExchangeAmount(ethToken, usdcToken, "1")
      expect(Number.parseFloat(result)).toBeCloseTo(3500, 0)
    })

    it('returns "0" for invalid input', () => {
      const ethToken = mockTokens.find((t) => t.symbol === "ETH")!
      const usdcToken = mockTokens.find((t) => t.symbol === "USDC")!

      expect(calculateExchangeAmount(ethToken, usdcToken, "invalid")).toBe("0")
      expect(calculateExchangeAmount(ethToken, usdcToken, "")).toBe("0")
    })
  })

  describe("calculatePriceImpact", () => {
    it("calculates price impact based on amount", () => {
      // Check that larger amounts have higher impact
      const smallImpact = Number.parseFloat(calculatePriceImpact("1"))
      const largeImpact = Number.parseFloat(calculatePriceImpact("100"))

      expect(largeImpact).toBeGreaterThan(smallImpact)
    })

    it('returns "0.00" for zero or invalid amounts', () => {
      expect(calculatePriceImpact("0")).toBe("0.00")
      expect(calculatePriceImpact("")).toBe("0.00")
      expect(calculatePriceImpact("invalid")).toBe("0.00")
    })

    it("caps price impact at 5%", () => {
      // Very large amount should cap at 5%
      const impact = Number.parseFloat(calculatePriceImpact("100000"))
      expect(impact).toBeLessThanOrEqual(5)
    })
  })

  describe("calculateGasFee", () => {
    it("returns a gas fee as a string", () => {
      const fee = calculateGasFee()
      expect(typeof fee).toBe("string")
      expect(Number.parseFloat(fee)).toBeGreaterThan(0)
    })
  })
})

