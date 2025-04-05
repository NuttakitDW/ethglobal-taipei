"use client"

import { useState } from "react"
import { SelfProtocolQR } from "./self-protocol-qr"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface SelfProtocolAuthProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  buttonText?: string
  userId?: string
  onVerificationComplete?: () => void
  autoShowQR?: boolean // New prop to auto-show QR code
}

export function SelfProtocolAuth({
  onSuccess,
  onError,
  buttonText = "Verify with Self Protocol",
  userId,
  onVerificationComplete,
  autoShowQR = false, // Default to false
}: SelfProtocolAuthProps) {
  // Generate a unique ID if none is provided
  const [internalUserId] = useState<string>(userId || uuidv4())
  const [showQR, setShowQR] = useState(autoShowQR)
  const [error, setError] = useState<string | null>(null)
  const [isPendingVerification, setIsPendingVerification] = useState(false)

  // Handle the case where onVerificationComplete is provided instead of onSuccess
  const handleSuccess = () => {
    setError(null)
    setIsPendingVerification(false)
    if (onVerificationComplete) {
      onVerificationComplete()
    } else if (onSuccess) {
      onSuccess()
    }
  }

  // Handle error
  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    setIsPendingVerification(false)
    if (onError) {
      onError(errorMessage)
    }
  }

  // Handle when verification is initiated but pending backend confirmation
  const handleVerificationPending = () => {
    setIsPendingVerification(true)
  }

  return (
    <div>
      {!showQR ? (
        <Button
          onClick={() => setShowQR(true)}
          className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
          disabled={isPendingVerification}
        >
          {isPendingVerification ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            buttonText
          )}
        </Button>
      ) : (
        <div className="space-y-2">
          <SelfProtocolQR
            onSuccess={handleSuccess}
            onError={handleError}
            buttonText={buttonText}
            userId={internalUserId}
          />
          {error && !isPendingVerification && (
            <div className="flex justify-center mt-2">
              <Button variant="outline" size="sm" onClick={() => setShowQR(false)} className="text-sm">
                Cancel Verification
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

