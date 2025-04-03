"use server"
import {getSuiClient} from "@/api/sui-client";
import {toBase64} from "@mysten/bcs";
import {Transaction} from "@mysten/sui/transactions";
import {MINT_PLAY_CAP_FUNCTION_TARGET} from "@/api/core-constants";


export async function buildMintPlayCapTransaction(sender: string, balanceManagerId: string, balanceManagerCapId: string, recipient: string): Promise<string> {
    const tx = new Transaction();

    const [play_cap] = tx.moveCall({
        target: MINT_PLAY_CAP_FUNCTION_TARGET,
        arguments: [
            tx.object(balanceManagerId),
            tx.object(balanceManagerCapId),
        ],
    });
    tx.transferObjects([play_cap], recipient);

    tx.setSender(sender);
    const bytes = await tx.build({
        client: getSuiClient(),
    });
    return toBase64(bytes);
}