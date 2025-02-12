"use server"
import {getSuiClient} from "@/api/sui-client";
import {toBase64} from "@mysten/bcs";
import {Transaction} from "@mysten/sui/transactions";
import {NEW_HOUSE_FUNCTION_TARGET, SHARE_HOUSE_FUNCTION_TARGET} from "@/api/core-constants";

export async function BuildCreateHouseTransaction(sender: string, is_private: boolean, target_balance: number, house_fee_bps: number, referral_fee_bps: number): Promise<string> {
    const registryId = process.env.NEXT_PUBLIC_REGISTRY_ID;
    
    if (!registryId) {
        throw new Error("Registry ID is not set");
    }
    
    const tx = new Transaction();
    const [house, houseCap] = tx.moveCall({
        target: NEW_HOUSE_FUNCTION_TARGET,
        arguments: [
            tx.pure.bool(is_private),
            tx.pure.u64(target_balance),
            tx.pure.u64(house_fee_bps),
            tx.pure.u64(referral_fee_bps),
        ],
    });
    tx.moveCall({
        target: SHARE_HOUSE_FUNCTION_TARGET,
        arguments: [
            tx.object(registryId),
            tx.object(house),
        ],
    });
    tx.transferObjects([houseCap], sender);

    tx.setSender(sender);
    const bytes = await tx.build({
        client: getSuiClient(),
    });
    return toBase64(bytes);
}