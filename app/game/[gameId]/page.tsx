import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {ActivityIcon, CheckIcon, CoinsIcon, LandmarkIcon, XIcon} from "lucide-react";
import {ArrowTopRightOnSquareIcon, ListBulletIcon, TagIcon} from "@heroicons/react/24/outline";
import {cn, formatBps, formatSuiAmount} from "@/lib/utils";
import React from "react";
import Link from "next/link";
import { fetchGame} from "@/api/queries/games";
import { notFound } from 'next/navigation';
import { GameType} from "@/api/models/models";
import ManagePosition from "@/components/game/manage-position";

export default async function GameDetails({params}: { params: { gameId: string } }) {
    const { gameId } = await params;
    const game = await fetchGame(gameId);
    if (!game) {
        notFound();
    }
    
    if (game.game_type != GameType.CoinFlip) {
        notFound();
    }
    
    return (
        <div className={"flex-row flex w-full h-full p-4 gap-8"}>
            {/*Column 1*/}
            <div className={"min-w-60 w-1/3"}>
                <Card className={"mb-4 w-full h-auto aspect-square"}>
                    
                
                <img
                    src={game.image_url}
                    alt="Coin flip banner"
                    width={300}
                    height={300}
                    className={"object-cover w-full h-full rounded-xl"}
                />
                </Card>
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
                            <p className={"font-semibold mb-4"}>
                                Type: Coin Flip
                            </p>
                            <div className={"grid grid-cols-2 gap-2"}>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Max stake
                                    </p>
                                    <p className={" "}>
                                        {formatSuiAmount(game.coin_flip.max_stake)}
                                    </p>
                                </div>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Target balance
                                    </p>
                                    <p className={" "}>
                                        {formatSuiAmount(game.target_balance)}
                                    </p>
                                </div>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Payout Factor
                                    </p>
                                    <p className={" "}>
                                        {formatBps(game.coin_flip.payout_factor_bps)}
                                    </p>
                                </div>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        House bias
                                    </p>
                                    <p className={" "}>
                                        {formatBps(game.coin_flip.house_edge_bps)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
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
                                        Active
                                    </p>
                                    <p className={" "}>
                                        {game.vault.active ? 
                                            <CheckIcon className={"w-6 h-6 text-green-500"} strokeWidth={2}/>
                                            : 
                                            <XIcon className={"w-6 h-6 text-red-500"} strokeWidth={2}/>
                                        }
                                    </p>
                                </div>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Last updated epoch
                                    </p>
                                    <p className={" "}>
                                        {game.vault.epoch}
                                    </p>
                                </div>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Reserve
                                    </p>
                                    <p className={" "}>
                                        {formatSuiAmount(game.vault.reserve_balance.value)}
                                    </p>
                                </div>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Play balance
                                    </p>
                                    <p className={" "}>
                                        {formatSuiAmount(game.vault.play_balance.value)}
                                    </p>
                                </div>

                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            {/*Column 2*/}
            <div className={"min-w-60 w-2/3"}>
                {/*Owner*/}
                <div className={"flex flex-row justify-between items-center mb-6"}>
                    <div className={"flex flex-col gap-2"}>
                        <h1 className="text-3xl font-semibold">{game.name}</h1>
                        <div className={"inline-flex gap-2"}>
                            <TagIcon className={"size-6"}/>
                            <span>{game.id}</span>
                        </div>
                    </div>

                    <div>
                    <Link
                            href={game.project_url}
                            className={cn("h-10 flex flex-row align-top pl-4 pr-2 rounded-lg items-center",
                                "bg-primary text-primary-foreground")}>
                            Visit Game
                            <ArrowTopRightOnSquareIcon
                                className="size-10 p-2 border-transparent rounded-lg"/>
                        </Link>
                    </div>
                </div>

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
                                        {formatSuiAmount(game.state.history.all_time_bet_amount || 0)}
                                    </p>
                                </div>
                                {/*Total win amount*/}
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Win amount
                                    </p>
                                    <p className={" "}>
                                        {formatSuiAmount(game.state.history.all_time_win_amount || 0)}
                                    </p>
                                </div>
                                {/*Estimated RTP*/}
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Historical RTP
                                    </p>
                                    <p className={" "}>
                                        {game.state.history.all_time_win_amount > 0 && game.state.history.all_time_bet_amount > 0
                                            ?
                                            (game.state.history.all_time_win_amount / game.state.history.all_time_bet_amount * 100).toFixed(2) + " %"
                                            :
                                            "N/A"}
                                    </p>
                                </div>
                                {/*P&L*/}
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Distributed profits / losses
                                    </p>
                                    <p className={game.state.history.all_time_profits > game.state.history.all_time_losses ? 
                                    "text-green-500" :
                                    "text-red-500"}>
                                        {formatSuiAmount(game.state.history.all_time_profits - game.state.history.all_time_losses)}
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
                                Collected Fees
                            </div>
                        </CardHeader>
                        <CardContent className={"p-6"}>
                            <div className={"grid grid-cols-2 gap-2"}>
                                {/*Owner fees*/}
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Available owner fee
                                    </p>
                                    <p className={" "}>
                                        {formatSuiAmount(game.vault.collected_owner_fees.value || 0)}
                                    </p>
                                </div>
                                {/*Protocol fees*/}
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Available protocol fee
                                    </p>
                                    <p className={""}>
                                        Coming soon
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <ManagePosition game={game}/>                    
            </div>
        </div>
    )
}