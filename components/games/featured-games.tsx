"use client"

// import FeaturedGameCard from "@/components/games/featured-game-card";
// import {useEffect, useState} from "react";

export default function FeaturedGames() {
    // const [numGamesToShow, setNumGamesToShow] = useState(4); // Default number of games
    //
    // useEffect(() => {
    //     const updateNumGames = () => {
    //         const width = window.innerWidth;
    //         if (width >= 1200) setNumGamesToShow(6); // Larger screens
    //         else if (width >= 768) setNumGamesToShow(4); // Medium screens
    //         else setNumGamesToShow(2); // Smaller screens
    //     };
    //
    //     updateNumGames(); // Call on initial render
    //     window.addEventListener("resize", updateNumGames); // Add resize listener
    //
    //     return () => window.removeEventListener("resize", updateNumGames); // Cleanup listener
    // }, []);

    return (
        <div className="flex flex-col pt-8 pb-4">
            {/*<div className="flex flex-row gap-4 mx-auto h-full w-full px-8">*/}
            {/*    {Array.from({ length: numGamesToShow }).map((_, index) => (*/}
            {/*        <FeaturedGameCard key={index} />*/}
            {/*    ))}*/}
            {/*</div>*/}
        </div>
    );
}