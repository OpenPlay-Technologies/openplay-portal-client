"use server"

import {Transaction} from "@mysten/sui/transactions";
import {getSuiClient} from "@/api/sui-client";
import {toBase64} from "@mysten/bcs";

export async function buildTransferFundsTransaction(sender: string, recipient: string, amount: number): Promise<string> {
    const tx = new Transaction();

    const [coin] = tx.splitCoins(tx.gas, [amount * 1e9]);
    tx.transferObjects([coin], recipient);

    tx.setSender(sender);

    const bytes = await tx.build({
        client: getSuiClient(),
    });
    return toBase64(bytes);
}