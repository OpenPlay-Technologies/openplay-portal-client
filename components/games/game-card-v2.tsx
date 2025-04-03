import Link from "next/link"
import Image from "next/image"

type GameCardProps = {
    href: string
    src: string
    alt: string
    title: string
}

export function GameCardV2({ href, src, alt, title }: GameCardProps) {
    return (
        <Link href={href} className="group block focus:outline-none">
            <div
                className="rounded-lg overflow-hidden border border-border bg-card shadow-sm transition-all duration-300 ease-in-out 
        md:group-hover:scale-105 md:group-hover:shadow-xl md:group-hover:border-primary/30 
        dark:bg-card dark:border-border md:dark:group-hover:border-primary/30 dark:shadow-none md:dark:group-hover:shadow-lg md:dark:group-hover:shadow-primary/5"
            >
                <div className="relative aspect-square w-full overflow-hidden">
                    <Image
                        src={src || "/placeholder.svg"}
                        alt={alt}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="p-4 text-center">
                    <h3 className="text-2xl font-bold text-foreground group-hover:text-primary md:group-hover:text-primary transition-colors duration-300">
                        {title}
                    </h3>
                </div>
            </div>
        </Link>

    )
}

