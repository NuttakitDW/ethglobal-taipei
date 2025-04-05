"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronDown, Search } from "lucide-react"
import { type Token, mockTokens } from "@/lib/mock-tokens"

interface TokenSelectorProps {
  value: Token | null
  onChange: (token: Token) => void
  otherToken?: Token | null
}

export function TokenSelector({ value, onChange, otherToken }: TokenSelectorProps) {
  const [open, setOpen] = useState(false)
  const [tokens, setTokens] = useState<Token[]>(mockTokens)

  // Filter out the other selected token
  useEffect(() => {
    if (otherToken) {
      setTokens(mockTokens.filter((token) => token.address !== otherToken.address))
    } else {
      setTokens(mockTokens)
    }
  }, [otherToken])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="flex items-center gap-1 px-3 h-full border-l"
        >
          {value ? (
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full overflow-hidden border shadow-sm mr-2">
                <img
                  src={value.logoURI || "/placeholder.svg"}
                  alt={value.symbol}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-medium">{value.symbol}</span>
            </div>
          ) : (
            "Select token"
          )}
          <ChevronDown className="h-4 w-4 opacity-50 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 rounded-xl shadow-lg border-purple-100">
        <Command>
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput placeholder="Search token..." className="flex-1 bg-transparent focus:outline-none" />
          </div>
          <CommandEmpty>
            <div className="py-6 text-center text-sm">No token found.</div>
          </CommandEmpty>
          <CommandGroup>
            <CommandList className="max-h-[300px] overflow-y-auto py-2">
              {tokens.map((token) => (
                <CommandItem
                  key={token.address}
                  value={token.symbol}
                  onSelect={() => {
                    onChange(token)
                    setOpen(false)
                  }}
                  className="cursor-pointer py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center w-full">
                    <div className="w-8 h-8 rounded-full overflow-hidden border shadow-sm mr-3">
                      <img
                        src={token.logoURI || "/placeholder.svg"}
                        alt={token.symbol}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="font-medium">{token.symbol}</span>
                      <span className="text-xs text-muted-foreground">{token.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{token.balance ? `${token.balance}` : ""}</span>
                    {value?.address === token.address && <Check className="ml-2 h-4 w-4 text-primary" />}
                  </div>
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

