"use client";

import { useState, useEffect } from "react";
import { Check, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { useMobile } from "@/hooks/use-mobile";
import Image from "next/image";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import {
    useConnectWallet,
    useWallets,
    useAccounts,
    useCurrentAccount,
    useCurrentWallet,
    useSwitchAccount,
} from "@mysten/dapp-kit";
import { Button } from "../ui/button";
import { cn, formatAddress } from "@/lib/utils";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useWalletAuth } from "../providers/wallet-auth-context-provider";
import { Loader } from "../ui/loader";

// Mock social providers
const socialProviders = [
    { id: "google", name: "Google", icon: "/zkLogin/google-logo.svg" },
    { id: "facebook", name: "Facebook", icon: "/zkLogin/facebook-logo.png" },
];

export function WalletConnectModal() {
    const isMobile = useMobile();
    const [step, setStep] = useState<"main" | "all-wallets" | "select-address" | "connected">("main");
    const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

    const wallets = useWallets();
    const accounts = useAccounts();
    const currentAccount = useCurrentAccount();
    const { mutate: switchAccount } = useSwitchAccount();
    const wallet = useCurrentWallet();

    const { modalOpen, setModalOpen, onWalletConnected } = useWalletAuth();

    const { mutate: connect, isPending, isSuccess, isError, error, reset } = useConnectWallet();

    // Reset state when dialog/drawer is closed
    useEffect(() => {
        if (!modalOpen) {
            setTimeout(() => {
                setStep("main");
                setSelectedWallet(null);
            }, 300);
        }
    }, [modalOpen]);

    const renderContent = () => (
        <div className="flex flex-col h-full">
            {step === "main" && (
                <>
                    <Alert className="mb-4">
                        <AlertTitle>What is a wallet?</AlertTitle>
                        <AlertDescription>
                            A wallet is an application that lets you interact with your blockchain accounts. You can use it to
                            send, receive, and store digital assets.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            {wallets.map((wallet) => (
                                <WalletOption
                                    key={wallet.id ?? wallet.name}
                                    name={wallet.name}
                                    icon={wallet.icon}
                                    onClick={() =>
                                        connect(
                                            { wallet },
                                            {
                                                onSuccess: () => {
                                                    setStep("connected");
                                                    onWalletConnected();
                                                    reset();
                                                }
                                            }
                                        )
                                    }
                                />
                            ))}
                            {isPending && (
                                <Loader className="mt-4" title="Connection Pending" body="Accept the request in your wallet." />
                            )}
                            {isError && (
                                <Alert className="mb-4" variant="destructive">
                                    <AlertTitle>Connection Failed</AlertTitle>
                                    <AlertDescription>
                                        {error?.message && (
                                            <>
                                                {error.message}
                                                <br />
                                            </>
                                        )}
                                        Please try again or contact support.
                                    </AlertDescription>
                                </Alert>
                            )}
                            {isSuccess && (
                                <Alert className="mb-4" variant="success">
                                    <AlertTitle>Connection Success</AlertTitle>
                                    <AlertDescription>
                                        You are now connected to your wallet.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <h3 className="text-sm font-medium">ZkLogin (Coming soon)</h3>
                            <Alert className="mb-4">
                                <AlertTitle>What is zkLogin?</AlertTitle>
                                <AlertDescription>
                                    zkLogin lets you easily sign into Sui apps using everyday accounts like Google or Facebook, without needing
                                    to deal with complicated wallets.
                                </AlertDescription>
                            </Alert>
                            <div className="grid grid-cols-2 gap-3">
                                {socialProviders.slice(0, 4).map((provider) => (
                                    <SocialOption key={provider.id} provider={provider} onClick={() => { }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {step === "select-address" && selectedWallet && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Select Address</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Choose which address you want to connect with from your{" "}
                    </p>
                    <div className="space-y-3">
                        {/* Address options would be rendered here */}
                    </div>
                </div>
            )}

            {step === "connected" && (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-2">
                        <Check className="h-6 w-6 text-green-600 dark:text-green-300" />
                    </div>
                    <h2 className="text-xl font-semibold">Successfully Connected</h2>
                    {accounts && accounts.length > 1 ? (
                        <>
                            <p className="text-sm text-muted-foreground mb-4">
                                Select the wallet you want to connect with.
                            </p>
                            <div className="space-y-2">
                                {accounts.map((acc, index) => (
                                    <AddressOption
                                        key={acc.address}
                                        address={acc.address}
                                        label={acc.label ?? `${wallet.currentWallet?.name} ${index + 1}`}
                                        onClick={() => switchAccount({ account: acc })}
                                        isSelected={currentAccount?.address === acc.address}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground mb-4">
                            Connected with {wallet.currentWallet?.name} <br />
                            Address: {currentAccount?.address ? formatAddress(currentAccount.address) : "Unknown"}
                        </p>
                    )}
                    <Button onClick={() => setModalOpen(false)} className="mt-4">
                        Close
                    </Button>
                </div>
            )}
        </div>
    );

    if (isMobile) {
        return (
            <Drawer open={modalOpen} onOpenChange={setModalOpen}>
                <DrawerContent className="px-6 pb-6">
                    <DrawerHeader className="px-0">
                        <DrawerTitle>Connect Wallet</DrawerTitle>
                    </DrawerHeader>
                    {renderContent()}
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogDescription className="sr-only">
                    Connect your Sui wallet to start using the OpenPlay protocol.
                </DialogDescription>
                <DialogHeader>
                    <DialogTitle>Connect Wallet</DialogTitle>
                </DialogHeader>
                {renderContent()}
            </DialogContent>
        </Dialog>
    );
}

function WalletOption({
    icon,
    name,
    onClick,
}: {
    icon: string;
    name: string;
    onClick: () => void;
}) {
    return (
        <button
            className="flex items-center w-full p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            onClick={onClick}
        >
            <Image src={icon} alt={`${name}-icon`} width={28} height={28} className="mr-3 rounded-md" />
            <span className="font-medium">{name}</span>
            <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
        </button>
    );
}

function SocialOption({
    provider,
    onClick,
}: {
    provider: { id: string; name: string; icon: string };
    onClick: () => void;
}) {
    return (
        <button
            disabled
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-border transition-colors h-24 opacity-50 cursor-not-allowed pointer-events-none"
            onClick={onClick}
        >
            <div className="mb-2">
                <Image src={provider.icon} alt={provider.name} width={28} height={28} className="rounded-full" />
            </div>
            <span className="text-sm font-medium">{provider.name}</span>
        </button>
    );
}

interface AddressOptionProps {
    address: string;
    label?: string;
    onClick: () => void;
    isSelected?: boolean;
}

function AddressOption({ address, label, onClick, isSelected = false }: AddressOptionProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "group relative w-full rounded-md border p-4 text-left transition-all",
                isSelected
                    ? "bg-accent text-accent-foreground border border-foreground"
                    : "bg-background border border-border hover:border-foreground"
            )}
        >
            <div className="flex flex-col gap-0.5">
                <span className="font-medium">{formatAddress(address)}</span>
                {label && <span className="text-sm text-muted-foreground">{label}</span>}
            </div>
            {isSelected && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Check className="h-5 w-5" />
                </div>
            )}
        </button>
    );
}
