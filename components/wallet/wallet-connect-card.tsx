import { Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface WalletConnectCardProps {
    onClick?: () => void;
}

export default function WalletConnectCard(props: WalletConnectCardProps) {

    return (
        <>
            <Card className="w-full max-w-md mx-auto">
                <CardHeader className="text-center">
                    <Wallet className="w-12 h-12 mx-auto mb-2 text-primary" />
                    <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
                    <CardDescription className="sr-only">This content is only available to authenticated users</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-muted-foreground">
                        To access the exclusive content on this page, please connect your wallet. Once connected, you&apos;ll be able to
                        view all available resources.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button size="lg" className="px-8 font-semibold bg-gradient-to-r from-openplay1 to-openplay2" onClick={props.onClick}>
                        Connect Wallet
                    </Button>
                </CardFooter>
            </Card>
        </>
    )
}

