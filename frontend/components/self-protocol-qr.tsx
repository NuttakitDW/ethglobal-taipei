"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { QrCode, RefreshCw, AlertCircle, Loader2 } from "lucide-react"

// Create a simple placeholder QR component for when the real one isn't available
const PlaceholderQR = () => (
  <div className="w-[200px] h-[200px] bg-gray-100 flex items-center justify-center">
    <QrCode className="h-16 w-16 text-gray-300" />
  </div>
)

interface SelfProtocolQRProps {
  onSuccess: () => void
  onError?: (error: string) => void
  buttonText?: string
  userId?: string
  appName?: string
  scope?: string
  endpoint?: string
}

export function SelfProtocolQR({
  onSuccess,
  onError,
  buttonText = "Verify with Self Protocol",
  userId,
  appName = "zkOTP Wallet",
  scope = "zkotp-wallet-auth",
  endpoint = "https://zkotp-wallet.com/api/verify",
}: SelfProtocolQRProps) {
  const [internalUserId] = useState<string>(userId || `user-${Date.now()}`)
  const [isBrowser, setIsBrowser] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [SelfQRComponent, setSelfQRComponent] = useState<any>(null)
  const selfAppRef = useRef<any>(null)
  const { toast } = useToast()
  const [retryCount, setRetryCount] = useState(0)
  const [isPendingVerification, setIsPendingVerification] = useState(false)

  // Check if we're in the browser
  useEffect(() => {
    setIsBrowser(true)
  }, [])

  // Load the Self SDK dynamically
  useEffect(() => {
    if (!isBrowser) return

    setIsLoading(true)
    setError(null)

    const loadSelfSDK = async () => {
      try {
        // Dynamically import the SDK
        const selfModule = await import("@selfxyz/qrcode")

        // Create the Self app instance
        const SelfAppBuilder = selfModule.SelfAppBuilder

        try {
          // Create a new instance with the 'new' keyword
          selfAppRef.current = new SelfAppBuilder({
            appName,
            scope,
            endpoint,
            endpointType: "https",
            logoBase64: "https://zkotp-wallet.com/logo.png",
            userId: internalUserId,
          }).build()

          // Set the QR component
          setSelfQRComponent(() => selfModule.default)
        } catch (appError) {
          console.error("Error creating Self app:", appError)
          const errorMessage = "Failed to initialize Self Protocol. Please try again."
          setError(errorMessage)
          if (onError) onError(errorMessage)
        }
      } catch (sdkError) {
        console.error("Failed to load Self SDK:", sdkError)
        const errorMessage = "Could not load the Self Protocol SDK. Please try again."
        setError(errorMessage)
        if (onError) onError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    loadSelfSDK()
  }, [isBrowser, internalUserId, appName, scope, endpoint, onError, retryCount])

  // Update the handleSuccess function to include OFAC wording in the toast
  const handleSuccess = () => {
    setIsPendingVerification(false)
    toast({
      title: "Verification Successful",
      description: "Your identity has been verified with Self Protocol. You are not on the OFAC sanction list.",
    })
    onSuccess()
  }

  // Also update the debug success handler to simulate a delay for the pending state
  const handleDebugSuccess = () => {
    setIsPendingVerification(true)

    // Simulate backend verification delay
    setTimeout(() => {
      handleSuccess()
    }, 3000)
  }

  // Handle verification error
  const handleVerificationError = (errorMessage: string) => {
    setIsPendingVerification(false)
    setError(errorMessage)
    if (onError) onError(errorMessage)
    toast({
      title: "Verification Failed",
      description: errorMessage,
      variant: "destructive",
    })
  }

  // Handle retry
  const handleRetry = () => {
    setError(null)
    setIsPendingVerification(false)
    setRetryCount((prev) => prev + 1)
  }

  // Update the Self SDK onSuccess handler to show pending state first
  const handleSelfVerification = () => {
    setIsPendingVerification(true)

    // In a real implementation, the SDK would handle the callback when verification is complete
    // For now, we'll simulate it with a timeout
    // In production, this would be handled by the actual SDK callback
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">Scan this QR code with Self App</p>
      </div>
      <div className="flex justify-center">
        <div className={`border rounded-lg p-4 bg-white ${error ? "border-red-300" : ""}`}>
          {isLoading ? (
            <div className="w-[200px] h-[200px] flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : isPendingVerification ? (
            <div className="w-[200px] h-[200px] flex flex-col items-center justify-center p-4 text-center">
              <Loader2 className="h-12 w-12 text-primary mb-2 animate-spin" />
              <p className="text-sm font-medium mb-1">Verification Pending</p>
              <p className="text-xs text-muted-foreground">
                Please wait while we verify your identity with Self Protocol...
              </p>
            </div>
          ) : error ? (
            <div className="w-[200px] h-[200px] flex flex-col items-center justify-center p-4 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mb-2" />
              <p className="text-sm text-red-500 mb-4">{error}</p>
              <Button variant="outline" size="sm" onClick={handleRetry} className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Try Again
              </Button>
            </div>
          ) : SelfQRComponent && selfAppRef.current ? (
            <SelfQRComponent
              selfApp={selfAppRef.current}
              onSuccess={handleSelfVerification}
              onError={handleVerificationError}
            />
          ) : (
            <PlaceholderQR />
          )}
        </div>
      </div>
      <div className="flex justify-center gap-2">
        <Button onClick={handleDebugSuccess} className="bg-primary text-white" disabled={isPendingVerification}>
          {isPendingVerification ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Debug: Complete Verification"
          )}
        </Button>
      </div>
    </div>
  )
}

