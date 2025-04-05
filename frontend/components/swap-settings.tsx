"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings } from "lucide-react"
import { Slider } from "@/components/ui/slider"

interface SwapSettingsProps {
  slippage: number
  onSlippageChange: (value: number) => void
  deadline: number
  onDeadlineChange: (value: number) => void
}

export function SwapSettings({ slippage, onSlippageChange, deadline, onDeadlineChange }: SwapSettingsProps) {
  const [open, setOpen] = useState(false)
  const [slippageInput, setSlippageInput] = useState(slippage.toString())
  const [deadlineInput, setDeadlineInput] = useState(deadline.toString())

  const handleSlippageChange = (value: number[]) => {
    const newSlippage = value[0]
    setSlippageInput(newSlippage.toString())
    onSlippageChange(newSlippage)
  }

  const handleSlippageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSlippageInput(value)
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0.1 && numValue <= 5) {
      onSlippageChange(numValue)
    }
  }

  const handleDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDeadlineInput(value)
    const numValue = Number.parseInt(value)
    if (!isNaN(numValue) && numValue > 0) {
      onDeadlineChange(numValue)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Swap Settings</DialogTitle>
          <DialogDescription>Configure your swap settings. These settings will apply to all swaps.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="slippage">Slippage Tolerance</Label>
              <span className="text-sm text-muted-foreground">{slippage}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Slider
                id="slippage"
                min={0.1}
                max={5}
                step={0.1}
                value={[slippage]}
                onValueChange={handleSlippageChange}
              />
              <div className="flex items-center">
                <Input
                  type="number"
                  value={slippageInput}
                  onChange={handleSlippageInputChange}
                  className="w-16 text-right"
                  min={0.1}
                  max={5}
                  step={0.1}
                />
                <span className="ml-1">%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Your transaction will revert if the price changes unfavorably by more than this percentage.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">Transaction Deadline</Label>
            <div className="flex items-center gap-2">
              <Input
                id="deadline"
                type="number"
                value={deadlineInput}
                onChange={handleDeadlineChange}
                className="w-20"
                min={1}
              />
              <span>minutes</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your transaction will revert if it is pending for more than this period of time.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

