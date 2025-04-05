"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useWallet } from "@/components/wallet-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon, Copy, Check, Shield, Download } from "lucide-react"
import { OtpInput } from "@/components/otp-input"
import { useToast } from "@/components/ui/use-toast"
import { generateOtpSecret, generateMockWallet } from "@/lib/mock-data"
import { QRCode, type QRCodeRef } from "@/components/qr-code"
import { Checkbox } from "@/components/ui/checkbox"
import { SelfProtocolAuth } from "@/components/self-protocol-auth"
import { SuccessModal } from "@/components/success-modal"
import { useWalletConnect } from "@/components/wallet-connect-provider"

export default function CreateWalletPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { isConnected, connectedAccount, addWallet, linkRecoveryMethod, wallets, hasRecoveryMethod } = useWallet()
  const [step, setStep] = useState(1)
  const [walletName, setWalletName] = useState("")
  const [otpSecret, setOtpSecret] = useState(generateOtpSecret())
  const [verificationMethod, setVerificationMethod] = useState<"otp">("otp")
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [newWalletId, setNewWalletId] = useState<string | null>(null)
  const [linkSelfProtocol, setLinkSelfProtocol] = useState(true)
  const [isLinkingSelfProtocol, setIsLinkingSelfProtocol] = useState(false)
  const [selfProtocolLinked, setSelfProtocolLinked] = useState(false)
  const [isRecoverySetup, setIsRecoverySetup] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [secretVisible, setSecretVisible] = useState(false)
  const qrCodeRef = useRef<QRCodeRef>(null)

  // Get wallet connection functions
  const { setShowWalletSelector } = useWalletConnect()

  // Check connection status
  useEffect(() => {
    if (!isConnected && !isRedirecting) {
      // Instead of redirecting, show the wallet selector modal
      setShowWalletSelector(true)
    }
  }, [isConnected, isRedirecting, setShowWalletSelector])

  // If not connected, show a message but don't redirect
  if (!isConnected) {
    return (
      <div className="container max-w-md py-10 flex flex-col items-center justify-center gap-4">
        <p>Please connect your wallet to create a zkOTP wallet</p>
        <Button
          onClick={() => setShowWalletSelector(true)}
          className="rounded-full shadow-md text-white"
          variant="gradient"
        >
          Connect Wallet
        </Button>
      </div>
    )
  }

  const handleCopySecret = () => {
    navigator.clipboard.writeText(otpSecret)
    toast({
      title: "Secret Copied",
      description: "OTP secret has been copied to clipboard.",
    })
  }

  const handleDownloadQR = () => {
    const canvas = qrCodeRef.current?.getCanvas()
    if (!canvas) {
      toast({
        title: "Download Failed",
        description: "Could not download QR code. Please try again.",
        variant: "destructive",
      })
      return
    }

    try {
      // Create a temporary link element
      const link = document.createElement("a")

      // Convert canvas to data URL
      link.href = canvas.toDataURL("image/png")

      // Set download attributes
      const walletIdentifier = walletName || `zkOTP-${otpSecret.substring(0, 6)}`
      link.download = `${walletIdentifier}-qr-code.png`

      // Append to body, click, and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "QR Code Downloaded",
        description: "Your TOTP QR code has been downloaded successfully.",
      })
    } catch (error) {
      console.error("Error downloading QR code:", error)
      toast({
        title: "Download Failed",
        description: "Could not download QR code. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleNextStep = () => {
    setStep(2)
  }

  const handleOtpComplete = (otp: string) => {
    // Mock OTP verification
    setTimeout(() => {
      // Create a new wallet
      if (connectedAccount) {
        const newWallet = generateMockWallet(connectedAccount, walletName || undefined)
        newWallet.otpSecret = otpSecret
        newWallet.recoveryMethods = {
          selfProtocol: false,
        }

        addWallet(newWallet)
        setNewWalletId(newWallet.id)

        toast({
          title: "Wallet Created",
          description: "Your zkOTP wallet has been created successfully.",
        })

        // If user wants to link Self Protocol, go to step 3
        // Otherwise, show success modal and skip recovery setup
        if (linkSelfProtocol) {
          setStep(3)
        } else {
          setShowSuccessModal(true)
        }
      }
    }, 1500)
  }

  // Update the handleSelfProtocolSuccess function to handle pending state
  const handleSelfProtocolSuccess = () => {
    setIsLinkingSelfProtocol(true)

    // Mock linking process
    setTimeout(() => {
      if (newWalletId) {
        linkRecoveryMethod(newWalletId, "selfProtocol")
        setSelfProtocolLinked(true)
        setIsLinkingSelfProtocol(false)

        toast({
          title: "Self Protocol Linked",
          description:
            "Self Protocol has been successfully linked to your wallet. You are not on the OFAC sanction list.",
        })

        // Show success modal after linking Self Protocol
        setShowSuccessModal(true)
      }
    }, 1500)
  }

  const handleSkipRecovery = () => {
    toast({
      title: isRecoverySetup ? "No Changes Made" : "Setup Complete",
      description: isRecoverySetup
        ? "No recovery methods were linked to your wallet."
        : "Your wallet has been created without recovery methods.",
    })
    router.push("/wallets")
  }

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>{isRecoverySetup ? "Set Up Recovery Methods" : "Create zkOTP Wallet"}</CardTitle>
          <CardDescription>
            {step === 1
              ? "Setup your wallet and choose a verification method."
              : step === 2
                ? "Complete verification to create your wallet."
                : isRecoverySetup
                  ? "Link recovery methods to your wallet for added security."
                  : "Link recovery methods to your new wallet."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="wallet-name">Wallet Name (Optional)</Label>
                <Input
                  id="wallet-name"
                  placeholder="My zkOTP Wallet"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                />
              </div>

              <div className="space-y-4 pt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Scan QR Code</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 flex items-center gap-1"
                      onClick={handleDownloadQR}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <div className="border rounded-lg p-2">
                      <QRCode
                        ref={qrCodeRef}
                        data={`otpauth://totp/zkOTP:${otpSecret.substring(0, 8)}?secret=${otpSecret}&issuer=zkOTP%20Wallet`}
                        size={180}
                        className="w-48 h-48"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="otp-secret">Secret Key</Label>
                    <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleCopySecret}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="relative">
                    <Input
                      id="otp-secret"
                      value={secretVisible ? otpSecret : "•".repeat(otpSecret.length)}
                      readOnly
                      className="font-mono text-sm pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setSecretVisible(!secretVisible)}
                      aria-label={secretVisible ? "Hide secret key" : "Show secret key"}
                    >
                      {secretVisible ? (
                        <Shield className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Shield className="h-4 w-4 text-primary" />
                      )}
                    </Button>
                  </div>
                </div>

                <Alert variant="default">
                  <InfoIcon className="h-4 w-4" />
                  <AlertDescription>
                    We do not store your OTP secret on our server. Please save it securely.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2 pt-2">
                  <Label>Recovery Options (Recommended)</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="link-self"
                        checked={linkSelfProtocol}
                        onCheckedChange={(checked) => setLinkSelfProtocol(checked === true)}
                      />
                      <Label htmlFor="link-self" className="text-sm font-normal cursor-pointer">
                        Link Self Protocol for recovery (OFAC compliant)
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : step === 2 ? (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">Enter the 6-digit code from your authenticator app</p>
                <OtpInput length={6} onComplete={handleOtpComplete} />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {!isRecoverySetup && (
                <div className="rounded-lg border border-green-100 bg-green-50 p-4 flex items-center gap-3">
                  <div className="bg-green-100 rounded-full p-1">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-green-800 text-sm">Wallet Created Successfully</h3>
                    <p className="text-sm text-green-700">Now let's link your recovery methods.</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {linkSelfProtocol && !selfProtocolLinked && (
                  <Card className="border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Link Self Protocol</CardTitle>
                      <CardDescription>Connect Self Protocol for wallet recovery.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center">
                        <SelfProtocolAuth
                          onSuccess={handleSelfProtocolSuccess}
                          buttonText="Link Self Protocol"
                          autoShowQR={true} // Always show QR code immediately
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selfProtocolLinked && (
                  <div className="rounded-lg border border-green-100 bg-green-50 p-4 flex items-center gap-3">
                    <div className="bg-green-100 rounded-full p-1">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-green-800 text-sm">Self Protocol Linked</h3>
                      <p className="text-sm text-green-700">
                        You can now recover your wallet using Self Protocol. You are not on the OFAC sanction list.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {(!linkSelfProtocol || selfProtocolLinked) && (
                <Button className="w-full" onClick={() => router.push("/wallets")}>
                  Continue to Wallet
                </Button>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          {step === 1 ? (
            <Button className="w-full" onClick={handleNextStep}>
              Continue
            </Button>
          ) : (
            step === 3 &&
            !selfProtocolLinked && (
              <Button variant="outline" className="w-full" onClick={handleSkipRecovery}>
                {isRecoverySetup ? "Skip" : "Skip Recovery Setup"}
              </Button>
            )
          )}
        </CardFooter>
      </Card>
      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        walletName={walletName || "zkOTP Wallet"}
        walletAddress={wallets.find((w) => w.id === newWalletId)?.address || ""}
      />
    </div>
  )
}

