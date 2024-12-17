import FeaturedGameCard from "@/components/games/featured-game-card";

export default function FeaturedGames() {
    
    return (
        <div className={"flex flex-col pt-8 pb-4"}>            
            <div className={"flex flex-row gap-4 mx-auto h-full w-full px-16"}>
                <FeaturedGameCard/>
                <FeaturedGameCard/>
                <FeaturedGameCard/>
                <FeaturedGameCard/>
            </div>
        </div>

    );
}