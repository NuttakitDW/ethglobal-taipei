export function CoinbaseIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={className} fill="none">
      <circle cx="256" cy="256" r="256" fill="#0052FF" />
      <path
        d="M339.9,256c0,46.3-37.6,83.9-83.9,83.9s-83.9-37.6-83.9-83.9s37.6-83.9,83.9-83.9S339.9,209.7,339.9,256z"
        fill="white"
      />
    </svg>
  )
}

