'use client'

import React from 'react'
import {useDisconnectWallet} from "@mysten/dapp-kit";

export default function BalanceCard() {

    const {mutate: disconnect} = useDisconnectWallet();

    return (
        <div className="h-full w-auto p-6">
            <p className={"text-foreground h-fit text-center cursor-pointer mx-auto"}
               onClick={() => disconnect()}>
                Disconnect
            </p>
        </div>
    )
}

