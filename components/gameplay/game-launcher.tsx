"use client"
import CoinFlipGame from "@/components/gameplay/coin-flip-game";
import {useKeypair} from "@/components/providers/keypair-provider";
import {useBalanceManager} from "@/components/providers/balance-manager-provider";
import {useCurrentAccount, useSignAndExecuteTransaction, useSuiClient} from "@mysten/dapp-kit";
import {GameModel} from "@/api/models/openplay-coin-flip";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Transaction} from "@mysten/sui/transactions";
import {useState} from "react";
import BalanceManagerCard from "@/components/gameplay/balance-manager-card";
import {useRouter} from "next/navigation";

interface GameLauncherProps {
    data: GameModel;
    className?: string;
}

export default function GameLauncher(props: GameLauncherProps) {
    const corePackageId = process.env.NEXT_PUBLIC_CORE_PACKAGE_ID;
    const {back} = useRouter();
    const account = useCurrentAccount();
    const {keypair, activePlayCap: kpActivePlayCap, updatePlayCaps} = useKeypair();
    const [loadingRefresh, setLoadingRefresh] = useState(false);

    const {
        currentBalanceManager,
        currentBalanceManagerCap,
        refreshBalanceManagers
    } = useBalanceManager();

    const suiClient = useSuiClient();
    const {mutate: signAndExecuteTransaction} = useSignAndExecuteTransaction({
        execute: async ({bytes, signature}) =>
            await suiClient.executeTransactionBlock({
                transactionBlock: bytes,
                signature,
                options: {
                    // Raw effects are required so the effects can be reported back to the wallet
                    showRawEffects: true,
                    // Select additional data to return
                    showObjectChanges: true,
                },
            }),
    });

    const handleRefresh = () => {

        if (!account || !keypair) {
            console.error('Account not found');
            return;
        }

        if (!currentBalanceManager) {
            console.error('Balance manager not found');
            return;
        }

        if (!currentBalanceManagerCap) {
            console.error('Balance manager cap not found');
            return;
        }

        const tx = new Transaction();

        // Transfer the play cap
        const [play_cap] = tx.moveCall({
            target: `${corePackageId}::balance_manager::mint_play_cap`,
            arguments: [
                tx.object(currentBalanceManager.id),
                tx.object(currentBalanceManagerCap.id),
            ],
        });
        tx.transferObjects([play_cap], keypair.toSuiAddress());
        
        setLoadingRefresh(true);

        signAndExecuteTransaction({
                transaction: tx
            },
            {
                onSuccess: (result) => {
                    console.log('Transaction executed', result);
                    suiClient.waitForTransaction({
                        digest: result.digest
                    }).then(() => {
                        setLoadingRefresh(false);
                        refreshBalanceManagers();
                        updatePlayCaps();
                    }).catch((error) => {
                        console.error('Transaction failed', error);
                    });
                },
                onError: (error) => {
                    console.error('Transaction failed', error);
                }
            }
        );
    }

    return (
        <div className={"flex justify-center items-center h-full w-full"}>
            
            {!account && <Card>
                <CardHeader>
                    <CardTitle>
                        Connect your wallet to continue
                    </CardTitle>
                    <CardDescription>
                        Please connect your wallet and set up a balance manager to start playing.
                    </CardDescription>
                </CardHeader>
            </Card>}
            {account && !currentBalanceManager && <BalanceManagerCard />}
            {kpActivePlayCap && account && <CoinFlipGame data={props.data} onClose={() => {
                back();
            }}/>
            }
            {/*{!gameLaunched && <StartGame*/}
            {/*    gameData={props.data}*/}
            {/*    onLaunch={handleLaunch}*/}
            {/*/>}*/}
            {!kpActivePlayCap && account && currentBalanceManager &&

                <Card>
                    <CardHeader>
                        <CardTitle>
                            No valid gaming session found
                        </CardTitle>
                        <CardDescription>
                            Please refresh your gaming session to continue.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className={"w-fit h-fit"} onClick={handleRefresh} disabled={loadingRefresh}>
                            Refresh Session
                        </Button>
                    </CardContent>
                </Card>
            }
        </div>
    );
}