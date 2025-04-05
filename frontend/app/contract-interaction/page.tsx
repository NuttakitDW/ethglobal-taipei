"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/components/wallet-provider"
import { WalletSelect } from "@/components/wallet-select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OtpInput } from "@/components/otp-input"
import { useToast } from "@/components/ui/use-toast"
import { Code, CheckCircle, ArrowLeft, AlertCircle } from "lucide-react"

interface AbiFunction {
  name: string
  type: string
  inputs: AbiInput[]
  outputs?: any[]
  stateMutability?: string
  constant?: boolean
  payable?: boolean
}

interface AbiInput {
  name: string
  type: string
  components?: AbiInput[]
}

export default function ContractInteractionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isConnected, activeWallet } = useWallet()
  const [contractAddress, setContractAddress] = useState("")
  const [abiString, setAbiString] = useState("")
  const [parsedAbi, setParsedAbi] = useState<AbiFunction[]>([])
  const [selectedFunction, setSelectedFunction] = useState<AbiFunction | null>(null)
  const [functionInputs, setFunctionInputs] = useState<Record<string, string>>({})
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [abiError, setAbiError] = useState<string | null>(null)

  // Redirect to home if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/")
    }
  }, [isConnected, router])

  // Parse ABI when it changes
  useEffect(() => {
    if (!abiString) {
      setParsedAbi([])
      setSelectedFunction(null)
      setAbiError(null)
      return
    }

    try {
      const parsed = JSON.parse(abiString)
      const abiFunctions = Array.isArray(parsed) ? parsed.filter((item) => item.type === "function") : []

      setParsedAbi(abiFunctions)
      setAbiError(null)

      // Reset selected function and inputs
      setSelectedFunction(null)
      setFunctionInputs({})
    } catch (error) {
      console.error("Error parsing ABI:", error)
      setAbiError("Invalid ABI format. Please check your JSON syntax.")
      setParsedAbi([])
    }
  }, [abiString])

  // Reset function inputs when selected function changes
  useEffect(() => {
    if (selectedFunction) {
      const initialInputs: Record<string, string> = {}
      selectedFunction.inputs.forEach((input) => {
        initialInputs[input.name || `param_${input.type}`] = ""
      })
      setFunctionInputs(initialInputs)
    } else {
      setFunctionInputs({})
    }
  }, [selectedFunction])

  if (!isConnected || !activeWallet) {
    return (
      <div className="container max-w-md py-10 flex items-center justify-center">
        <p>Please connect your wallet and create a wallet first...</p>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!contractAddress) {
      toast({
        title: "Invalid Input",
        description: "Please enter a contract address.",
        variant: "destructive",
      })
      return
    }

    if (!selectedFunction) {
      toast({
        title: "Invalid Input",
        description: "Please select a function to call.",
        variant: "destructive",
      })
      return
    }

    // Show OTP input
    setShowOtpInput(true)
  }

  const handleOtpComplete = (otp: string) => {
    setIsSubmitting(true)

    // Mock contract interaction
    setTimeout(() => {
      // Generate a mock result
      const mockResults = [
        "0x000000000000000000000000000000000000000000000000000000000000002a",
        "true",
        "0x1234567890abcdef",
        "1000000000000000000",
        "[0x123..., 0x456..., 0x789...]",
      ]

      setResult(mockResults[Math.floor(Math.random() * mockResults.length)])
      setShowOtpInput(false)
      setIsSubmitting(false)

      // Show success message
      toast({
        title: "Contract Call Successful",
        description: `Contract call to ${contractAddress.substring(0, 6)}...${contractAddress.substring(38)} completed`,
      })
    }, 2000)
  }

  const handleSelectFunction = (functionName: string) => {
    const func = parsedAbi.find((f) => f.name === functionName) || null
    setSelectedFunction(func)
  }

  const handleInputChange = (paramName: string, value: string) => {
    setFunctionInputs((prev) => ({
      ...prev,
      [paramName]: value,
    }))
  }

  const handleClearResult = () => {
    setResult(null)
    setContractAddress("")
    setAbiString("")
    setSelectedFunction(null)
    setFunctionInputs({})
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/wallets")} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to wallets</span>
            </Button>
            <h1 className="text-3xl font-bold">Contract Interaction</h1>
          </div>
          <WalletSelect />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Call Smart Contract</CardTitle>
              <CardDescription>Interact with any smart contract on the Ethereum network.</CardDescription>
            </CardHeader>
            <CardContent>
              {showOtpInput ? (
                <div className="space-y-6">
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Contract Call Details</p>
                      <p className="text-sm text-muted-foreground">
                        Call {selectedFunction?.name} on {contractAddress.substring(0, 6)}...
                        {contractAddress.substring(38)}
                      </p>
                      {Object.entries(functionInputs).length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Parameters:</p>
                          {Object.entries(functionInputs).map(([name, value]) => (
                            <p key={name} className="text-sm text-muted-foreground">
                              {name}: {value || "(empty)"}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Enter the 6-digit code from your authenticator app to confirm
                    </p>
                    <OtpInput length={6} onComplete={handleOtpComplete} />
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contract-address">Contract Address</Label>
                    <Input
                      id="contract-address"
                      placeholder="0x..."
                      value={contractAddress}
                      onChange={(e) => setContractAddress(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contract-abi">Contract ABI</Label>
                    <Textarea
                      id="contract-abi"
                      placeholder='[{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},...]'
                      value={abiString}
                      onChange={(e) => setAbiString(e.target.value)}
                      className="font-mono text-xs h-32"
                    />
                    {abiError && (
                      <div className="flex items-center gap-1 text-red-500 text-xs">
                        <AlertCircle className="h-3 w-3" />
                        <span>{abiError}</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Paste the contract ABI JSON to enable function selection.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="function-selector">Function</Label>
                    <Select
                      onValueChange={handleSelectFunction}
                      value={selectedFunction?.name || ""}
                      disabled={parsedAbi.length === 0}
                    >
                      <SelectTrigger id="function-selector">
                        <SelectValue placeholder="Select a function" />
                      </SelectTrigger>
                      <SelectContent>
                        {parsedAbi.map((func) => (
                          <SelectItem key={func.name} value={func.name}>
                            {func.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedFunction && selectedFunction.inputs.length > 0 && (
                    <div className="space-y-4 pt-2">
                      <div className="text-sm font-medium">Function Parameters</div>
                      {selectedFunction.inputs.map((input, index) => (
                        <div key={index} className="space-y-2">
                          <Label htmlFor={`param-${index}`}>
                            {input.name || `Parameter ${index + 1}`} ({input.type})
                          </Label>
                          <Input
                            id={`param-${index}`}
                            placeholder={`Enter ${input.type} value`}
                            value={functionInputs[input.name || `param_${input.type}`] || ""}
                            onChange={(e) => handleInputChange(input.name || `param_${input.type}`, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={!contractAddress || !selectedFunction}>
                    Execute Call
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Result</CardTitle>
              <CardDescription>
                {result ? "Contract call completed successfully" : "Results will appear here after execution"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div className="rounded-lg border p-4 bg-muted overflow-auto">
                    <pre className="text-sm font-mono whitespace-pre-wrap break-all">
                      <code>{result}</code>
                    </pre>
                  </div>

                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle className="h-5 w-5" />
                    <p>Transaction verified with zkOTP</p>
                  </div>

                  <Button onClick={handleClearResult} className="w-full">
                    Clear & Start New Call
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
                  <Code className="h-12 w-12" />
                  <p>No results to display yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

