"use client"

import { Card } from "@/components/ui/card"
import { Loader } from "./loader"


export default function LoaderCard() {

    return (
        <div className="flex items-center justify-center min-h-full w-full bg-background md:bg-transparent p-0 md:p-6">
            <Card className="w-full h-full md:h-auto md:max-w-md shadow-none md:shadow-lg rounded-none md:rounded-xl border-0 md:border flex flex-col">
                <Loader title="Loading..." body="Please wait while we load the game for you." />
            </Card>
        </div>
    )
}