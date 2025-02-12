"use client"
import {CardContent, CardDescription, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import { ArrowPathIcon} from "@heroicons/react/24/outline";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import Link from "next/link";
import {useCallback, useEffect, useState} from "react";
import {getCurrentEpoch} from "@/api/queries/epoch";
import {fetchHousesByIds} from "@/api/queries/house";
import {useCurrentAccount, useSignTransaction} from "@mysten/dapp-kit";
import {Transaction} from "@mysten/sui/transactions";
import {formatAddress, formatSuiAmount} from "@/lib/utils";
import {useToast} from "@/hooks/use-toast";
import {HouseModel, ParticipationModel} from "@/api/models/openplay-core";
import ClientCopyIcon from "@/components/ui/client-copy-icon";
import {buildClaimTransaction, buildUpdateParticipationsTransaction} from "@/app/rewards/actions";
import {executeAndWaitForTransactionBlock} from "@/app/actions";

interface ParticipationRewardsProps {
    participationData: ParticipationModel[];
    updateParticipationData: () => void;
}

export default function ParticipationRewards(props: ParticipationRewardsProps) {
    const { toast } = useToast();
    const account = useCurrentAccount();
    const [houseData, setHouseData] = useState<HouseModel[]>([]);
    const [epoch, setEpoch] = useState<number | null>(null);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [loadingClaim, setLoadingClaim] = useState(false);
    const {mutate: signTransaction} = useSignTransaction();
    

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
        const houseIds = props.participationData.map(participation => participation.house_id);
        const houseData = await fetchHousesByIds([...new Set(houseIds)]);
        setHouseData(houseData);
    }, [account?.address, props.participationData]);
    useEffect(() => {
        updateHouseData();
    }, [updateHouseData]);

    // Update the participations
    async function handleUpdateAll() {

        if (!account) {
            console.error('Account not found');
            return;
        }
        
        const bytes = await buildUpdateParticipationsTransaction(account.address, props.participationData.map(p => {
            return {
                houseId: p.house_id,
                participationId: p.id.id
            };
        }));
        const tx = Transaction.from(bytes);

        signTransaction({
                transaction: tx
            },
            {
                onSuccess: (result) => {
                  // console.log('Transaction executed', result);
                    setLoadingUpdate(true);
                    executeAndWaitForTransactionBlock(result.bytes, result.signature).then(() => {
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

        const bytes = await buildClaimTransaction(account.address, participation.house_id, participation.id.id, participation.stake == BigInt(0) && participation.pending_stake == BigInt(0));
        const tx = Transaction.from(bytes);
        
        signTransaction({
                transaction: tx
            },
            {
                onSuccess: (result) => {
                  // console.log('Transaction executed', result);
                    setLoadingClaim(true);
                    executeAndWaitForTransactionBlock(result.bytes, result.signature).then(() => {
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
                        <TableHead>Stake</TableHead>
                        <TableHead>Pending Stake</TableHead>
                        <TableHead>Claimable Balance</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {props.participationData.map((participation) => {
                        const house = houseData.find(h => h.id.id === participation.house_id);
                        if (!house) {
                            return null;
                        }
                        return (
                            <TableRow key={participation.id.id}>
                                <TableCell>
                                    <div className={"inline-flex items-center gap-2"}>
                                        {formatAddress(house.id.id)}
                                        <ClientCopyIcon value={house.id.id} className={"w-4 h-4"}/>
                                    </div>
                                    
                                </TableCell>
                                <TableCell>
                                    {participation.last_updated_epoch ?? 'N/A'}
                                </TableCell>
                                <TableCell>
                                    <div className={"inline-flex gap-2 items-center align-bottom"}>
                                        {formatSuiAmount(Number(participation.stake))}
                                        {participation.unstake_requested &&
                                            <span className={"text-destructive text-sm"}>(Unstaking)</span>}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {formatSuiAmount(Number(participation.pending_stake))}
                                </TableCell>
                                <TableCell>
                                    <div className={"inline-flex gap-2 items-center"}>
                                        <span
                                            className={participation.claimable_balance > -0 ? "text-green-600" : ""}
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
                                    <Link href={`/house/${house.id.id}`}>
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