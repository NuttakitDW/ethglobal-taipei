"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/components/wallet-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon, Check, Shield, ArrowLeft, AlertCircle, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { generateOtpSecret } from "@/lib/mock-data"
import { QRCode, type QRCodeRef } from "@/components/qr-code"
import { WalletSelect } from "@/components/wallet-select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OtpInput } from "@/components/otp-input"
import { SelfProtocolAuth } from "@/components/self-protocol-auth"
import { SuccessModal } from "@/components/success-modal"

export default function RecoverWalletPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isConnected, activeWallet, wallets, updateWalletOtpSecret, hasRecoveryMethod } = useWallet()

  const [step, setStep] = useState(1)
  const [newOtpSecret, setNewOtpSecret] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [maxAttempts] = useState(3)
  const [otpAttempts, setOtpAttempts] = useState(0)
  const [secretVisible, setSecretVisible] = useState(false)
  const qrCodeRef = useRef<QRCodeRef>(null)

  // Check connection status
  useEffect(() => {
    if (!isConnected && !isRedirecting) {
      setIsRedirecting(true)
      router.push("/")
    }
  }, [isConnected, router, isRedirecting])

  // If not connected or no wallets, show loading or return null
  if (!isConnected || wallets.length === 0) {
    return (
      <div className="container max-w-md py-10 flex items-center justify-center">
        <p>Please connect your wallet and create a wallet first...</p>
      </div>
    )
  }

  // Update the handleVerificationComplete function to handle pending state
  const handleVerificationComplete = () => {
    setIsVerifying(true)
    setVerificationError(null)

    // Mock verification process
    setTimeout(() => {
      setIsVerifying(false)
      setIsVerified(true)

      // Generate new OTP secret
      const newSecret = generateOtpSecret()
      setNewOtpSecret(newSecret)

      setStep(2)

      toast({
        title: "Verification Successful",
        description:
          "Your identity has been verified. You are not on the OFAC sanction list. You can now set up a new OTP secret.",
      })
    }, 2000)
  }

  const handleVerificationError = (error: string) => {
    setVerificationError(error)
    setIsVerifying(false)

    toast({
      title: "Verification Failed",
      description: error,
      variant: "destructive",
    })
  }

  const handleOtpComplete = (otp: string) => {
    setOtpError(null)
    setIsVerifying(true)

    // In a real implementation, this would verify the OTP against the new secret
    // For demo, we'll simulate a verification with potential failure
    setTimeout(() => {
      setIsVerifying(false)

      // Simulate occasional failures for demo purposes
      if (otpAttempts >= maxAttempts - 1) {
        setOtpError("Too many failed attempts. Please try again later.")
        setOtpAttempts(0)
        return
      }

      // Randomly succeed or fail for demo purposes
      const isSuccess = Math.random() > 0.3 // 70% success rate

      if (isSuccess) {
        // Update wallet with new OTP secret
        if (activeWallet) {
          updateWalletOtpSecret(activeWallet.id, newOtpSecret)

          toast({
            title: "Recovery Complete",
            description: "Your wallet has been recovered with a new OTP secret.",
          })

          // Show success modal instead of redirecting
          setShowSuccessModal(true)
        }
      } else {
        setOtpError("Invalid OTP code. Please try again.")
        setOtpAttempts((prev) => prev + 1)
      }
    }, 1500)
  }

  const handleOtpError = (error: string) => {
    setOtpError(error)
  }

  const handleCopySecret = () => {
    navigator.clipboard.writeText(newOtpSecret)
    toast({
      title: "Secret Copied",
      description: "New OTP secret has been copied to clipboard.",
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
      const walletIdentifier = activeWallet?.name || `zkOTP-Recovery-${newOtpSecret.substring(0, 6)}`
      link.download = `${walletIdentifier}-recovery-qr.png`

      // Append to body, click, and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "QR Code Downloaded",
        description: "Your recovery QR code has been downloaded successfully.",
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

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center mb-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/wallets")} className="mr-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <CardTitle>Recover Your Wallet</CardTitle>
          </div>
          <CardDescription>
            {step === 1
              ? "Verify your identity with Self Protocol to recover your wallet."
              : "Set up your new OTP secret to regain access to your wallet."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 ? (
            <>
              <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
                <InfoIcon className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700">
                  This recovery process will generate a new TOTP secret for your wallet. You'll need to set up your
                  authenticator app with the new secret.
                </AlertDescription>
              </Alert>

              <div className="space-y-2 mb-4">
                <Label>Select Wallet to Recover</Label>
                <WalletSelect hideAddButton={true} />
              </div>

              {activeWallet && !hasRecoveryMethod(activeWallet.id, "selfProtocol") ? (
                <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-red-800">
                  <h3 className="font-medium">Recovery Not Available</h3>
                  <p className="text-sm mt-1">
                    This wallet does not have Self Protocol recovery set up. Recovery is only available for wallets that
                    have previously set up recovery methods.
                  </p>
                  <p className="text-sm mt-2">Please select a different wallet or contact support for assistance.</p>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col items-center justify-center space-y-4 py-4">
                    <Shield className="h-16 w-16 text-primary opacity-80" />
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-medium">Verify with Self Protocol</h3>
                      <p className="text-sm text-muted-foreground">
                        Scan the QR code with your Self Protocol app to verify your identity and recover your wallet.
                      </p>
                    </div>
                    <SelfProtocolAuth
                      onSuccess={handleVerificationComplete}
                      onError={handleVerificationError}
                      autoShowQR={true}
                    />

                    {verificationError && (
                      <div className="mt-2 text-center">
                        <p className="text-sm text-red-500">
                          <AlertCircle className="h-4 w-4 inline mr-1" />
                          {verificationError}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              <div className="rounded-lg border border-green-100 bg-green-50 p-4 flex items-center gap-3">
                <div className="bg-green-100 rounded-full p-1">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-green-800">Verification Successful</h3>
                  <p className="text-sm text-green-700">
                    Your identity has been verified. You are not on the OFAC sanction list.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Scan New QR Code</Label>
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
                      data={`otpauth://totp/zkOTP:${newOtpSecret.substring(0, 8)}?secret=${newOtpSecret}&issuer=zkOTP%20Wallet`}
                      size={180}
                      className="w-48 h-48"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="otp-secret">New Secret Key</Label>
                  <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleCopySecret}>
                    Copy
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="otp-secret"
                    value={secretVisible ? newOtpSecret : "•".repeat(newOtpSecret.length)}
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
                  Save this new OTP secret securely. You'll need it to access your wallet.
                </AlertDescription>
              </Alert>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Enter the 6-digit code from your authenticator app to confirm
                </p>
                <OtpInput
                  length={6}
                  onComplete={handleOtpComplete}
                  onError={handleOtpError}
                  error={otpError}
                  isVerifying={isVerifying}
                />

                {otpAttempts > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Attempts: {otpAttempts}/{maxAttempts}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        walletName={activeWallet?.name || "Recovered Wallet"}
        walletAddress={activeWallet?.address || ""}
      />
    </div>
  )
}

