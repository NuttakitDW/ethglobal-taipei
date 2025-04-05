import type { WalletType } from "@/components/wallet-provider"

// Generate a random Ethereum address
export const generateRandomAddress = () => {
  return "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
}

// Generate a random OTP secret
export const generateOtpSecret = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
  return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

// Mock ETH price in USD
export const ETH_USD_PRICE = 3500

// Convert ETH to cUSD equivalent
export const convertEthToCUSD = (ethAmount: string | number): string => {
  const amount = typeof ethAmount === "string" ? Number.parseFloat(ethAmount) : ethAmount
  if (isNaN(amount)) return "0.00"
  return (amount * ETH_USD_PRICE).toFixed(2)
}

// Mock transaction history
export const generateMockTransactions = (walletAddress: string, count = 5) => {
  const txTypes = ["Send", "Receive", "Contract Interaction"]
  const statuses = ["Confirmed", "Pending", "Failed"]

  return Array.from({ length: count }, (_, i) => {
    const type = txTypes[Math.floor(Math.random() * txTypes.length)]
    const isReceive = type === "Receive"

    return {
      id: `tx-${i}-${Date.now()}`,
      type,
      amount: (Math.random() * 2).toFixed(4),
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      from: isReceive ? generateRandomAddress() : walletAddress,
      to: isReceive ? walletAddress : generateRandomAddress(),
      hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
    }
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

// Generate mock wallet data
export const generateMockWallet = (ownerAddress: string, name = ""): WalletType => {
  const walletAddress = generateRandomAddress()
  const randomBalance = (Math.random() * 10).toFixed(4)

  return {
    id: `wallet-${Date.now()}`,
    address: walletAddress,
    name: name || `Wallet ${Math.floor(Math.random() * 1000)}`,
    balance: randomBalance,
    createdAt: new Date(),
    ownerAddress,
  }
}

// Generate mock contract functions
export const getMockContractFunctions = () => [
  { name: "transfer(address,uint256)", description: "Transfer tokens" },
  { name: "approve(address,uint256)", description: "Approve token spending" },
  { name: "balanceOf(address)", description: "Get token balance" },
  { name: "totalSupply()", description: "Get total supply" },
  { name: "mint(address,uint256)", description: "Mint new tokens" },
  { name: "burn(uint256)", description: "Burn tokens" },
]

// Generate QR code data URL (mock implementation)
export const generateQrCodeUrl = (data: string) => {
  // In a real implementation, this would generate an actual QR code
  // For demo purposes, we'll return a placeholder SVG
  return `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(data)}`
}

