import OpenPlayConnectGamePage from "@/components/gameplay/openplay-connect-game-page";
import { notFound } from "next/navigation";

type Params = Promise<{ gameUrlName: string }>



export default async function LaunchGame({params}: { params: Params }) {

    const {gameUrlName} = await params;
    if (!gameUrlName) {
        notFound();
    }

    let gameUrl: string | undefined;
    let houseId: string | undefined;
    let bgUrl: string | undefined;

    switch (gameUrlName) {
        case "sui-vs-sol":
            gameUrl = process.env.NEXT_PUBLIC_COIN_FLIP_URL;
            houseId = process.env.NEXT_PUBLIC_HOUSE_ID;
            bgUrl = "/sui-vs-sol/coin-flip-background.png";
            break;
        case "piggy-bank":
            gameUrl = process.env.NEXT_PUBLIC_PIGGY_BANK_URL;
            houseId = process.env.NEXT_PUBLIC_HOUSE_ID;
            bgUrl = "/piggy-bank/piggy-bank-background.png";
            break;
        default:
            return notFound();
    }

    if (!gameUrl || !houseId) {
        return notFound();
    }

    return (
        <OpenPlayConnectGamePage gameUrl={gameUrl} houseId={houseId} bgUrl={bgUrl}/>
    );
}
