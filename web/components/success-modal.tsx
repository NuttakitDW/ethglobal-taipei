"use client"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  walletName: string
  walletAddress: string
}

export function SuccessModal({ isOpen, onClose, walletName, walletAddress }: SuccessModalProps) {
  const { toast } = useToast()
  const router = useRouter()

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
    toast({
      title: "Address Copied",
      description: "Wallet address has been copied to clipboard.",
    })
  }

  const handleContinue = () => {
    onClose()
    router.push("/wallets")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 border-none">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <Check className="h-10 w-10 text-green-500" />
          </div>

          <h2 className="text-3xl font-bold mb-4">Your account is all set!</h2>

          <p className="text-muted-foreground mb-1 max-w-xs">Start your journey to the smart account security now.</p>
          <p className="text-muted-foreground mb-8 max-w-xs">Use your address to receive funds</p>

          <div className="w-full bg-gray-50 p-6 rounded-lg mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 16V12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 8H12.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">{walletName || "zkOTP Wallet"}</h3>
            </div>

            <div className="flex items-center justify-between bg-white border rounded-md p-3">
              <span className="text-sm font-mono truncate max-w-[200px]">{walletAddress}</span>
              <button
                onClick={handleCopyAddress}
                className="p-1 hover:bg-gray-100 rounded-md flex-shrink-0"
                aria-label="Copy address"
              >
                <Copy className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>

          <Button onClick={handleContinue} className="w-40 h-12 rounded-full bg-black text-white hover:bg-gray-800">
            Let's go
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

