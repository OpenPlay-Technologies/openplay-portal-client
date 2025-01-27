"use client"
import {CardContent, CardDescription, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import { ArrowPathIcon} from "@heroicons/react/24/outline";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import Link from "next/link";
import {useCallback, useEffect, useState} from "react";
import {getCurrentEpoch} from "@/api/queries/epoch";
import {fetchHousesByIds} from "@/api/queries/house";
import {useCurrentAccount, useSignAndExecuteTransaction, useSuiClient} from "@mysten/dapp-kit";
import {Transaction} from "@mysten/sui/transactions";
import {formatSuiAmount} from "@/lib/utils";
import {useToast} from "@/hooks/use-toast";
import {HouseModel, ParticipationModel} from "@/api/models/openplay-core";

interface ParticipationRewardsProps {
    participationData: ParticipationModel[];
    updateParticipationData: () => void;
}

export default function ParticipationRewards(props: ParticipationRewardsProps) {
    const { toast } = useToast();
    const packageId = process.env.NEXT_PUBLIC_CORE_PACKAGE_ID;
    const account = useCurrentAccount();
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
    const [houseData, setHouseData] = useState<Record<string, HouseModel>>({});
    const [epoch, setEpoch] = useState<number | null>(null);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [loadingClaim, setLoadingClaim] = useState(false);

    // Fetch the current epoch
    useEffect(() => {
        const fetchEpoch = async () => {
            // Fetch the current epoch
            const epoch = await getCurrentEpoch();
            setEpoch(epoch);
        }
        fetchEpoch();
    }, []);

    // Fetch the game data for the participations
    const updateHouseData = useCallback(async () => {
        if (!account?.address) {
            return;
        }
        const houseData = await fetchHousesByIds(props.participationData.map(participation => participation.house_id));
        setHouseData(houseData);
    }, [props.participationData]);
    useEffect(() => {
        updateHouseData();
    }, [updateHouseData]);

    // Update the participations
    async function handleUpdateAll() {

        if (!account) {
            console.error('Account not found');
            return;
        }

        const tx = new Transaction();

        props.participationData.map(p => {
            tx.moveCall({
                target: `${packageId}::house::update_participation`,
                arguments: [
                    tx.object(p.house_id),
                    tx.object(p.id),
                ],
            });
        })

        signAndExecuteTransaction({
                transaction: tx
            },
            {
                onSuccess: (result) => {
                    console.log('Transaction executed', result);
                    setLoadingUpdate(true);
                    suiClient.waitForTransaction({
                        digest: result.digest
                    }).then(() => {
                        toast({
                            title: 'Participations updated',
                            description: 'Your participations have been updated successfully'
                        });
                        setLoadingUpdate(false);
                        props.updateParticipationData();
                    }).catch((error) => {
                        toast({
                            variant:"destructive",
                            title: 'Transaction failed',
                            description: error.message,
                        })
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

    // Claim
    async function handleClaim(participation: ParticipationModel) {
        if (!account) {
            console.error('Account not found');
            return;
        }

        const tx = new Transaction();
        tx.moveCall({
            target: `${packageId}::house::update_participation`,
            arguments: [
                tx.object(participation.house_id),
                tx.object(participation.id),
            ],
        });
        const [coin] = tx.moveCall({
            target: `${packageId}::house::claim_all`,
            arguments: [
                tx.object(participation.house_id),
                tx.object(participation.id),
            ],
        });
        tx.transferObjects([coin], account.address);
        
        if (participation.active_stake == BigInt(0) && participation.inactive_stake == BigInt(0)) {
            tx.moveCall({
                target: `${packageId}::participation::destroy_empty`,
                arguments: [
                    tx.object(participation.id),
                ],
            });
        }
        
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
                        props.updateParticipationData();
                    }).catch((error) => {
                        toast({
                            variant:"destructive",
                            title: 'Transaction failed',
                            description: error.message,
                        })
                    }).finally(() => {
                        setLoadingClaim(false);
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
            <div className={"flex flex-col gap-2 py-2"}>
                <CardTitle>
                    Updating participations
                </CardTitle>
                <CardDescription>
                    Your participations need to be updated every epoch to see the latest details. By
                    updating your participation,
                    the profits or losses from each epoch are added to your active stake.
                    Participations are automatically updated when you take an action such as staking,
                    unstaking, or claiming.
                </CardDescription>
                <CardDescription className={"text-foreground"}>
                    Current epoch: {epoch}
                </CardDescription>
                <Button className={"w-fit"} variant={"outline"} onClick={handleUpdateAll} disabled={loadingUpdate}>
                    <ArrowPathIcon className={"w-6 h-6"} strokeWidth={2}/>
                    Update All
                </Button>
            </div>
            <Table className={"mb-4"}>
                <TableHeader>
                    <TableRow>
                        <TableHead>House</TableHead>
                        <TableHead>Last updated epoch</TableHead>
                        <TableHead>Active Stake</TableHead>
                        <TableHead>Inactive stake</TableHead>
                        <TableHead>Claimable Balance</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {props.participationData.map((participation) => {
                        const house = houseData[participation.house_id];
                        if (!house) {
                            return null;
                        }
                        return (
                            <TableRow key={participation.id}>
                                <TableCell>
                                    {house.id}
                                </TableCell>
                                <TableCell>
                                    {participation.last_updated_epoch ?? 'N/A'}
                                </TableCell>
                                <TableCell>
                                    <div className={"inline-flex gap-2 items-center align-bottom"}>
                                        {formatSuiAmount(Number(participation.active_stake))}
                                        {participation.unstake_requested &&
                                            <span className={"text-destructive text-sm"}>(Unstaking)</span>}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {formatSuiAmount(Number(participation.inactive_stake))}
                                </TableCell>
                                <TableCell>
                                    <div className={"inline-flex gap-2 items-center"}>
                                        <span
                                            className={participation.claimable_balance > -0 ? "text-green-700" : ""}
                                        >{formatSuiAmount(Number(participation.claimable_balance))}</span>
                                        {participation.claimable_balance > -0 &&
                                            <Button variant={"outline"} onClick={() => {
                                                handleClaim(participation)
                                            }} disabled={loadingClaim}>
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
                    })}
                </TableBody>
            </Table>
            {/*<div className={"flex gap-4"}>*/}
            {/*    <Button>*/}
            {/*        Claim all*/}
            {/*    </Button>*/}
            {/*    <Button variant={"outline"}>*/}
            {/*        Unstake all*/}
            {/*    </Button>*/}
            {/*</div>*/}
        </CardContent>
    );
}