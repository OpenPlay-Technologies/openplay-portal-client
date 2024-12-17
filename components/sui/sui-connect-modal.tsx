import React from "react";
import { ConnectButton, useConnectWallet, useWallets } from '@mysten/dapp-kit';


export default function SuiConnectModal() {
    const wallets = useWallets();
    const { mutate: connect } = useConnectWallet();

    return (
        <div style={{ padding: 20 }}>
            <ConnectButton />
            <ul>
                {wallets.map((wallet) => (
                    <li key={wallet.name}>
                        <button
                            onClick={() => {
                                connect(
                                    { wallet },
                                    {
                                        onSuccess: () => console.log('connected'),
                                    },
                                );
                            }}
                        >
                            Connect to {wallet.name}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}