"use client"

import { ExternalLink, MessageSquare } from "lucide-react"

import { GithubIcon } from "../nav/footer"

export default function CollaborationCTA() {
  return (
    <section className="w-full bg-background">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Ready to Elevate Your Gaming Experience?
          </h2>
          <p className="mt-2 text-muted-foreground md:text-lg">
            OpenPlay offers open-source casino solutions for developers and operators
          </p>
        </div>
        <div className="mt-10">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-primary/10">
                <ExternalLink className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Plug & Play Games</h3>
              <p className="text-sm text-center text-muted-foreground">
                With OpenPlay Connect any game works out of the box on any platform
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-primary/10">
                <GithubIcon />
              </div>
              <h3 className="text-lg font-medium">Open Source</h3>
              <p className="text-sm text-center text-muted-foreground">
                Everything is open source and transparent on the blockchain
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">B2B Partnerships</h3>
              <p className="text-sm text-center text-muted-foreground">
                Collaborate with us and beoming a pioneer
              </p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Whether you&apos;re a game developer looking to showcase your creations or a casino operator seeking a robust
              platform, OpenPlay provides the tools and support you need to succeed in the gaming industry.
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center space-y-4">
          <div className="flex justify-center space-x-4 underline">
            <a href="mailto:0x0687.dev@gmail.com">0x0687.dev@gmail.com</a>
          </div>
          <p className="text-sm text-center text-muted-foreground">
            Let&apos;s build the future of gaming together
          </p>
        </div>
      </div>
    </section>
  )
}
