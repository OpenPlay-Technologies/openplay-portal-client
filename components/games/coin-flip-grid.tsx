import CoinFlipGameCard from "@/components/games/coinflip-game-card";
import {fetchAllCoinFlipGames} from "@/api/queries/games";


const gameData = [
    {
        id: "0x36f144a86e85397408f36dd8724a1187f8a8db940139d4af40901b4f7bc04c13",
        title: "Sui vs Sol",
        image: "/sui-vs-sol-thumbnail.png",
        url: "/coin-flip/sui-vs-sol",
    },
    {
        id: "0x36f144a86e85397408f36dd8724a1187f8a8db940139d4af40901b4f7bc04c13",
        title: "Sui vs Sol",
        image: "/sui-vs-sol-thumbnail.png",
        url: "/coin-flip/sui-vs-sol",
    },
    {
        id: "0x36f144a86e85397408f36dd8724a1187f8a8db940139d4af40901b4f7bc04c13",
        title: "Sui vs Sol",
        image: "/sui-vs-sol-thumbnail.png",
        url: "/coin-flip/sui-vs-sol",
    }
]

export default async function CoinFlipGrid() {
    const coinFlipGames = await fetchAllCoinFlipGames();

    return (
        <div className="container px-4 sm:px-8 py-4">
            <h2 className="text-3xl font-semibold my-4">Coin Flip</h2>
            <div
                className="grid gap-4"
                style={{
                    gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 240px), 1fr))`,
                    // Ensure minimum of 2 columns on wider screens
                    '@media (min-width: 640px)': {
                        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 280px), 1fr))`
                    }
                }}
            >
                {gameData.map((data) => {
                    const game = coinFlipGames.find((game) => game.id === data.id);
                    if (!game) return null;

                    return (
                        <div key={game.id} className="w-full">
                            <CoinFlipGameCard
                                url={data.url + "?gameId=" + game.id}
                                title={data.title}
                                image={data.image}
                                houseEdgeBps={Number(game.house_edge_bps)}
                                payoutFactorBps={Number(game.payout_factor_bps)}
                                id={game.id}
                                maxStake={Number(game.max_stake)}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}