import {GameCapData, GameData} from "@/api/models/models";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {CardContent} from "@/components/ui/card";
import {useCallback, useEffect, useState} from "react";
import {fetchGamesByIds} from "@/api/queries/games";
import {useCurrentAccount, useSignAndExecuteTransaction, useSuiClient} from "@mysten/dapp-kit";
import {formatSuiAmount} from "@/lib/utils";
import Link from "next/link";
import {Transaction} from "@mysten/sui/transactions";
import {useToast} from "@/hooks/use-toast";
import {useBalance} from "@/components/providers/balance-provider";

interface GameOwnerRewardsProps {
    gameCapData: GameCapData[];
    updateGameCapData: () => void;
}

export default function GameOwnerRewards(props: GameOwnerRewardsProps) {
    const [gameData, setGameData] = useState<Record<string, GameData>>({});
    const account = useCurrentAccount();
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID;
    const suiClient = useSuiClient();
    const [loadingClaim, setLoadingClaim] = useState(false);
    const { toast } = useToast();
    const {updateBalance} = useBalance();

    // Fetch the game data for the caps
    const updateGameData = useCallback(async () => {
        if (!account?.address) {
            return;
        }
        const gameData = await fetchGamesByIds(props.gameCapData.map(cap => cap.game_id));
        setGameData(gameData);
    }, [props.gameCapData]);
    useEffect(() => {
        updateGameData();
    }, [updateGameData]);

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

    // Claim
    async function handleClaim(cap: GameCapData) {
        if (!account) {
            console.error('Account not found');
            return;
        }

        const tx = new Transaction();

        const [coin] = tx.moveCall({
            target: `${packageId}::game::claim_all_fees`,
            arguments: [
                tx.object(cap.game_id),
                tx.object(cap.id),
            ],
        });
        tx.transferObjects([coin], account.address);

        signAndExecuteTransaction({
                transaction: tx
            },
            {
                onSuccess: (result) => {
                    console.log('Transaction executed', result);
                    setLoadingClaim(true);
                    suiClient.waitForTransaction({
                        digest: result.digest
                    }).then(() => {
                        toast({
                            title: 'Claimed',
                            description: 'Your claim has been processed successfully',
                        })
                        props.updateGameCapData();
                    }).catch((error) => {
                        toast({
                            variant:"destructive",
                            title: 'Transaction failed',
                            description: error.message,
                        })
                    }).finally(() => {
                        setLoadingClaim(false);
                        updateBalance();
                    });
                },
                onError: (error) => {
                    toast({
                        variant:"destructive",
                        title: 'Transaction failed',
                        description: error.message,
                    })
                }
            });
    }
    
    return (
        <CardContent className={"px-0"}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Game</TableHead>
                        <TableHead>Collected Fees</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {props.gameCapData.map((cap) => {
                            const game = gameData[cap.game_id];
                            if (!game) {
                                return null;
                            }
                            return (
                                <TableRow key={game.id}>
                                    <TableCell>
                                        <div className={"inline-flex items-center gap-4"}>
                                            <img className={"aspect-square h-14"} src={game.image_url}
                                                 alt={game.name + "-image"}/>
                                            <span>{game.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className={"inline-flex gap-2 items-center"}>
                                            <span
                                                className={game.vault.collected_owner_fees.value > 0 ? "text-green-700" : ""}
                                            >{formatSuiAmount(game.vault.collected_owner_fees.value)}</span>
                                            {game.vault.collected_owner_fees.value > 0 &&
                                                <Button disabled={loadingClaim} variant={"outline"} onClick={() => {
                                                    handleClaim(cap)
                                                }}>
                                                    <span>Claim</span>
                                                </Button>
                                            }
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/game/${game.id}`}>
                                            <span className="underline font-semibold">See more</span>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            );
                        }
                    )}
                </TableBody>
            </Table>
        </CardContent>
    );
}