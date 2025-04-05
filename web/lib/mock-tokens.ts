export type Token = {
  id: string
  symbol: string
  name: string
  logoURI: string
  address: string
  decimals: number
  chainId: number
  balance?: string
  price?: number
}

export const mockTokens: Token[] = [
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    logoURI: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    decimals: 18,
    chainId: 1,
    balance: "1.2345",
    price: 3500,
  },
  {
    id: "usd-coin",
    symbol: "USDC",
    name: "USD Coin",
    logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
    chainId: 1,
    balance: "1000.00",
    price: 1,
  },
  {
    id: "tether",
    symbol: "USDT",
    name: "Tether",
    logoURI: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    decimals: 6,
    chainId: 1,
    balance: "500.00",
    price: 1,
  },
  {
    id: "wrapped-bitcoin",
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    logoURI: "https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png",
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    decimals: 8,
    chainId: 1,
    balance: "0.05",
    price: 65000,
  },
  {
    id: "chainlink",
    symbol: "LINK",
    name: "Chainlink",
    logoURI: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
    address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    decimals: 18,
    chainId: 1,
    balance: "50.00",
    price: 15,
  },
  {
    id: "uniswap",
    symbol: "UNI",
    name: "Uniswap",
    logoURI: "https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png",
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    decimals: 18,
    chainId: 1,
    balance: "100.00",
    price: 10,
  },
  {
    id: "aave",
    symbol: "AAVE",
    name: "Aave",
    logoURI: "https://assets.coingecko.com/coins/images/12645/small/AAVE.png",
    address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
    decimals: 18,
    chainId: 1,
    balance: "10.00",
    price: 100,
  },
  {
    id: "dai",
    symbol: "DAI",
    name: "Dai",
    logoURI: "https://assets.coingecko.com/coins/images/9956/small/4943.png",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    decimals: 18,
    chainId: 1,
    balance: "750.00",
    price: 1,
  },
  {
    id: "arbitrum",
    symbol: "ARB",
    name: "Arbitrum",
    logoURI: "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg",
    address: "0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1",
    decimals: 18,
    chainId: 1,
    balance: "200.00",
    price: 1.5,
  },
  {
    id: "optimism",
    symbol: "OP",
    name: "Optimism",
    logoURI: "https://assets.coingecko.com/coins/images/25244/small/Optimism.png",
    address: "0x4200000000000000000000000000000000000042",
    decimals: 18,
    chainId: 1,
    balance: "150.00",
    price: 3,
  },
]

export const mockChains = [
  { id: 1, name: "Ethereum", logoURI: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
  { id: 56, name: "BNB Chain", logoURI: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" },
  { id: 137, name: "Polygon", logoURI: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png" },
  {
    id: 42161,
    name: "Arbitrum",
    logoURI: "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg",
  },
  { id: 10, name: "Optimism", logoURI: "https://assets.coingecko.com/coins/images/25244/small/Optimism.png" },
  {
    id: 43114,
    name: "Avalanche",
    logoURI: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  },
]

export function getTokenBySymbol(symbol: string): Token | undefined {
  return mockTokens.find((token) => token.symbol === symbol)
}

export function calculateExchangeAmount(fromToken: Token, toToken: Token, amount: string): string {
  if (!amount || isNaN(Number.parseFloat(amount))) return "0"

  const fromPrice = fromToken.price || 1
  const toPrice = toToken.price || 1

  const valueInUSD = Number.parseFloat(amount) * fromPrice
  const exchangeAmount = valueInUSD / toPrice

  return exchangeAmount.toFixed(6)
}

export function calculatePriceImpact(amount: string): string {
  // Mock price impact calculation
  const numAmount = Number.parseFloat(amount || "0")
  if (numAmount <= 0) return "0.00"

  // Simulate higher price impact for larger amounts
  const impact = Math.min(0.5 + numAmount / 10000, 5)
  return impact.toFixed(2)
}

export function calculateGasFee(): string {
  // Mock gas fee calculation
  return (0.001 + Math.random() * 0.002).toFixed(5)
}

