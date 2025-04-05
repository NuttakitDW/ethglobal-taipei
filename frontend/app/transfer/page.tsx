"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/components/wallet-provider"
import { WalletSelect } from "@/components/wallet-select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OtpInput } from "@/components/otp-input"
import { useToast } from "@/components/ui/use-toast"
import { generateMockTransactions, convertEthToCUSD } from "@/lib/mock-data"
import { formatDistanceToNow } from "date-fns"
import { CheckCircle2, Clock, XCircle, ArrowUpRight, ArrowDownLeft, ArrowLeft, DollarSign } from "lucide-react"
import { NetworkSelector } from "@/components/network-selector"
import { TransactionSuccessModal } from "@/components/transaction-success-modal"

export default function TransferPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isConnected, activeWallet } = useWallet()
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [transactions, setTransactions] = useState<any[]>([])
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState("ethereum")
  const [otpError, setOtpError] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [transactionDetails, setTransactionDetails] = useState<{
    amount: string
    recipient: string
    hash: string
  } | null>(null)

  // Calculate cUSD equivalent of amount
  const cUSDAmount = amount ? convertEthToCUSD(amount) : "0.00"
  // Calculate cUSD equivalent of wallet balance
  const walletCUSDBalance = activeWallet ? convertEthToCUSD(activeWallet.balance) : "0.00"

  // Redirect to home if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/")
    }
  }, [isConnected, router])

  // Load transactions when active wallet changes
  useEffect(() => {
    if (activeWallet) {
      setTransactions(generateMockTransactions(activeWallet.address, 10))
    }
  }, [activeWallet])

  if (!isConnected || !activeWallet) {
    return (
      <div className="container max-w-md py-10 flex items-center justify-center">
        <p>Please connect your wallet and create a wallet first...</p>
      </div>
    )
  }

  const handleNetworkChange = (networkId: string) => {
    setSelectedNetwork(networkId)
    toast({
      title: "Network Changed",
      description: `Switched to ${networkId.charAt(0).toUpperCase() + networkId.slice(1)} network`,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!recipient || !amount) {
      toast({
        title: "Invalid Input",
        description: "Please enter both recipient and amount.",
        variant: "destructive",
      })
      return
    }

    // Show OTP input
    setShowOtpInput(true)
  }

  const handleOtpComplete = (otp: string) => {
    setIsSubmitting(true)
    setOtpError(null)

    // Mock transaction processing
    setTimeout(() => {
      // Create a new transaction
      const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")

      const newTransaction = {
        id: `tx-${Date.now()}`,
        type: "Send",
        amount,
        timestamp: new Date(),
        from: activeWallet.address,
        to: recipient,
        hash: txHash,
        status: "Confirmed",
      }

      // Update transactions list
      setTransactions([newTransaction, ...transactions])

      // Set transaction details for success modal
      setTransactionDetails({
        amount,
        recipient,
        hash: txHash,
      })

      // Reset form
      setRecipient("")
      setAmount("")
      setShowOtpInput(false)
      setIsSubmitting(false)

      // Show success modal instead of toast
      setShowSuccessModal(true)
    }, 2000)
  }

  const handleOtpError = (error: string) => {
    setOtpError(error)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Confirmed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "Pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "Failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "Send":
        return <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
      case "Receive":
        return <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
      default:
        return null
    }
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/wallets")} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to wallets</span>
            </Button>
            <h1 className="text-3xl font-bold">Transfer</h1>
          </div>
          <WalletSelect />
        </div>

        <Tabs defaultValue="send" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="send">Send</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Send ETH</CardTitle>
                    <CardDescription>Transfer ETH from your zkOTP wallet to another address.</CardDescription>
                  </div>
                  <NetworkSelector onNetworkChange={handleNetworkChange} />
                </div>
              </CardHeader>
              <CardContent>
                {showOtpInput ? (
                  <div className="space-y-6">
                    <div className="rounded-lg border p-4 bg-muted/50">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Transaction Details</p>
                        <p className="text-sm text-muted-foreground">
                          Send {amount} ETH to {recipient.substring(0, 6)}...{recipient.substring(38)}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Equivalent: {cUSDAmount} cUSD
                        </p>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        Enter the 6-digit code from your authenticator app to confirm
                      </p>
                      <OtpInput
                        length={6}
                        onComplete={handleOtpComplete}
                        onError={handleOtpError}
                        error={otpError}
                        isVerifying={isSubmitting}
                      />
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipient">Recipient Address</Label>
                      <Input
                        id="recipient"
                        placeholder="0x... (Recipient address)"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Enter the recipient's wallet address.</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="amount">Amount (ETH)</Label>
                        <span className="text-sm text-muted-foreground">
                          Balance: {activeWallet.balance} ETH (≈ {walletCUSDBalance} cUSD)
                        </span>
                      </div>
                      <Input
                        id="amount"
                        type="number"
                        step="0.0001"
                        min="0"
                        max={activeWallet.balance}
                        placeholder="0.0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                      {amount && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          <span>≈ {cUSDAmount} cUSD</span>
                        </div>
                      )}
                    </div>

                    <Button type="submit" className="w-full">
                      Continue
                    </Button>
                  </form>
                )}
              </CardContent>
              {showOtpInput && (
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowOtpInput(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Recent transactions from your wallet.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No transactions yet.</p>
                  ) : (
                    <div className="divide-y">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="py-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="p-1 rounded-full bg-muted">{getTransactionIcon(tx.type)}</div>
                              <div>
                                <p className="font-medium">{tx.type}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(
                                    tx.timestamp instanceof Date ? tx.timestamp : new Date(tx.timestamp),
                                    { addSuffix: true },
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="font-medium">
                                  {tx.type === "Send" ? "-" : "+"}
                                  {tx.amount} ETH
                                </p>
                                <p className="text-xs text-muted-foreground">≈ {convertEthToCUSD(tx.amount)} cUSD</p>
                                <p className="text-xs text-muted-foreground truncate w-36">
                                  {tx.type === "Send" ? "To: " : "From: "}
                                  {tx.type === "Send"
                                    ? `${tx.to.substring(0, 6)}...${tx.to.substring(38)}`
                                    : `${tx.from.substring(0, 6)}...${tx.from.substring(38)}`}
                                </p>
                              </div>
                              {getStatusIcon(tx.status)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Transaction Success Modal */}
      <TransactionSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        transactionDetails={transactionDetails}
      />
    </div>
  )
}

