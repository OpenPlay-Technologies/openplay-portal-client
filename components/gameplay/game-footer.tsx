import {GameRoundTable} from "@/components/recent-wins/game-round-table";
import {getRecentCoinFlipInteractions} from "@/api/queries/coin-flip";
import {GameRoundModel} from "@/components/recent-wins/gameround-table-columns";
import {InteractedWithGameModel} from "@/api/models/openplay-coin-flip";


export default async function GameFooter() {
    const coinFlipPackageId = process.env.NEXT_PUBLIC_COIN_FLIP_PACKAGE_ID;
    
    const recentInteractions = await getRecentCoinFlipInteractions();

    const rounds: GameRoundModel[] = recentInteractions?.map((interaction) => {
        return {
            txId: interaction.digest ?? "",
            gameId: "", // Ensure it exists or assign a default
            betAmount: Number(interaction.interactModel?.context?.stake) || 0, // Ensure it's a number
            winAmount: Number(interaction.interactModel?.context?.win) || 0, // Ensure it's a number
            sender: interaction.sender ?? "", // Use sender as per GameRoundModel
            timestamp: interaction.timestamp ?? new Date(), // Ensure it's a string
        };
    }) || [];
    
    rounds.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return (
        <div className={"flex flex-row items-center justify-center p-20"}>
            <GameRoundTable wins={rounds}/>
        </div>
    )
}