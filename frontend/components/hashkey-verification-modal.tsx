"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import { useWallet } from "@/components/wallet-provider"
import { HashkeyLogo } from "@/components/wallet-icons/hashkey-logo"

interface HashkeyVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  walletId: string
}

export function HashkeyVerificationModal({ isOpen, onClose, walletId }: HashkeyVerificationModalProps) {
  const { verifyHashkey } = useWallet()
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationSuccess, setVerificationSuccess] = useState(false)

  const handleVerify = async () => {
    setIsVerifying(true)
    const success = await verifyHashkey(walletId)
    setIsVerifying(false)
    setVerificationSuccess(success)
    if (success) {
      setTimeout(() => {
        onClose()
      }, 1500)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader className="flex flex-row items-center gap-3">
          <div className="bg-white rounded-full p-1 w-8 h-8 flex items-center justify-center flex-shrink-0">
            <HashkeyLogo />
          </div>
          <div>
            <DialogTitle>Verify on Hashkey Chain</DialogTitle>
            <DialogDescription>Verify your wallet on Hashkey chain to access additional features.</DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {verificationSuccess ? (
            <div className="flex flex-col items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
              <p className="text-lg font-medium">Verification Successful!</p>
              <p className="text-sm text-muted-foreground">
                Your wallet has been successfully verified on Hashkey chain.
              </p>
            </div>
          ) : (
            <>
              <p>By verifying your wallet, you agree to share your KYC information with Hashkey chain.</p>
              <Button onClick={handleVerify} disabled={isVerifying} className="w-full">
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify with Hashkey"
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

