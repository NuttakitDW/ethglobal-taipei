"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/components/wallet-provider"
import { WalletSelect } from "@/components/wallet-select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, ExternalLink, Wallet, Clock, ArrowUpDown, KeyRound, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "date-fns"
import { QRCode } from "@/components/qr-code"
import { RecoveryModal } from "@/components/recovery-modal"
import { convertEthToCUSD } from "@/lib/mock-data"
import { HashkeyVerificationModal } from "@/components/hashkey-verification-modal"
import { SelfProtocolLogo } from "@/components/wallet-icons/self-protocol-logo"
import { HashkeyLogo } from "@/components/wallet-icons/hashkey-logo"

export default function WalletsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isConnected, activeWallet, wallets, hasRecoveryMethod, hasHashkeyVerification, getHashkeyTxHash } =
    useWallet()
  const [showRecoveryModal, setShowRecoveryModal] = useState(false)
  const [showHashkeyModal, setShowHashkeyModal] = useState(false)

  // Redirect to home if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/")
    }
  }, [isConnected, router])

  // Redirect to create wallet if no wallets
  useEffect(() => {
    if (isConnected && wallets.length === 0) {
      router.push("/create-wallet")
    }
  }, [isConnected, wallets.length, router])

  if (!isConnected || !activeWallet) {
    return (
      <div className="container max-w-md py-10 flex items-center justify-center">
        <p>Please connect your wallet and create a wallet first...</p>
      </div>
    )
  }

  const handleCopyAddress = () => {
    if (activeWallet) {
      navigator.clipboard.writeText(activeWallet.address)
      toast({
        title: "Address Copied",
        description: "Wallet address has been copied to clipboard.",
      })
    }
  }

  const handleCreateWallet = () => {
    router.push("/create-wallet")
  }

  const handleRecoverWallet = () => {
    if (activeWallet) {
      // Store the wallet ID in localStorage to access it in the linking flow
      localStorage.setItem("walletToLink", activeWallet.id)
      router.push("/create-wallet?step=3")
    } else {
      toast({
        title: "No Active Wallet",
        description: "Please select a wallet first.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (date: Date | string | number) => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date)
      return formatDistanceToNow(dateObj, { addSuffix: true })
    } catch (error) {
      return "Unknown date"
    }
  }

  // Check if wallet has any recovery methods
  const hasAnyRecoveryMethod = activeWallet && hasRecoveryMethod(activeWallet.id, "selfProtocol")

  // Calculate cUSD value
  const cUSDValue = activeWallet ? convertEthToCUSD(activeWallet.balance) : "0.00"

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold gradient-heading">zkOTP Enabled Wallets</h1>
          <WalletSelect />
        </div>

        {activeWallet && (
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 rounded-full p-1 bg-muted">
              <TabsTrigger value="info" className="rounded-full">
                Wallet Info
              </TabsTrigger>
              <TabsTrigger value="receive" className="rounded-full">
                Receive
              </TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="space-y-6 mt-6">
              <Card className="overflow-hidden border-none shadow-lg rounded-2xl">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{activeWallet.name}</h3>
                      <p className="text-white/80 text-sm">Created {formatDate(activeWallet.createdAt)}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                      <Wallet className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-sm text-white/80">Balance</p>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold">{activeWallet.balance}</span>
                      <span className="ml-2">ETH</span>
                    </div>
                    <div className="text-sm text-white/80 mt-1">≈ {cUSDValue} cUSD</div>
                  </div>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="wallet-address">Wallet Address</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="wallet-address"
                          value={activeWallet.address}
                          readOnly
                          className="font-mono text-sm bg-muted/50 border-none pr-10"
                        />
                        {activeWallet && hasHashkeyVerification(activeWallet.id) && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="bg-green-100 p-1 rounded-full">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="icon" onClick={handleCopyAddress} className="rounded-full">
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy address</span>
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-muted/30 p-4 rounded-xl">
                      <p className="text-sm font-medium text-muted-foreground">Network</p>
                      <p className="font-medium">Ethereum Mainnet</p>
                    </div>

                    <div className="bg-muted/30 p-4 rounded-xl">
                      <p className="text-sm font-medium text-muted-foreground">Recovery</p>
                      <div className="flex items-center">
                        {hasAnyRecoveryMethod ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                            <p className="font-medium">Enabled</p>
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              OFAC Compliant
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                            <p className="font-medium">Not Set</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* KYC Status Section with direct image URLs */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">On-chain KYC Status</h4>
                    <div className="space-y-3">
                      {/* Self Protocol Status */}
                      <div className="bg-muted/30 p-4 rounded-xl flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="mr-3 bg-white rounded-full p-1 w-8 h-8 flex items-center justify-center">
                            <SelfProtocolLogo />
                          </div>
                          <div>
                            <p className="font-medium">Self Protocol</p>
                            <p className="text-sm text-muted-foreground">Identity verification</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {hasAnyRecoveryMethod ? (
                            <span className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <Button variant="outline" size="sm" className="rounded-full" onClick={handleRecoverWallet}>
                              Verify Now
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Hashkey Chain Status */}
                      <div className="bg-muted/30 p-4 rounded-xl flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="mr-3 bg-white rounded-full p-1 w-8 h-8 flex items-center justify-center">
                            <HashkeyLogo />
                          </div>
                          <div>
                            <p className="font-medium">Hashkey Chain</p>
                            <p className="text-sm text-muted-foreground">KYC Tier 1</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {activeWallet && hasHashkeyVerification(activeWallet.id) ? (
                            <div className="flex flex-col items-end">
                              <span className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Verified
                              </span>
                              {getHashkeyTxHash(activeWallet.id) && (
                                <a
                                  href={`https://hashkey.blockscout.com/tx/${getHashkeyTxHash(activeWallet.id)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline mt-1 flex items-center"
                                >
                                  View on Explorer
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              )}
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full"
                              onClick={() => setShowHashkeyModal(true)}
                              disabled={!hasAnyRecoveryMethod}
                            >
                              {!hasAnyRecoveryMethod ? "Self Protocol Required" : "Verify Now"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 grid gap-4 grid-cols-1 md:grid-cols-2">
                    <Button
                      variant="outline"
                      className="w-full rounded-xl h-12 shadow-sm hover:shadow-md transition-all"
                      onClick={() => router.push("/transfer")}
                    >
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Transfer Funds
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full rounded-xl h-12 shadow-sm hover:shadow-md transition-all"
                      onClick={() => router.push("/contract-interaction")}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Contract Interaction
                    </Button>
                  </div>

                  {!hasAnyRecoveryMethod && (
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        className="w-full rounded-xl h-12 shadow-sm hover:shadow-md transition-all border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                        onClick={handleRecoverWallet}
                      >
                        <KeyRound className="h-4 w-4 mr-2" />
                        Set Up Recovery Methods
                      </Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-muted/30 p-4 flex flex-col gap-3">
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => window.open(`https://etherscan.io/address/${activeWallet.address}`, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Etherscan
                  </Button>

                  <button
                    onClick={() => setShowRecoveryModal(true)}
                    className="text-sm text-primary hover:underline hover:text-primary/80 transition-colors"
                  >
                    Lost access to your wallet or TOTP?
                  </button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="receive" className="space-y-4 mt-6">
              <Card className="overflow-hidden border-none shadow-lg rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  <CardTitle>Receive Funds</CardTitle>
                  <CardDescription className="text-white/80">
                    Share your wallet address to receive funds.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6 flex flex-col items-center">
                  <div className="border-4 border-purple-100 rounded-2xl p-4 flex items-center justify-center bg-white shadow-md">
                    <QRCode data={activeWallet.address} size={200} className="w-56 h-56" />
                  </div>

                  <div className="w-full space-y-2">
                    <Label htmlFor="receive-address">Your Wallet Address</Label>
                    <div className="flex gap-2">
                      <Input
                        id="receive-address"
                        value={activeWallet.address}
                        readOnly
                        className="font-mono text-sm bg-muted/50 border-none"
                      />
                      <Button variant="outline" size="icon" onClick={handleCopyAddress} className="rounded-full">
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy address</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        <div className="flex justify-center gap-4 pt-4">
          <Button
            onClick={handleCreateWallet}
            className="rounded-full shadow-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
          >
            Create Another Wallet
          </Button>
        </div>
      </div>

      {/* Recovery Modal */}
      <RecoveryModal isOpen={showRecoveryModal} onClose={() => setShowRecoveryModal(false)} />
      {activeWallet && (
        <HashkeyVerificationModal
          isOpen={showHashkeyModal}
          onClose={() => setShowHashkeyModal(false)}
          walletId={activeWallet.id}
        />
      )}
    </div>
  )
}

