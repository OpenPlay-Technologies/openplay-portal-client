import React from "react";
import {useConnectWallet, useWallets} from '@mysten/dapp-kit';
import {DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import Image from "next/image";


export default function SuiConnectDialog() {
    const wallets = useWallets();
    const {mutate: connect} = useConnectWallet();
    
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    Connect Wallet
                </DialogTitle>
                <DialogDescription>
                    Connect your Sui wallet to start using the OpenPlay protocol.
                </DialogDescription>
            </DialogHeader>
            <div>
                <p className={"font-semibold"}>
                    Choose your wallet
                </p>
                {wallets.map((wallet) => (
                    <div key={wallet.id ?? wallet.name}
                         className={"inline-flex gap-2 p-4 w-full cursor-pointer bg-background text-foreground hover:bg-muted rounded-lg"}
                         onClick={() => {
                             connect(
                                 {
                                     wallet: wallet
                                 },
                                 {
                                     onSuccess: () => console.log('connected'),
                                     onError: (error) => console.error('Connection failed:', error),
                                 },
                             );
                         }}
                    >
                        <Image src={wallet.icon} alt={wallet.name + "-icon"} width={24} height={24}/>
                        {wallet.name}
                    </div>
                ))
                }
            </div>

        </DialogContent>
    );
}