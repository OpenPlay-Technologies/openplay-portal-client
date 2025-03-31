"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import Link from "next/link";

interface DepositModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DepositModal({ open, onOpenChange }: DepositModalProps) {
    const [amount, setAmount] = useState<string>("");
    const [customAmount, setCustomAmount] = useState<string>("");
    const [isSuccess, setIsSuccess] = useState(false);
    const isMobile = useMobile();

    const presetAmounts = ["0.5", "1", "2", "5", "10"];

    const handleDeposit = () => {
        const depositAmount = amount || customAmount;
        if (!depositAmount) return;

        // Simulate deposit processing
        setTimeout(() => {
            setIsSuccess(true);
            // Reset fields after showing success
            setTimeout(() => {
                setAmount("");
                setCustomAmount("");
            }, 500);
        }, 1000);
    };

    const handleClose = () => {
        if (isSuccess) {
            setIsSuccess(false);
            onOpenChange(false);
        }
    };

    const DepositContent = (
        <>
            {!isSuccess ? (
                <>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-3 gap-2">
                            {presetAmounts.map((preset) => (
                                <Button
                                    key={preset}
                                    variant={amount === preset ? "default" : "outline"}
                                    onClick={() => {
                                        setAmount(preset);
                                        setCustomAmount("");
                                    }}
                                    className="w-full"
                                >
                                    {preset} SUI
                                </Button>
                            ))}
                            <div className="col-span-3 mt-2">
                                <Label htmlFor="custom-amount">Custom amount</Label>
                                <div className="flex items-center mt-1">
                                    <Input
                                        id="custom-amount"
                                        value={customAmount}
                                        onChange={(e) => {
                                            setCustomAmount(e.target.value);
                                            setAmount("");
                                        }}
                                        placeholder="Enter amount"
                                        className="flex-1"
                                    />
                                    <span className="ml-2">SUI</span>
                                </div>
                            </div>
                        </div>

                        <Alert className="mt-4 bg-muted">
                            <AlertDescription>
                                You remain in full control of these funds. They cannot be recovered if you lose access to your wallet.
                            </AlertDescription>
                        </Alert>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleDeposit} disabled={!amount && !customAmount}>
                            Deposit
                        </Button>
                    </div>
                </>
            ) : (
                <div className="py-6 flex flex-col items-center justify-center space-y-4">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                    <h3 className="text-xl font-medium">Deposit Successful!</h3>
                    <p className="text-center text-muted-foreground">
                        Your funds have been added to your balance.
                    </p>
                    <Button onClick={handleClose} className="mt-4">
                        Continue
                    </Button>
                </div>
            )}
        </>
    );

    return isMobile ? (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Deposit SUI</DrawerTitle>
                    <DrawerDescription>
                        <span>Add funds to your balance</span>
                    </DrawerDescription>

                </DrawerHeader>
                <div className="px-4">{DepositContent}</div>
                <DrawerFooter className="pt-2" />
            </DrawerContent>
        </Drawer>
    ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Deposit SUI</DialogTitle>
                    <DialogDescription>
                        Add funds to your balance.{' '}
                        <Link
                            href="/balance-manager"
                            className="underline"
                            onClick={() => onOpenChange(false)}
                        >
                            Learn more
                        </Link>
                    </DialogDescription>
                </DialogHeader>
                {DepositContent}
                <DialogFooter className="pt-2" />
            </DialogContent>
        </Dialog>
    );
}
