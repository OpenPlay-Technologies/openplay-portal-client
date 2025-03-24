import {fetchGame} from "@/api/queries/games";
import { notFound } from 'next/navigation';
import GameLauncher from "@/components/gameplay/game-launcher";
import {gameMetaData} from "@/lib/game-metadata";
// import GameSidePanel from "@/components/gameplay/game-side-panel";
// import {RecentCoinflipInteractsProvider} from "@/components/providers/recent-coinflip-interacts-provider";

// export default async function LaunchGame({
//                                              searchParams,
//                                          }: {
//     searchParams: Promise<{ [key: string]: string | string[] | undefined }>
// }) {

export default async function PiggyBankGame() {
    const game = await fetchGame(gameMetaData.id);
    if (!game) {
        notFound();
    }

    return (
        // <RecentCoinflipInteractsProvider coinFlipId={game.id.id}>
            <div className="w-full h-[calc(100vh-72px)] bg-[url(/coin-flip-background.png)]">
                <div className="flex flex-row md:p-20 h-full w-full overflow-clip flex-wrap">
                    {/* Game Launcher Container: Takes up remaining space */}
                    <div className="flex-1 flex justify-center items-center h-full w-full bg-muted rounded-l-md min-w-72">
                        <GameLauncher data={game} house_id={gameMetaData.house_id} stakes={gameMetaData.stakes} openplayGame />
                    </div>
                    {/* Game Side Panel Container: Fixed width, no flex growth */}
                    {/* <div className="relative flex-shrink h-full bg-background flex flex-col rounded-r-md border-l p-1 overflow-y-auto min-w-64">
                        <GameSidePanel data={game} />
                    </div> */}
                </div>
            </div>
        // </RecentCoinflipInteractsProvider>
    );
}
