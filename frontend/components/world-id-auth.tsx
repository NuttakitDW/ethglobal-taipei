"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Globe } from "lucide-react"

interface WorldIDAuthProps {
  onSuccess: () => void
  buttonText?: string
}

export function WorldIDAuth({ onSuccess, buttonText = "Verify with World ID" }: WorldIDAuthProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const { toast } = useToast()

  const handleVerify = async () => {
    setIsVerifying(true)
    try {
      // In a real implementation, we would integrate with World ID
      // For demo purposes, we'll simulate a successful verification
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Verification Successful",
        description: "Your identity has been verified with World ID.",
      })

      onSuccess()
    } catch (error) {
      console.error("Error verifying World ID:", error)

      toast({
        title: "Verification Failed",
        description: "Failed to verify your identity. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Button onClick={handleVerify} disabled={isVerifying} className="flex items-center gap-2">
      <Globe className="h-4 w-4" />
      {isVerifying ? "Verifying..." : buttonText}
    </Button>
  )
}

