export function TrustIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/trustwallet-sA6y3aVW2atkqHHy5vSFrdT2SI7vnI.png"
        alt="Trust Wallet"
        className="w-full h-full object-contain"
      />
    </div>
  )
}

