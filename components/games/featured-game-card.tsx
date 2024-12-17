import Image from "next/image";


export default function FeaturedGameCard() {
    return (
        <div className="flex-1 min-w-32 overflow-hidden relative rounded-xl aspect-square">
            {/* Image */}
            <div className="relative w-full h-full">
                <Image
                    src="/coinflip-banner.jpg"
                    alt="Coin flip banner"
                    layout="fill"
                    objectFit="cover"
                />

                {/* Gradient Shadow Overlay */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            </div>

            {/* Text */}
            <div className="absolute bottom-2 left-2 text-white">
                <h2 className="text-sm font-semibold">06 87&apos;s Coin Flip</h2>
            </div>
        </div>
    );
}