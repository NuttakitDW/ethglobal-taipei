"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronDown, Globe } from "lucide-react"
import { mockChains } from "@/lib/mock-tokens"

interface ChainSelectorProps {
  value: number
  onChange: (chainId: number) => void
}

export function ChainSelector({ value, onChange }: ChainSelectorProps) {
  const [open, setOpen] = useState(false)
  const selectedChain = mockChains.find((chain) => chain.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between rounded-xl shadow-sm border-purple-100"
        >
          {selectedChain ? (
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full overflow-hidden mr-2 border shadow-sm">
                <img
                  src={selectedChain.logoURI || "/placeholder.svg"}
                  alt={selectedChain.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-medium">{selectedChain.name}</span>
            </div>
          ) : (
            <div className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              <span>Select chain</span>
            </div>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0 rounded-xl shadow-lg border-purple-100">
        <Command>
          <CommandInput placeholder="Search chain..." className="py-3" />
          <CommandEmpty>No chain found.</CommandEmpty>
          <CommandGroup>
            <CommandList className="max-h-[300px] overflow-y-auto py-2">
              {mockChains.map((chain) => (
                <CommandItem
                  key={chain.id}
                  value={chain.name}
                  onSelect={() => {
                    onChange(chain.id)
                    setOpen(false)
                  }}
                  className="cursor-pointer py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full overflow-hidden mr-3 border shadow-sm">
                      <img
                        src={chain.logoURI || "/placeholder.svg"}
                        alt={chain.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-medium">{chain.name}</span>
                  </div>
                  {value === chain.id && <Check className="ml-2 h-4 w-4 text-primary" />}
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

