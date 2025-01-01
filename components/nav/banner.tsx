export default function Banner() {
    return (
        <div>
            <div className="relative w-full h-[400px] bg-muted bg-cover bg-center border-b">
                <video
                    className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
                    src="/video-banner-slogan-sd.mp4"
                    autoPlay
                    loop
                    muted
                ></video>
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-white">
                    <div className="animate-bounce">⬇ Start Earning Now</div>
                </div>
            </div>
        </div>
    );
}
