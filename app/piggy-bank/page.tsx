import { notFound } from 'next/navigation';
import OpenPlayConnectGamePage from '@/components/gameplay/openplay-connect-game-page';


export default async function PiggyBankGame() {

    const gameUrl = process.env.NEXT_PUBLIC_PIGGY_BANK_URL;
    const houseId = process.env.NEXT_PUBLIC_HOUSE_ID;

    if (!gameUrl || !houseId) {
        return notFound();
    }

    return (
        <OpenPlayConnectGamePage gameUrl={gameUrl} houseId={houseId} />
    );
}
