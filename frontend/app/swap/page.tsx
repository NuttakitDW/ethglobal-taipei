"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/components/wallet-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, RefreshCw, Info, Zap } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { OtpInput } from "@/components/otp-input"
import { TokenSelector } from "@/components/token-selector"
import { ChainSelector } from "@/components/chain-selector"
import { SwapSettings } from "@/components/swap-settings"
import {
  type Token,
  getTokenBySymbol,
  calculateExchangeAmount,
  calculatePriceImpact,
  calculateGasFee,
} from "@/lib/mock-tokens"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function SwapPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isConnected, activeWallet } = useWallet()

  const [fromToken, setFromToken] = useState<Token | null>(getTokenBySymbol("ETH") || null)
  const [toToken, setToToken] = useState<Token | null>(getTokenBySymbol("USDC") || null)
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [fromChain, setFromChain] = useState(1) // Ethereum
  const [toChain, setToChain] = useState(1) // Ethereum
  const [slippage, setSlippage] = useState(0.5)
  const [deadline, setDeadline] = useState(20)
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [priceImpact, setPriceImpact] = useState("0.00")
  const [gasFee, setGasFee] = useState("0.00")

  // Redirect to home if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/")
    }
  }, [isConnected, router])

  // Calculate to amount when from amount or tokens change
  useEffect(() => {
    if (fromToken && toToken && fromAmount) {
      const calculatedAmount = calculateExchangeAmount(fromToken, toToken, fromAmount)
      setToAmount(calculatedAmount)

      // Calculate price impact
      setPriceImpact(calculatePriceImpact(fromAmount))

      // Calculate gas fee
      setGasFee(calculateGasFee())
    } else {
      setToAmount("")
      setPriceImpact("0.00")
      setGasFee("0.00")
    }
  }, [fromToken, toToken, fromAmount])

  // Handle from amount change
  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromAmount(e.target.value)
  }

  // Handle to amount change
  const handleToAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToAmount(e.target.value)

    // Reverse calculate from amount
    if (fromToken && toToken && e.target.value) {
      const calculatedAmount = calculateExchangeAmount(toToken, fromToken, e.target.value)
      setFromAmount(calculatedAmount)
    } else {
      setFromAmount("")
    }
  }

  // Swap tokens
  const handleSwapTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)

    // Also swap amounts
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  // Handle swap
  const handleSwap = () => {
    // Validate input
    if (!fromToken || !toToken || !fromAmount || Number.parseFloat(fromAmount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid amount and select tokens.",
        variant: "destructive",
      })
      return
    }

    // Show OTP input
    setShowOtpInput(true)
  }

  // Handle OTP completion
  const handleOtpComplete = (otp: string) => {
    setIsSubmitting(true)

    // Mock swap processing
    setTimeout(() => {
      // Reset form
      setFromAmount("")
      setToAmount("")
      setShowOtpInput(false)
      setIsSubmitting(false)

      // Show success message
      toast({
        title: "Swap Successful",
        description: `Successfully swapped ${fromAmount} ${fromToken?.symbol} to ${toAmount} ${toToken?.symbol}`,
      })
    }, 2000)
  }

  // Get price impact color
  const getPriceImpactColor = () => {
    const impact = Number.parseFloat(priceImpact)
    if (impact < 1) return "text-green-500"
    if (impact < 3) return "text-yellow-500"
    return "text-red-500"
  }

  if (!isConnected || !activeWallet) {
    return (
      <div className="container max-w-md py-10 flex items-center justify-center">
        <p>Please connect your wallet and create a wallet first...</p>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6 max-w-md mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold gradient-heading">Swap</h1>
          <SwapSettings
            slippage={slippage}
            onSlippageChange={setSlippage}
            deadline={deadline}
            onDeadlineChange={setDeadline}
          />
        </div>

        {/* 1inch Partnership Banner */}
        <div className="bg-[#F0F4F9] rounded-xl p-4 flex items-center justify-between border border-[#E6EBF2] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-[#1B314F] rounded-full p-2">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-[#1B314F] font-bold text-lg">1inch</h3>
              <p className="text-[#6E7C8C] text-sm">Zero price impact swaps</p>
            </div>
          </div>
          <div className="bg-[#1B314F] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Zap className="h-3 w-3" />
            PARTNER
          </div>
        </div>

        <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <CardTitle>Swap Tokens</CardTitle>
            <CardDescription className="text-white/80">
              Swap tokens with zero price impact using 1inch Fusion+
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {showOtpInput ? (
              <div className="space-y-6">
                <div className="rounded-xl border border-purple-100 p-4 bg-purple-50/50">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Swap Details</p>
                    <p className="text-sm text-muted-foreground">
                      Swap {fromAmount} {fromToken?.symbol} for approximately {toAmount} {toToken?.symbol}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span>Price Impact:</span>
                      <span className={getPriceImpactColor()}>{priceImpact}%</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter the 6-digit code from your authenticator app to confirm
                  </p>
                  <OtpInput length={6} onComplete={handleOtpComplete} />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">From</label>
                    <div className="flex items-center gap-2">
                      <ChainSelector value={fromChain} onChange={setFromChain} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="flex items-center border rounded-xl overflow-hidden bg-muted/30 focus-within:ring-2 focus-within:ring-purple-200 transition-all">
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="0.0"
                          value={fromAmount}
                          onChange={handleFromAmountChange}
                          className="w-full px-4 py-3 text-lg bg-transparent focus:outline-none"
                        />
                        <TokenSelector value={fromToken} onChange={setFromToken} otherToken={toToken} />
                      </div>
                    </div>
                  </div>
                  {fromToken && (
                    <div className="text-sm text-muted-foreground flex justify-between px-1">
                      <span>
                        Balance: {fromToken.balance} {fromToken.symbol}
                      </span>
                      <button
                        className="text-primary text-xs font-medium hover:underline"
                        onClick={() => setFromAmount(fromToken.balance || "0")}
                      >
                        MAX
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full shadow-sm hover:shadow-md transition-all bg-white z-10 border-purple-100"
                    onClick={handleSwapTokens}
                  >
                    <ArrowDown className="h-4 w-4 text-primary" />
                  </Button>
                </div>

                <div className="space-y-2 -mt-4">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">To</label>
                    <div className="flex items-center gap-2">
                      <ChainSelector value={toChain} onChange={setToChain} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="flex items-center border rounded-xl overflow-hidden bg-muted/30 focus-within:ring-2 focus-within:ring-purple-200 transition-all">
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="0.0"
                          value={toAmount}
                          onChange={handleToAmountChange}
                          className="w-full px-4 py-3 text-lg bg-transparent focus:outline-none"
                        />
                        <TokenSelector value={toToken} onChange={setToToken} otherToken={fromToken} />
                      </div>
                    </div>
                  </div>
                  {toToken && (
                    <div className="text-sm text-muted-foreground px-1">
                      Balance: {toToken.balance} {toToken.symbol}
                    </div>
                  )}
                </div>

                {fromAmount && fromToken && toToken && (
                  <div className="rounded-xl border border-purple-100 p-4 space-y-3 bg-purple-50/50">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rate</span>
                      <span className="font-medium">
                        1 {fromToken.symbol} ={" "}
                        {(Number.parseFloat(toAmount) / Number.parseFloat(fromAmount)).toFixed(6)} {toToken.symbol}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Price Impact</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="rounded-xl">
                              <p className="w-[200px] text-xs">
                                The difference between the market price and estimated price due to trade size.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <span className={`font-medium ${getPriceImpactColor()}`}>{priceImpact}%</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Network Fee</span>
                      <span className="font-medium">{gasFee} ETH</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Slippage Tolerance</span>
                      <span className="font-medium">{slippage}%</span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full rounded-xl h-12 shadow-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg transition-all"
                  onClick={handleSwap}
                  disabled={!fromToken || !toToken || !fromAmount || Number.parseFloat(fromAmount) <= 0}
                >
                  {!fromToken || !toToken
                    ? "Select Tokens"
                    : !fromAmount || Number.parseFloat(fromAmount) <= 0
                      ? "Enter Amount"
                      : "Swap Tokens"}
                </Button>

                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <RefreshCw className="h-3 w-3" />
                  <span>Powered by 1inch Fusion+</span>
                </div>
              </div>
            )}
          </CardContent>
          {showOtpInput && (
            <CardFooter className="bg-muted/30 p-4">
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => setShowOtpInput(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}

