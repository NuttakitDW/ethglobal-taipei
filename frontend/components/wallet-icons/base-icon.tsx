export function BaseIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="28" height="28" rx="14" fill="#0052FF" />
      <path
        d="M14 6C9.58172 6 6 9.58172 6 14C6 18.4183 9.58172 22 14 22C18.4183 22 22 18.4183 22 14C22 9.58172 18.4183 6 14 6ZM9.25 14C9.25 16.6234 11.3766 18.75 14 18.75C16.6234 18.75 18.75 16.6234 18.75 14H9.25Z"
        fill="white"
      />
    </svg>
  )
}

