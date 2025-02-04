import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {CardContent} from "@/components/ui/card";
import {useCallback, useEffect, useState} from "react";
import {fetchHousesByIds} from "@/api/queries/house";
import {useCurrentAccount, useSignAndExecuteTransaction, useSuiClient} from "@mysten/dapp-kit";
import {formatSuiAmount} from "@/lib/utils";
import Link from "next/link";
import {Transaction} from "@mysten/sui/transactions";
import {useToast} from "@/hooks/use-toast";
import {useBalance} from "@/components/providers/balance-provider";
import {HouseAdminCapModel, HouseModel} from "@/api/models/openplay-core";

interface GameOwnerRewardsProps {
    houseAdminCapData: HouseAdminCapModel[];
    updateGameCapData: () => void;
}

export default function HouseOwnerRewards(props: GameOwnerRewardsProps) {
    const [houseData, setHouseData] = useState<Record<string, HouseModel>>({});
    const account = useCurrentAccount();
    const packageId = process.env.NEXT_PUBLIC_CORE_PACKAGE_ID;
    const suiClient = useSuiClient();
    const [loadingClaim, setLoadingClaim] = useState(false);
    const { toast } = useToast();
    const {updateBalance} = useBalance();

    // Fetch the game data for the caps
    const updateHouseData = useCallback(async () => {
        if (!account?.address) {
            return;
        }
        const houseData = await fetchHousesByIds(props.houseAdminCapData.map(cap => cap.house_id));
        setHouseData(houseData);
    }, [props.houseAdminCapData]);
    useEffect(() => {
        updateHouseData();
    }, [updateHouseData]);

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
    async function handleClaim(cap: HouseAdminCapModel) {
        if (!account) {
            console.error('Account not found');
            return;
        }

        const tx = new Transaction();

        const [coin] = tx.moveCall({
            target: `${packageId}::game::admin_claim_game_fees`,
            arguments: [
                tx.object(cap.house_id),
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
                        <TableHead>House ID</TableHead>
                        <TableHead>Collected Fees</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {props.houseAdminCapData.map((cap) => {
                            const house = houseData[cap.house_id];
                            if (!house) {
                                return null;
                            }
                            return (
                                <TableRow key={house.id}>
                                    <TableCell>
                                        {house.id}
                                    </TableCell>
                                    <TableCell>
                                        <div className={"inline-flex gap-2 items-center"}>
                                            <span
                                                className={house.vault.collected_house_fees.value > 0 ? "text-green-600" : ""}
                                            >{formatSuiAmount(house.vault.collected_house_fees.value)}</span>
                                            {house.vault.collected_house_fees.value > 0 &&
                                                <Button disabled={loadingClaim} variant={"outline"} onClick={() => {
                                                    handleClaim(cap)
                                                }}>
                                                    <span>Claim</span>
                                                </Button>
                                            }
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/house/${house.id}`}>
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