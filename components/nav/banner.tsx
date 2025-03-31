'use client';
import { useState, useRef, useEffect, useCallback } from "react";

export default function Banner() {
    const videoRef = useRef<HTMLVideoElement>(null);
    // This state controls whether the video element is visible.
    // If playback fails (e.g. due to a NotAllowedError), we hide the video.
    const [isVideoHidden, setIsVideoHidden] = useState(false);

    // This function resets the video and tries to play it.
    // If playing fails because of browser restrictions, we hide the video.
    const playVideo = useCallback(async () => {
        if (!videoRef.current) return;
        try {
            videoRef.current.currentTime = 0;
            await videoRef.current.play();
            setIsVideoHidden(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if (error?.name === "NotAllowedError") {
                // Video playback is not allowed (e.g. on iPhone Safari);
                // hide the video so that the poster is used instead.
                setIsVideoHidden(true);
            }
        }
    }, []);

    // Try to play the video as soon as the component mounts.
    useEffect(() => {
        if (videoRef.current) {
            playVideo();
        }
    }, [playVideo]);

    return (
        <div>
            <div className="relative h-[60vh] w-full overflow-hidden bg-muted bg-cover bg-center border-b">
                {/* Video Background or Poster Fallback */}
                {!isVideoHidden ? (
                    <video
                        ref={videoRef}
                        onLoadedData={playVideo}
                        className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none z-0"
                        src="/banner-video.mp4"
                        loop
                        muted
                        playsInline
                        poster="/banner-poster-min.webp"
                    ></video>
                ) : (
                    // If the video can't play, show the poster image as a background.
                    <div
                        className="absolute top-0 left-0 w-full h-full bg-cover bg-center pointer-events-none z-0"
                        style={{ backgroundImage: "url('/banner-poster-min.webp')" }}
                    />
                )}

                {/* Dark Overlay */}
                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-40 z-5"></div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                        Welcome to the Future of Gambling
                    </h1>
                    <p className="text-sm md:text-lg lg:text-xl max-w-3xl mx-auto text-white">
                        Openplay is redefining gambling: Fair, transparent, and secure.
                        <br className="hidden md:block" />
                        Powered by Sui blockchain.
                    </p>
                </div>

                {/* Bounce Text */}
                {/*<div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-white z-10">*/}
                {/*    <div className="animate-bounce">⬇ Start Earning Now</div>*/}
                {/*</div>*/}
            </div>
        </div>


    );
}
