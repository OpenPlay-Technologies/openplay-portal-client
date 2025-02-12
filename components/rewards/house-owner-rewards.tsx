import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {CardContent} from "@/components/ui/card";
import {useCallback, useEffect, useState} from "react";
import {fetchHousesByIds} from "@/api/queries/house";
import {useCurrentAccount, useSignTransaction} from "@mysten/dapp-kit";
import {formatAddress, formatSuiAmount} from "@/lib/utils";
import Link from "next/link";
import {Transaction} from "@mysten/sui/transactions";
import {useToast} from "@/hooks/use-toast";
import {useBalance} from "@/components/providers/balance-provider";
import {HouseAdminCapModel, HouseModel} from "@/api/models/openplay-core";
import ClientCopyIcon from "@/components/ui/client-copy-icon";
import {buildClaimHouseRewardsTransaction} from "@/app/rewards/actions";
import {executeAndWaitForTransactionBlock} from "@/app/actions";

interface GameOwnerRewardsProps {
    houseAdminCapData: HouseAdminCapModel[];
    updateGameCapData: () => void;
}

export default function HouseOwnerRewards(props: GameOwnerRewardsProps) {
    const [houseData, setHouseData] = useState<HouseModel[]>([]);
    const account = useCurrentAccount();
    const [loadingClaim, setLoadingClaim] = useState(false);
    const { toast } = useToast();
    const {updateBalance} = useBalance();
    const {mutate: signTransaction} = useSignTransaction();

    // Fetch the game data for the caps
    const updateHouseData = useCallback(async () => {
        if (!account?.address) {
            return;
        }
        const houseData = await fetchHousesByIds(props.houseAdminCapData.map(cap => cap.house_id));
        setHouseData(houseData);
    }, [account?.address, props.houseAdminCapData]);
    useEffect(() => {
        updateHouseData();
    }, [updateHouseData]);

    // Claim
    async function handleClaim(cap: HouseAdminCapModel) {
        if (!account) {
            console.error('Account not found');
            return;
        }

        const bytes = await buildClaimHouseRewardsTransaction(account.address, cap.house_id, cap.id.id);
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
                            const house = houseData.find(house => house.id.id === cap.house_id);
                            if (!house) {
                                return null;
                            }
                            return (
                                <TableRow key={house.id.id}>
                                    <TableCell>
                                        <div className={"inline-flex items-center gap-2"}>
                                            {formatAddress(house.id.id)}
                                            <ClientCopyIcon value={house.id.id} className={"w-4 h-4"}/>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className={"inline-flex gap-2 items-center"}>
                                            <span
                                                className={house.vault.fields.collected_house_fees > 0 ? "text-green-600" : ""}
                                            >{formatSuiAmount(house.vault.fields.collected_house_fees)}</span>
                                            {house.vault.fields.collected_house_fees > 0 &&
                                                <Button disabled={loadingClaim} variant={"outline"} onClick={() => {
                                                    handleClaim(cap)
                                                }}>
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
                        }
                    )}
                </TableBody>
            </Table>
        </CardContent>
    );
}