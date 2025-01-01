import Link from "next/link";
import {GameData} from "@/api/models/models";


export default function FeaturedGameCard(props: {
    data: GameData
}) {
    return (
        <Link className="flex-1 min-w-32 max-w-96 overflow-hidden relative rounded-xl aspect-square" href={`/game/${props.data.id}`}>
            {/* Image */}
            <div className="relative w-full h-full">
                <img
                    src={props.data.image_url}
                    alt={props.data.name + "-banner"}
                    className={"object-cover w-full h-full"}
                />

                {/* Gradient Shadow Overlay */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            </div>

            {/* Text */}
            <div className="absolute bottom-2 left-2 text-white">
                <h2 className="text-sm font-semibold">{props.data.name}</h2>
            </div>
        </Link>
    );
}