"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useBalanceManager } from "../providers/balance-manager-provider";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { WalletConnect } from "../sui/wallet-conect-modal";
import { useState } from "react";
import { DepositModal } from "../sui/deposit-modal";
import { formatSuiAmount } from "@/lib/utils";

export function DepositActionButton() {

    const account = useCurrentAccount();
    const { currentBalanceManager, bmLoading } = useBalanceManager();

    const [depositOpen, setDepositOpen] = useState(false);
    const [connectOpen, setConnectOpen] = useState(false);


    return (
        <>
            {account ? (
                <>
                    <Button
                        onClick={() => setDepositOpen(true)}
                        variant="outline"
                        className="flex items-center gap-2 font-semibold p-3 rounded-lg bg-gradient-to-r from-openplay1 to-openplay2 text-white hover:text-white hover:brightness-105 transition-all"
                    >
                        <span className="flex-grow text-center">{bmLoading  ? "Loading" : formatSuiAmount(currentBalanceManager ? currentBalanceManager.balance : 0)}</span>
                        <div className="w-px h-6 bg-white/50" />
                        <Plus strokeWidth={2.5} className="h-5 w-5" />
                    </Button>
                </>
            ) : (
                <>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 font-semibold p-3 rounded-lg bg-gradient-to-r from-openplay1 to-openplay2 text-white hover:text-white hover:brightness-105 transition-all"
                        onClick={() => setConnectOpen(true)}
                    >
                        <span className="flex-grow text-center">Connect</span>
                    </Button>
                </>
            )}
            <WalletConnect open={connectOpen} onOpenChange={setConnectOpen} />
            <DepositModal open={depositOpen} onOpenChange={setDepositOpen} />
        </>

    );
}
