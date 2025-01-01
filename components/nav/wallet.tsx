"use client"
import { WalletIcon} from "@heroicons/react/24/outline";
import React from "react";
import { useCurrentAccount} from "@mysten/dapp-kit";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import NavButton from "@/components/nav/nav-button";
import {
    Dialog,
    DialogTrigger
} from "@/components/ui/dialog";
import SuiConnectDialog from "@/components/sui/sui-connect-dialog";
import BalanceCard from "@/components/nav/balance-card";
import {useBalance} from "@/components/providers/balance-provider";
import {formatSuiAmount} from "@/lib/utils";

interface WalletProps {
    transparent?: boolean;
}

export default function Wallet(props: WalletProps) {
    const account = useCurrentAccount();
    const {balance} = useBalance();

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
                    <SuiConnectDialog/>
                </Dialog>
            }
            {account && <Popover >
                <PopoverTrigger>
                    <NavButton
                        text={formatSuiAmount(balance)}
                        icon={<WalletIcon className="w-6 h-6" />}
                        light={props.transparent}
                    />
                </PopoverTrigger>
                <PopoverContent className={"flex p-0 w-auto m-1"} >
                    <BalanceCard />
                </PopoverContent>
            </Popover>}
        </>
    )
} 