"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, ExternalLink, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"
import { convertEthToCUSD } from "@/lib/mock-data"

interface TransactionSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  transactionDetails: {
    amount: string
    recipient: string
    hash: string
  } | null
}

export function TransactionSuccessModal({ isOpen, onClose, transactionDetails }: TransactionSuccessModalProps) {
  const router = useRouter()

  const handleViewWallet = () => {
    onClose()
    router.push("/wallets")
  }

  if (!transactionDetails) return null

  // Calculate cUSD equivalent
  const cUSDAmount = convertEthToCUSD(transactionDetails.amount)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 border-none">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>

          <h2 className="text-3xl font-bold mb-4">Transaction Confirmed!</h2>

          <p className="text-muted-foreground mb-6 max-w-xs">
            Your transaction has been successfully submitted to the network.
          </p>

          <div className="w-full bg-gray-50 p-6 rounded-lg mb-8 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount</span>
              <div className="text-right">
                <span className="font-medium">{transactionDetails.amount} ETH</span>
                <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>≈ {cUSDAmount} cUSD</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Recipient</span>
              <span className="font-medium text-sm">
                {transactionDetails.recipient.substring(0, 8)}...{transactionDetails.recipient.substring(36)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Transaction Hash</span>
              <div className="flex items-center gap-1">
                <span className="font-medium text-sm">
                  {transactionDetails.hash.substring(0, 8)}...{transactionDetails.hash.substring(60)}
                </span>
                <a
                  href={`https://etherscan.io/tx/${transactionDetails.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              onClick={handleViewWallet}
              className="w-full h-12 rounded-full bg-black text-white hover:bg-gray-800"
            >
              View Wallet
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(`https://etherscan.io/tx/${transactionDetails.hash}`, "_blank")}
              className="w-full h-12 rounded-full"
            >
              View on Etherscan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

