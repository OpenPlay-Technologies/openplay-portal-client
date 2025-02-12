// import CoinFlipGameCard from "@/components/games/coinflip-game-card";
// import {fetchGame} from "@/api/queries/games";
// import {gameMetaData} from "@/lib/game-metadata";
//
//
// export default async function CoinFlipGrid() {
//     let gameId = gameMetaData.id;
//     let gameData = await fetchGame(gameId);
//
//     return (
//         <div className="container px-4 sm:px-8 py-4">
//             <h2 className="text-3xl font-semibold my-4">Coin Flip</h2>
//             <div
//                 className="grid gap-4"
//                 style={{
//                     gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 240px), 1fr))`,
//                     // Ensure minimum of 2 columns on wider screens
//                     '@media (min-width: 640px)': {
//                         gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 280px), 1fr))`
//                     }
//                 }}
//             >
//                 {[gameData].map((game) => {
//                     if (!game) return null;
//
//                     return (
//                         <div key={game.id} className="w-full">
//                             <CoinFlipGameCard
//                                 url={gameMetaData.url + "?gameId=" + game.id}
//                                 title={gameMetaData.title}
//                                 image={gameMetaData.image}
//                                 houseEdgeBps={Number(game.house_edge_bps)}
//                                 payoutFactorBps={Number(game.payout_factor_bps)}
//                                 id={game.id}
//                                 maxStake={Number(game.max_stake)}
//                             />
//                         </div>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// }