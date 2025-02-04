import {cn} from "@/lib/utils";

export default function Banner() {
    return (
        <div>
            <div className="relative w-full h-[350px] bg-muted bg-cover bg-center border-b">
                {/* Video Background */}
                <video
                    className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none z-0"
                    src="/banner-video.mp4"
                    autoPlay
                    loop
                    muted
                ></video>

                {/* Dark Overlay */}
                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-40 z-5"></div>

                {/* Content */}
                <div className="relative z-10 w-9/12 h-full mx-auto flex flex-col items-center justify-center gap-8">
                    <h1 className={cn("text-5xl font-extrabold text-center text-white uppercase", "")}>
                        Welcome to the Future of Gambling
                    </h1>
                    <div>
                        <h2 className={cn("text-xl text-center font-semibold text-white", "")}>
                            Openplay is redefining gambling: Fair, transparent, and secure.
                        </h2>
                        <h2 className={cn("text-xl text-center font-semibold text-white", "")}>
                            Powered by Sui blockchain.
                        </h2>
                    </div>

                    {/*<div className={"inline-flex gap-2"}>*/}
                    {/*    <Link href={"/games"}>*/}
                    {/*        <button*/}
                    {/*            className={cn("px-8 py-4 bg-gradient-to-r from-openplay1 to-openplay2 text-white rounded-full uppercase font-bold hover:scale-105", "")}*/}
                    {/*    >*/}
                    {/*        Play Now*/}
                    {/*    </button>*/}
                    {/*    </Link>*/}
                    
                    {/*    <a href={process.env.NEXT_PUBLIC_GITBOOK_URL ?? ""} target={"_blank"} >*/}
                    {/*    <button*/}
                    {/*        className={cn("px-8 py-4 bg-white/20 text-white hover:bg-white/30 rounded-full uppercase font-bold backdrop-blur-3xl hover:scale-105", "")}*/}
                    {/*    >*/}
                    {/*        Learn More*/}
                    {/*    </button>*/}
                    {/*    </a>*/}
                    {/*</div>*/}
                </div>

                {/* Bounce Text */}
                {/*<div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-white z-10">*/}
                {/*    <div className="animate-bounce">⬇ Start Earning Now</div>*/}
                {/*</div>*/}
            </div>
        </div>


    );
}
