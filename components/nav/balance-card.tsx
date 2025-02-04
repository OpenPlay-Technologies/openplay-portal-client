'use client'

import React from 'react'
import {useDisconnectWallet} from "@mysten/dapp-kit";
import Link from "next/link";

export default function BalanceCard() {

    const {mutate: disconnect} = useDisconnectWallet();

    return (
        <div className="h-full w-auto p-6 flex flex-col gap-4">
            <Link href={"/rewards"}>
                <p className={"text-foreground h-fit text-center cursor-pointer mx-auto"}>
                    Rewards
                </p>
            </Link>


            <p className={"h-fit text-center cursor-pointer mx-auto text-muted-foreground"}
               onClick={() => disconnect()}>
            Disconnect
            </p>
        </div>
    )
}

