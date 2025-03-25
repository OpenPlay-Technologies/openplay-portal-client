import Banner from "@/components/nav/banner";
import React from "react";
import CoinFlipSlider from "@/components/games/game-slider";

export default function GamesPage() {
    return (
        <div>
            <Banner />
            {/*<CoinFlipGrid />*/}
            <CoinFlipSlider />
        </div>
    );
}