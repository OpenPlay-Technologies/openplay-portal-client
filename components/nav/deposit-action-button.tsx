"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useBalanceManager } from "../providers/balance-manager-provider";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { formatSuiAmount } from "@/lib/utils";
import { useDepositModal } from "../providers/deposit-modal-provider";
import { useWalletAuth } from "../providers/wallet-auth-context-provider";

export function DepositActionButton() {

    const account = useCurrentAccount();
    const { currentBalanceManager, bmLoading } = useBalanceManager();

    const {openDepositModal} = useDepositModal();
    const {openModal} = useWalletAuth();

    return (
        <>
            {account ? (
                <>
                    <Button
                        onClick={() => openDepositModal()}
                        variant="accent"
                        className="flex items-center gap-2 p-3"
                    >
                        <span className="flex-grow text-center">{bmLoading  ? "Loading" : formatSuiAmount(currentBalanceManager ? currentBalanceManager.balance : 0)}</span>
                        <div className="w-px h-6 bg-white/50" />
                        <Plus strokeWidth={2.5} className="h-5 w-5" />
                    </Button>
                </>
            ) : (
                <>
                    <Button
                        variant="accent"
                        className="flex items-center gap-2 p-3"
                        onClick={() => openModal()}
                    >
                        <span className="flex-grow text-center">Connect</span>
                    </Button>
                </>
            )}
        </>

    );
}
