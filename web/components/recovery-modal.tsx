"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { KeyRound } from "lucide-react"
import { useRouter } from "next/navigation"

interface RecoveryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RecoveryModal({ isOpen, onClose }: RecoveryModalProps) {
  const router = useRouter()

  const handleStartRecovery = () => {
    onClose()
    router.push("/recover-wallet")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Recover Your Wallet</DialogTitle>
          <DialogDescription className="pt-2">
            Don't worry! If you've lost your phone, access to your TOTP, or even your parent wallet, you can still
            recover your wallet—provided you set up recovery with Self Protocol. Follow the steps to regain access
            securely.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-primary/5 rounded-lg p-4 my-2">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-full mt-0.5">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Recovery Process</h3>
              <ul className="text-sm text-muted-foreground mt-1 space-y-1 list-disc pl-4">
                <li>Verify your identity with Self Protocol</li>
                <li>Generate a new TOTP secret</li>
                <li>Regain access to your wallet</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleStartRecovery}>Start Recovery</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

