"use client"
import { WalletIcon } from "@heroicons/react/24/outline";
import React from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import NavButton from "@/components/nav/nav-button";
import {
    Dialog,
    DialogTrigger
} from "@/components/ui/dialog";
import SuiConnectDialog from "@/components/sui/sui-connect-dialog";
import { formatSuiAmount } from "@/lib/utils";
import BalanceManagerCard from "@/components/gameplay/balance-manager-card";
import { useBalanceManager } from "@/components/providers/balance-manager-provider";

interface WalletProps {
    transparent?: boolean;
}

export default function Wallet(props: WalletProps) {
    const account = useCurrentAccount();
    const { currentBalanceManager, bmLoading } = useBalanceManager();

    return (
        <>
            {/*Connect button when not connected*/}
            {!account &&
                <Dialog>
                    <DialogTrigger asChild>
                        <NavButton
                            text="Connect"
                            icon={<WalletIcon className="w-6 h-6" />}
                            light={props.transparent}
                        />
                    </DialogTrigger>
                    <SuiConnectDialog />
                </Dialog>
            }
            {account &&
            (bmLoading ? 
            <NavButton
                text="Loading..."
                icon={<WalletIcon className="w-6 h-6" />}
                light={props.transparent}
            /> :
            <Popover >
                <PopoverTrigger>
                    <NavButton
                        text={formatSuiAmount(currentBalanceManager?.balance ?? 0)}
                        icon={<WalletIcon className="w-6 h-6" />}
                        light={props.transparent}
                    />
                </PopoverTrigger>
                <PopoverContent className={"flex p-0 w-auto m-1"} >
                    {/*<BalanceCard />*/}
                    <BalanceManagerCard />
                </PopoverContent>
            </Popover>
            )}
        </>
    )
} 