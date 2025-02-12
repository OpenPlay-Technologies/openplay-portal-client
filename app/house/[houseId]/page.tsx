import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {ActivityIcon, CheckIcon, CoinsIcon, GaugeIcon, LandmarkIcon, XIcon} from "lucide-react";
import {ListBulletIcon} from "@heroicons/react/24/outline";
import {formatBps, formatSuiAmount} from "@/lib/utils";
import React from "react";
import {fetchHouse} from "@/api/queries/house";
import {notFound} from 'next/navigation';
import ClientCopyIcon from "@/components/ui/client-copy-icon";
import ManageTxCaps from "@/components/house/manage-tx-caps";
import ManagePosition from "@/components/house/manage-position";

type Params = Promise<{ houseId: string }>

export default async function GameDetails({params}: { params: Params }) {
    const {houseId} = await params;
    const house = await fetchHouse(houseId);
    if (!house) {
        notFound();
    }

    return (
        <div className={"flex-row flex w-full h-full p-4 gap-8"}>
            {/*Column 1*/}
            <div className={"min-w-60 w-1/3"}>
                {/*Details Card*/}
                <div className="w-full pb-4">
                    <Card>
                        <CardHeader className={"border-b"}>
                            <div className={"font-semibold inline-flex items-center"}>
                                <ListBulletIcon className={"w-6 h-6 mr-2"} strokeWidth={2}/>
                                Details
                            </div>
                        </CardHeader>
                        <CardContent className={"p-6"}>
                            <div className={"grid grid-cols-2 gap-2"}>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        ID
                                    </p>
                                    <div className={"inline-flex align-center gap-2"}>
                                        <p className={""}>
                                            {house.id.id.slice(0, 5) + "..." + house.id.id.slice(-5)}
                                        </p>
                                        <div className={"flex items-center"}>
                                            <ClientCopyIcon className={"w-4 h-4"} value={house.id.id}/>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Active
                                    </p>
                                    <p className={" "}>
                                        {house.state.fields.is_active ?
                                            <CheckIcon className={"w-6 h-6 text-green-600"} strokeWidth={2}/>
                                            :
                                            <XIcon className={"w-6 h-6 text-red-600"} strokeWidth={2}/>
                                        }
                                    </p>
                                </div>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Private/Public
                                    </p>
                                    <p className={" "}>
                                        {house.private ?
                                            "Private"
                                            :
                                            "Public"
                                        }
                                    </p>
                                </div>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Target balance
                                    </p>
                                    <p className={" "}>
                                        {formatSuiAmount(Number(house.target_balance))}
                                    </p>
                                </div>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        House fee
                                    </p>
                                    <p className={" "}>
                                        {formatBps(Number(house.house_fee_bps))}
                                    </p>
                                </div>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Referral fee
                                    </p>
                                    <p className={" "}>
                                        {house.referral_fee_bps > 0 ? formatBps(Number(house.referral_fee_bps)) : "N/A"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                {/*Current Cycle Card*/}
                <div className="w-full pb-4">
                    <Card>
                        <CardHeader className={"border-b"}>
                            <div className={"font-semibold inline-flex items-center"}>
                                <GaugeIcon className={"w-6 h-6 mr-2"} strokeWidth={2}/>
                                State
                            </div>
                        </CardHeader>
                        <CardContent className={"p-6"}>
                            <div className={"grid grid-cols-2 gap-2"}>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Active
                                    </p>
                                    <p className={" "}>
                                        {house.state.fields.is_active ?
                                            <CheckIcon className={"w-6 h-6 text-green-600"} strokeWidth={2}/>
                                            :
                                            <XIcon className={"w-6 h-6 text-red-600"} strokeWidth={2}/>
                                        }
                                    </p>
                                </div>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Epoch
                                    </p>
                                    <p className={" "}>
                                        {house.state.fields.epoch}
                                    </p>
                                </div>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Active stake
                                    </p>
                                    <p className={" "}>
                                        {formatSuiAmount(Number(house.state.fields.active_stake))}
                                    </p>
                                </div>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Inactive stake
                                    </p>
                                    <p className={" "}>
                                        {formatSuiAmount(Number(house.state.fields.inactive_stake))}
                                    </p>
                                </div>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Pending unstake
                                    </p>
                                    <p className={" "}>
                                        {formatSuiAmount(Number(house.state.fields.pending_unstake))}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <ManageTxCaps house={house}/>
                {/*<ManageReferral house={house}/>*/}
                {/*Vault status*/}
                <div className="w-full pb-4">
                    <Card>
                        <CardHeader className={"border-b"}>
                            <div className={"font-semibold inline-flex items-center"}>
                            <LandmarkIcon className={"w-6 h-6 mr-2"} strokeWidth={2}/>
                                Vault Status
                            </div>
                        </CardHeader>
                        <CardContent className={"p-6"}>
                        <div className={"grid grid-cols-2 gap-2"}>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Last updated epoch
                                    </p>
                                    <p className={" "}>
                                        {house.vault.fields.epoch}
                                    </p>
                                </div>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Reserve
                                    </p>
                                    <p className={" "}>
                                        {formatSuiAmount(house.vault.fields.reserve_balance)}
                                    </p>
                                </div>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Play balance
                                    </p>
                                    <p className={" "}>
                                        {formatSuiAmount(house.vault.fields.play_balance)}
                                    </p>
                                </div>

                            </div>
                        </CardContent>
                    </Card>
                </div>
                {/*Collected Fees card*/}
                <div className="w-full pb-4">
                    <Card>
                        <CardHeader className={"border-b"}>
                            <div className={"font-semibold inline-flex items-center"}>
                                <CoinsIcon className={"w-6 h-6 mr-2"}/>
                                Available Fees
                            </div>
                        </CardHeader>
                        <CardContent className={"p-6"}>
                            <div className={"grid grid-cols-2 gap-2"}>
                                {/*Owner fees*/}
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        House fee
                                    </p>
                                    <p className={" "}>
                                        {formatSuiAmount(house.vault.fields.collected_house_fees || 0)}
                                    </p>
                                </div>
                                {/*Protocol fees*/}
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Referral fee
                                    </p>
                                    <p className={" "}>
                                        TODO
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            {/*Column 2*/}
            <div className={"min-w-60 w-2/3"}>
                {/*/!*Owner*!/*/}
                {/*<div className={"flex flex-row justify-between items-center mb-6"}>*/}
                {/*    <div className={"flex flex-col gap-2"}>*/}
                {/*        /!*<h1 className="text-3xl font-semibold">{house.name}</h1>*!/*/}
                {/*        <div className={"inline-flex gap-2"}>*/}
                {/*            <TagIcon className={"size-6"}/>*/}
                {/*            <span>{house.id.id}</span>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                
                {/*    <div>*/}
                {/*        <Link*/}
                {/*                href={game.project_url}*/}
                {/*                className={cn("h-10 flex flex-row align-top pl-4 pr-2 rounded-lg items-center",*/}
                {/*                    "bg-primary text-primary-foreground")}>*/}
                {/*                Visit Game*/}
                {/*                <ArrowTopRightOnSquareIcon*/}
                {/*                    className="size-10 p-2 border-transparent rounded-lg"/>*/}
                {/*            </Link>*/}
                {/*    </div>*/}
                {/*</div>*/}

                {/*Activity Card*/}
                <div className="w-full pb-4">
                    <Card>
                        <CardHeader className={"border-b"}>
                            <div className={"font-semibold inline-flex items-center"}>
                                <ActivityIcon className={"w-6 h-6 mr-2"}/>
                                Lifetime statistics
                            </div>
                        </CardHeader>
                        <CardContent className={"p-6"}>
                            <div className={"grid grid-cols-2 gap-2"}>
                                {/*Total bet amount*/}
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Bet amount
                                    </p>
                                    <p className={" "}>
                                        {formatSuiAmount(Number(house.state.fields.all_time_bet_amount) || 0)}
                                    </p>
                                </div>
                                {/*Total win amount*/}
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Win amount
                                    </p>
                                    <p className={" "}>
                                        {formatSuiAmount(Number(house.state.fields.all_time_win_amount) || 0)}
                                    </p>
                                </div>
                                {/*Estimated RTP*/}
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Historical RTP
                                    </p>
                                    <p className={" "}>
                                        {house.state.fields.all_time_win_amount > 0 && house.state.fields.all_time_bet_amount > 0
                                            ?
                                            (Number(house.state.fields.all_time_win_amount / house.state.fields.all_time_bet_amount) * 100).toFixed(2) + " %"
                                            :
                                            "N/A"}
                                    </p>
                                </div>
                                {/*P&L*/}
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Distributed profits / losses
                                    </p>
                                    <p className={
                                        (Number(house.state.fields.all_time_profits) >= Number(house.state.fields.all_time_losses))
                                                ? "text-green-600" :
                                            "text-red-600"}>
                                        {formatSuiAmount(Number(house.state.fields.all_time_profits - house.state.fields.all_time_losses))}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <ManagePosition house={house}/>
            </div>
        </div>
    )
}