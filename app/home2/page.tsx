import Link from "next/link"
import Image from "next/image"

// Banner component with white text overlay on the dark video.
function Banner() {
  return (
    <section className="relative h-[60vh] w-full overflow-hidden">
      <video autoPlay muted loop className="absolute inset-0 h-full w-full object-cover">
        <source src="/banner-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
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
    </section>
  )
}

type GameCardProps = {
  href: string
  src: string
  alt: string
  title: string
}

// GameCard component using recommended classes for text.
function GameCard({ href, src, alt, title }: GameCardProps) {
  return (
    <Link href={href} className="group">
      <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg">
        <div className="relative aspect-[3/4] w-full">
          <Image src={src} alt={alt} fill className="object-cover" />
        </div>
        <div className="p-4 text-center">
          <h3 className="text-2xl font-bold text-primary">
            {title}
          </h3>
        </div>
      </div>
    </Link>
  )
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Banner />

      {/* Games Section */}
      <section className="container mx-auto py-12 md:py-16 px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">
          <span className="text-primary">Our</span>{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-openplay1 to-openplay2">Games</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          <GameCard
            href="/games/poker"
            src="/piggy-bank-thumbnail.png"
            alt="Poker"
            title="Piggy Bank"
          />
          <GameCard
            href="/games/slots"
            src="/sui-vs-sol thumbnail.png"
            alt="Slots"
            title="Lucky Slots"
          />
        </div>
      </section>
    </main>
  )
}
