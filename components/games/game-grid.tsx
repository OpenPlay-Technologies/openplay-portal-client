import FeaturedGameCard from "@/components/games/featured-game-card";
import {fetchAllGames} from "@/api/queries/games";

export async function GameGrid() {

    const games = await fetchAllGames();

    return (
        <div className="px-8 py-4">
            <h2 className="text-3xl font-semibold my-4">All Games</h2>
            <div
                className="grid gap-4"
                style={{
                    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                }}
            >
                {games?.map((game, index) => (
                    <FeaturedGameCard data={game} key={index}/>
                ))}
            </div>
        </div>);

}