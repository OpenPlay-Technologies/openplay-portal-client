"use client"
import Link from "next/link"
import {ChevronLeft, ChevronRight, ExternalLink, HelpCircle} from "lucide-react"
import {ScrollArea} from "@/components/ui/scroll-area"
import {formatBps, formatSuiAmount} from "@/lib/utils";
import React, {useState} from "react";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible"
import {GameModel} from "@/api/models/openplay-coin-flip";
import {gameMetaData} from "@/lib/game-metadata";
import {generateObjectLink, generateTxLink} from "@/lib/explorer-link-formatter";
import {CoinFlipInteraction} from "@/api/queries/coin-flip";
import {useRecentCoinFlipInteracts} from "@/components/providers/recent-coinflip-interacts-provider";
import {faqSections} from "@/lib/faq";
import {formatDistanceToNow} from "date-fns";

const BetItem = ({interact}: { interact: CoinFlipInteraction }) => {

    const profit = (interact.interactModel?.context?.win ?? 0) - (interact.interactModel?.context?.stake ?? 0);
    const user = interact.interactModel?.balance_manager_id.slice(0, 5) + ".." + interact.interactModel?.balance_manager_id.slice(-5);
    const dateText = formatDistanceToNow((interact.timestamp as Date), {addSuffix: true});

    return (
        <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
            <div className="flex flex-col">
                <span className="text-sm font-medium">{user}</span>
                <span className={"text-xs text-muted-foreground first-letter:capitalize"}>{dateText}</span>
                <Link
                    href={generateTxLink(interact.digest ?? "")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs inline-flex items-center text-muted-foreground"
                >
                    View in Explorer
                    <ExternalLink className="w-3 h-3 ml-1"/>
                </Link>
            </div>

            <span className={`text-sm ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
            {profit >= 0 ? "+" : "-"}{formatSuiAmount(Math.abs(profit))}
        </span>
        </div>
    );
}

interface SidePanelProps {
    data: GameModel;
}

export default function GameSidePanel(props: SidePanelProps) {
    const [isFaqOpen, setIsFaqOpen] = useState(false);
    const {globalRecentInteracts, newGlobalRecentInteractCounter} = useRecentCoinFlipInteracts();

    const metaData = gameMetaData;

    return (
        <div className="relative w-64 h-full bg-background flex flex-col rounded-r-md">
            {/* Main content: Only visible when FAQ is closed */}
            <div
                className={`flex flex-col h-full transition-opacity duration-300 ${isFaqOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}>

                {/* Game info (Fixed at the top) */}
                <div className="p-4 flex flex-col gap-2 flex-shrink-0">
                    <h2 className="text-lg font-semibold">{metaData.title}</h2>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <p className="text-muted-foreground text-sm">ID</p>
                            <p className="text-sm">{metaData.id.slice(0, 4)}..{metaData.id.slice(-4)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">Payout</p>
                            <p className="text-sm">{formatBps(Number(props.data.payout_factor_bps))}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">Death rate</p>
                            <p className="text-sm">{formatBps(Number(props.data.house_edge_bps))}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">All time heads</p>
                            <p className="text-sm">{Number(props.data.state.fields.number_of_heads)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">All time tails</p>
                            <p className="text-sm">{Number(props.data.state.fields.number_of_tails)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">All time deaths</p>
                            <p className="text-sm">{Number(props.data.state.fields.number_of_house_bias)}</p>
                        </div>
                    </div>

                    <Link
                        href={generateObjectLink(metaData.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 text-sm inline-flex items-center"
                    >
                        View in Explorer
                        <ExternalLink className="w-3 h-3 ml-1"/>
                    </Link>
                </div>

                {/* Tabs Section (Fills the remaining space) */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/*<Tabs defaultValue="all-bets" className="flex flex-col h-full">*/}
                        {/*<TabsList className="grid w-full grid-cols-2 flex-shrink-0">*/}
                        {/*    <TabsTrigger value="all-bets">All Bets</TabsTrigger>*/}
                        {/*    <TabsTrigger value="my-bets">My Bets</TabsTrigger>*/}
                        {/*</TabsList>*/}

                        {/*<TabsContent value="all-bets" className="flex-1 overflow-hidden">*/}
                        {/*    <ScrollArea className="h-full overflow-auto">*/}
                        {/*        <div className="px-4">*/}
                        {/*            {globalRecentInteracts.map((interact, index) => (*/}
                        {/*                <div*/}
                        {/*                    key={interact.digest}*/}
                        {/*                    className={`*/}
                        {/*                        transition-colors duration-1000*/}
                        {/*                        ${index < newGlobalRecentInteractCounter ? 'animate-highlight' : ''}*/}
                        {/*                      `}*/}
                        {/*                >*/}
                        {/*                    <BetItem interact={interact}/>*/}
                        {/*                </div>*/}
                        {/*            ))}*/}
                        {/*        </div>*/}
                        {/*    </ScrollArea>*/}
                        {/*</TabsContent>*/}


                    {/*    <TabsContent value="my-bets" className="flex-1 overflow-hidden">*/}
                    {/*        <ScrollArea className="h-full overflow-auto">*/}
                    {/*            <div className="px-4">*/}
                    {/*                <p className="text-sm text-gray-500">Your recent bets will appear here.</p>*/}
                    {/*            </div>*/}
                    {/*        </ScrollArea>*/}
                    {/*    </TabsContent>*/}
                    {/*</Tabs>*/}

                    <h2 className="text-lg font-semibold px-4">Recent Bets</h2>
                    <ScrollArea className="h-full overflow-auto">
                        <div className="px-4">
                            {globalRecentInteracts.map((interact, index) => (
                                <div
                                    key={interact.digest}
                                    className={`
                                                transition-colors duration-1000
                                                ${index < newGlobalRecentInteractCounter ? 'animate-highlight' : ''}
                                              `}
                                >
                                    <BetItem interact={interact}/>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                {/* FAQ trigger (Fixed at the bottom) */}
                <button
                    onClick={() => setIsFaqOpen(true)}
                    className="border-t w-full p-4 flex items-center justify-between text-sm font-medium flex-shrink-0"
                >
                    <div className="flex items-center">
                        <HelpCircle className="w-4 h-4 mr-2"/>
                        How does this work?
                    </div>
                    <ChevronRight className="w-4 h-4"/>
                </button>
            </div>


            {/* FAQ overlay (Covers everything when open) */}
            {isFaqOpen && (
                <div className="absolute inset-0 bg-background z-10 flex flex-col">
                    <div className="p-4 border-b inline-flex gap-2">
                        <button onClick={() => setIsFaqOpen(false)}>
                            <ChevronLeft className="size-6"/>
                        </button>
                        <h2 className="text-lg font-semibold">FAQ</h2>
                    </div>
                    <ScrollArea className="flex-1 overflow-auto">
                        <div className="p-4 space-y-6">
                            {faqSections.map((section) => (
                                <div key={section.title}>
                                    <h3 className="text-md font-semibold mb-2">{section.title}</h3>
                                    <div className="space-y-2">
                                        {section.items.map((item, index) => (
                                            <Collapsible key={index} className="border rounded">
                                                <CollapsibleTrigger
                                                    className="w-full p-2 text-left flex items-center justify-between">
                                                    <span>{item.question}</span>
                                                    <ChevronRight className="w-4 h-4 transition-transform"/>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent className="p-2 text-sm">
                                                    {item.answer}
                                                </CollapsibleContent>
                                            </Collapsible>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    )
}


