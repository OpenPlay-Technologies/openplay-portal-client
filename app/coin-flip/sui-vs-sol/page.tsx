import OpenPlayConnectGamePage from "@/components/gameplay/openplay-connect-game-page";
import { notFound } from "next/navigation";


export default async function LaunchGame() {

    const gameUrl = process.env.NEXT_PUBLIC_COIN_FLIP_URL;
    const houseId = process.env.NEXT_PUBLIC_HOUSE_ID;

    if (!gameUrl || !houseId) {
        return notFound();
    }

    return (
        <OpenPlayConnectGamePage gameUrl={gameUrl} houseId={houseId} bgUrl={"/coin-flip-background.png"}/>
    );
}
