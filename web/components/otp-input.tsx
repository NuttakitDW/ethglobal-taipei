"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"

interface OtpInputProps {
  length: number
  onComplete: (otp: string) => void
  onError?: (error: string) => void
  error?: string
  isVerifying?: boolean
}

export function OtpInput({ length = 6, onComplete, onError, error, isVerifying = false }: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""))
  const [attemptCount, setAttemptCount] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length)
  }, [length])

  // Focus on first input on mount
  useEffect(() => {
    if (inputRefs.current[0] && !isVerifying) {
      inputRefs.current[0].focus()
    }
  }, [isVerifying])

  // Reset inputs when error is cleared
  useEffect(() => {
    if (!error && attemptCount > 0) {
      setOtp(Array(length).fill(""))
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus()
      }
    }
  }, [error, attemptCount, length])

  // Update the handleChange function to immediately disable inputs after completion
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value

    // Allow only one digit per input
    if (value.length > 1) {
      return
    }

    if (value && /^[0-9]$/.test(value)) {
      // Update the OTP array
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      // Move focus to the next input if available
      if (index < length - 1 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus()
      } else if (index === length - 1) {
        // If this is the last input, check if OTP is complete
        if (!newOtp.includes("")) {
          setAttemptCount((prev) => prev + 1)

          // Immediately disable all inputs to prevent further typing
          inputRefs.current.forEach((input) => {
            if (input) input.disabled = true
          })

          // Blur the last input and call onComplete
          inputRefs.current[index]?.blur()
          onComplete(newOtp.join(""))
        }
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (otp[index] === "") {
        // If current input is empty, move to previous input
        if (index > 0) {
          const newOtp = [...otp]
          newOtp[index - 1] = ""
          setOtp(newOtp)
          inputRefs.current[index - 1]?.focus()
        }
      } else {
        // Clear current input
        const newOtp = [...otp]
        newOtp[index] = ""
        setOtp(newOtp)
      }
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }

    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Update the handlePaste function to also disable inputs after completion
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    // Check if pasted content is valid and has the right length
    if (/^\d+$/.test(pastedData) && pastedData.length === length) {
      const newOtp = pastedData.split("").slice(0, length)
      setOtp(newOtp)
      setAttemptCount((prev) => prev + 1)

      // Immediately disable all inputs to prevent further typing
      inputRefs.current.forEach((input) => {
        if (input) input.disabled = true
      })

      // Call onComplete callback
      onComplete(newOtp.join(""))

      // Blur the focused input
      inputRefs.current[inputRefs.current.length - 1]?.blur()
    } else if (onError) {
      onError("Invalid OTP format. Please paste a 6-digit number.")
    }
  }

  // Add a reset function to enable inputs again when needed
  useEffect(() => {
    if (isVerifying) {
      // Disable all inputs during verification
      inputRefs.current.forEach((input) => {
        if (input) input.disabled = true
      })
    } else if (attemptCount > 0 && !error) {
      // Re-enable inputs when verification is complete or when error is cleared
      inputRefs.current.forEach((input) => {
        if (input) input.disabled = false
      })
    }
  }, [isVerifying, error, attemptCount])

  return (
    <div className="space-y-2">
      <div className="flex gap-2 justify-center">
        {Array.from({ length }).map((_, index) => (
          <Input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[index]}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            ref={(el) => (inputRefs.current[index] = el)}
            className={`w-12 h-12 text-center text-lg ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            aria-label={`OTP digit ${index + 1}`}
            disabled={isVerifying}
          />
        ))}
      </div>
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm mt-2 justify-center">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

