"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useDepositModal } from "../providers/deposit-modal-provider"


export default function FirstDepositCard() {

    const handleBack = () => {
        // Navigation logic would go here
        window.history.back()
    }

    const {openDepositModal} = useDepositModal();

    return (
        <div className="flex items-center justify-center min-h-full w-full bg-background md:bg-transparent p-0 md:p-6">
            <Card className="w-full h-full md:h-auto md:max-w-md shadow-none md:shadow-lg rounded-none md:rounded-xl border-0 md:border flex flex-col">
                <CardHeader className="pb-4 md:pb-6">
                    <CardTitle className="text-xl font-semibold text-center md:text-left">Make Your First Deposit</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-center space-y-3 pb-6">
                    <p className="text-muted-foreground text-center md:text-left">You need to have a balance manager to start playing the game.</p>
                    <p className="text-muted-foreground text-center md:text-left">Make your first deposit to continue.</p>
                </CardContent>
                <CardFooter className="flex flex-col space-y-3 pt-2 pb-8 md:pb-6">
                    <Button
                        onClick={openDepositModal}
                        className="w-full max-w-sm"
                        size="lg"
                        variant={"accent"}
                    >
                        Deposit
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="w-full max-w-sm"
                        size="lg"
                    >
                        {/* <ArrowLeft className="mr-2 h-4 w-4" /> */}
                        Back
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}