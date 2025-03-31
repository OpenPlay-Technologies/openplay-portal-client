import { SmilePlus } from "lucide-react"

export function ComingSoonGameCard() {
  return (
    <div className="group block">
      <div
        className="rounded-lg overflow-hidden border border-border bg-card/50 shadow-sm transition-all duration-300 ease-in-out 
        group-hover:scale-105 group-hover:shadow-xl group-hover:border-primary/30 
        dark:bg-card/50 dark:border-border dark:group-hover:border-primary/30 dark:shadow-none dark:group-hover:shadow-lg dark:group-hover:shadow-primary/5"
      >
        <div className="relative aspect-square w-full overflow-hidden bg-muted/30 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <SmilePlus className="h-20 w-20 text-muted-foreground/40 group-hover:text-primary/40 transition-colors duration-300" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/10 opacity-50" />
        </div>
        <div className="p-4 text-center">
          <h3 className="text-2xl font-bold text-foreground/80 group-hover:text-primary transition-colors duration-300">
            Want your game here?
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">Get in touch for collaborations!</p>
        </div>
      </div>
    </div>
  )
}

