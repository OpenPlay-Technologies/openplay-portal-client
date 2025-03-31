"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
} from "@/components/ui/drawer"
// import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { CheckCircle2, Wallet } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import Link from "next/link"
import { cn, formatAddress } from "@/lib/utils"

interface WithdrawalModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function WithdrawalModal({ open, onOpenChange }: WithdrawalModalProps) {
    const connectedWalletAddress = "0x123456789abcdef"
    const [address, setAddress] = useState<string>(connectedWalletAddress);
    const [percentage, setPercentage] = useState<number>(100)
    const [isSuccess, setIsSuccess] = useState(false)
    const isMobile = useMobile()

    // Simulated connected wallet address and balance
    const totalBalance = 0.44 // in SUI

    const withdrawalAmount = (totalBalance * percentage) / 100

    const handleWithdrawal = () => {
        if (!address) return

        // Simulate withdrawal processing
        setTimeout(() => {
            setIsSuccess(true)
            // Reset fields after showing success
            setTimeout(() => {
                setAddress("")
                setPercentage(100)
            }, 500)
        }, 1000)
    }

    //   const handleUseConnectedWallet = () => {
    //     setAddress(connectedWalletAddress)
    //   }

    const handleClose = () => {
        if (isSuccess) {
            setIsSuccess(false)
            onOpenChange(false)
        }
    }

    const handlePercentageChange = (value: number[]) => {
        setPercentage(value[0])
    }

    const setPresetPercentage = (value: number) => {
        setPercentage(value)
    }

    const WithdrawalContent = (
        <>
            {!isSuccess ? (
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            {/* <div className="flex items-center justify-between mb-2">
                                <Label>Current Balance</Label>
                                <span className="font-medium">{totalBalance.toFixed(4)} SUI</span>
                            </div> */}
                            <div className="p-4 rounded-lg border bg-muted/30 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Wallet className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm font-medium">Withdrawal Amount</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-semibold">{withdrawalAmount.toFixed(4)} SUI</div>
                                    <div className="text-xs text-muted-foreground">{percentage}% of balance</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>Amount to withdraw</Label>
                            <Slider
                                defaultValue={[100]}
                                max={100}
                                step={1}
                                value={[percentage]}
                                onValueChange={handlePercentageChange}
                                className="my-6"
                            />
                            <div className="flex flex-wrap gap-2">
                                {[25, 50, 75, 100].map((value) => (
                                    <Button
                                        key={value}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPresetPercentage(value)}
                                        className={cn("flex-1 min-w-[60px]", percentage === value && "border-primary bg-primary/10")}
                                    >
                                        {value}%
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* <div className="space-y-2">
              <Label htmlFor="withdrawal-address">Withdrawal Address</Label>
              <Input
                id="withdrawal-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter wallet address"
              />
              <Button variant="link" onClick={handleUseConnectedWallet} className="h-auto p-0 text-xs">
                Use connected wallet ({connectedWalletAddress.substring(0, 6)}...
                {connectedWalletAddress.substring(connectedWalletAddress.length - 4)})
              </Button>
            </div> */}

                        {/* <Alert className="bg-muted/50">
                            <AlertDescription>Ensure the wallet address is correct. Withdrawals are irreversible.</AlertDescription>
                        </Alert> */}
                        <Alert className="bg-muted/50">
                            <AlertDescription>Funds are automatically withdrawn to your connect wallet: {formatAddress(connectedWalletAddress)}</AlertDescription>
                        </Alert>
                    </div>

                    <Button onClick={handleWithdrawal} disabled={!address || percentage === 0} className="w-full">
                        Withdraw {withdrawalAmount.toFixed(4)} SUI
                    </Button>
                </div>
            ) : (
                <div className="py-6 flex flex-col items-center justify-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium">Withdrawal Successful!</h3>
                    <p className="text-center text-muted-foreground">
                        {withdrawalAmount.toFixed(4)} SUI has been sent to your wallet.
                    </p>
                    <Button onClick={handleClose} className="mt-4">
                        Continue
                    </Button>
                </div>
            )}
        </>
    )

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent>
                    <DrawerHeader className="border-b">
                        <DrawerTitle>Withdraw Funds</DrawerTitle>
                        <DrawerDescription>Send SUI to your wallet</DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 py-4">{WithdrawalContent}</div>
                    <DrawerFooter className="pt-2" />
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                    <DialogDescription>
                        Send SUI to your wallet.{" "}
                        <Link href="/balance-manager" className="underline hover:text-primary" onClick={() => onOpenChange(false)}>
                            Learn more
                        </Link>
                    </DialogDescription>
                </DialogHeader>
                {WithdrawalContent}
                <DialogFooter className="pt-2" />
            </DialogContent>
        </Dialog>
    )
}

