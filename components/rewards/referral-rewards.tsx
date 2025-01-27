"use client"
import {CardContent} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import Link from "next/link";
import {useCallback, useEffect, useState} from "react";
import {getCurrentEpoch} from "@/api/queries/epoch";
import {fetchHousesByIds} from "@/api/queries/house";
import {useCurrentAccount, useSignAndExecuteTransaction, useSuiClient} from "@mysten/dapp-kit";
import {formatBps} from "@/lib/utils";
import {useToast} from "@/hooks/use-toast";
import {HouseModel, ReferralModel} from "@/api/models/openplay-core";

interface ParticipationRewardsProps {
    referralData: ReferralModel[];
    updateReferralData: () => void;
}

export default function ReferralRewards(props: ParticipationRewardsProps) {
    const account = useCurrentAccount();
    const suiClient = useSuiClient();
    const [houseData, setHouseData] = useState<Record<string, HouseModel>>({});

    // Fetch the house data for the referrals
    const updateHouseData = useCallback(async () => {
        if (!account?.address) {
            return;
        }
        const houseData = await fetchHousesByIds(props.referralData.map(referral => referral.house_id));
        setHouseData(houseData);
    }, [props.referralData]);
    useEffect(() => {
        updateHouseData();
    }, [updateHouseData]);

    return (
        <CardContent className={"px-0"}>
            <Table className={"mb-4"}>
                <TableHeader>
                    <TableRow>
                        <TableHead>House ID</TableHead>
                        <TableHead>Referral fee</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {props.referralData.map((referral) => {
                        const house = houseData[referral.house_id];
                        if (!house) {
                            return null;
                        }
                        return (
                            <TableRow key={referral.id}>
                                <TableCell>
                                    {referral.house_id}
                                </TableCell>
                                <TableCell>
                                    {formatBps(Number(house.referral_fee_bps))}
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
        </CardContent>
    );
}