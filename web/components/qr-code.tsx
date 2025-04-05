"use client"

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react"
import { QrCode } from "lucide-react"

export interface QRCodeRef {
  getCanvas: () => HTMLCanvasElement | null
}

interface QRCodeProps {
  data: string
  size?: number
  className?: string
}

export const QRCode = forwardRef<QRCodeRef, QRCodeProps>(({ data, size = 200, className = "" }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)

  // Expose the canvas element through the ref
  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
  }))

  useEffect(() => {
    // Reset states when data changes
    setIsLoaded(false)
    setError(false)

    // Don't try to generate QR code if no data
    if (!data) return

    const generateQRCode = async () => {
      if (!canvasRef.current) return

      try {
        // Import QRCode.js dynamically
        const QRCodeLib = (await import("qrcode")).default

        // Generate new QR code
        await QRCodeLib.toCanvas(canvasRef.current, data, {
          width: size,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        })

        setIsLoaded(true)
      } catch (err) {
        console.error("Error generating QR code:", err)
        setError(true)
      }
    }

    // Small delay to ensure the canvas is in the DOM
    const timer = setTimeout(() => {
      generateQRCode()
    }, 100)

    return () => clearTimeout(timer)
  }, [data, size])

  // If no data or error, show placeholder
  if (!data || error) {
    return (
      <div
        className={`relative flex items-center justify-center bg-gray-100 rounded-md ${className}`}
        style={{ width: size, height: size }}
      >
        <QrCode className="h-12 w-12 text-muted-foreground opacity-30" data-testid="qr-icon" />
      </div>
    )
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas ref={canvasRef} width={size} height={size} className="rounded-md" role="img" aria-label="QR Code" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  )
})

QRCode.displayName = "QRCode"

