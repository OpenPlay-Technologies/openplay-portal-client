import Banner from "@/components/nav/banner";
import React from "react";
import GameSlider from "@/components/games/game-slider";

export default function GamesPage() {
    return (
        <div>
            <Banner />
            {/*<CoinFlipGrid />*/}
            <div className="container mx-auto">
                <GameSlider />
            </div>
        </div>
    );
}