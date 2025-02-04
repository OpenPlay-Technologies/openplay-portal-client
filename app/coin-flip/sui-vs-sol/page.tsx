import {fetchGame} from "@/api/queries/games";
import { notFound } from 'next/navigation';
import GameLauncher from "@/components/gameplay/game-launcher";
import {GameRoundTable} from "@/components/recent-wins/game-round-table";
import GameFooter from "@/components/gameplay/game-footer";

export default async function LaunchGame({
                                             searchParams,
                                         }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {

    const gameId = (await searchParams).gameId as string;
    if (!gameId) {
        notFound();
    }
    const game = await fetchGame(gameId);
    if (!game) {
        notFound();
    }

    return (
        <div>
            
        <div className={"w-screen h-[1000px] bg-[url(/coin-flip-background.png)]"}>
            <div className={"flex flex-row p-20 h-full w-full"}>
                <GameLauncher data={game} className={"w-full"} />
                {/*<div className={"w-1/5"}>*/}
                {/*    Hello there!*/}
                {/*</div>*/}
            </div>
        </div>
            <GameFooter/>
        </div>
    );
}
