"use server"
import {Transaction} from "@mysten/sui/transactions";
import {
    ADMIN_CLAIM_HOUSE_FEES_FUNCTION_TARGET,
    CLAIM_PARTICIPATION_FUNCTION_TARGET,
    DESTROY_PARTICIPATION_FUNCTION_TARGET,
    UPDATE_PARTICIPATION_FUNCTION_TARGET
} from "@/api/core-constants";
import {getSuiClient} from "@/api/sui-client";
import {toBase64} from "@mysten/bcs";

export async function buildUpdateParticipationsTransaction(sender: string, participations: {houseId: string, participationId: string}[]) {
    const tx = new Transaction();

    participations.forEach((p) => {
        tx.moveCall({
            target: UPDATE_PARTICIPATION_FUNCTION_TARGET,
            arguments: [
                tx.object(p.houseId),
                tx.object(p.participationId),
            ],
        });
    });
    
    tx.setSender(sender);
    const bytes = await tx.build({
        client: getSuiClient(),
    });
    return toBase64(bytes);
}

export async function buildClaimTransaction(sender: string, houseId: string, participationId: string, destroyAfter: boolean) {
    const tx = new Transaction();

    tx.moveCall({
        target: UPDATE_PARTICIPATION_FUNCTION_TARGET,
        arguments: [
            tx.object(houseId),
            tx.object(participationId),
        ],
    });
    const [coin] = tx.moveCall({
        target: CLAIM_PARTICIPATION_FUNCTION_TARGET,
        arguments: [
            tx.object(houseId),
            tx.object(participationId),
        ],
    });
    tx.transferObjects([coin], sender);
    
    if (destroyAfter) {
        tx.moveCall({
            target: DESTROY_PARTICIPATION_FUNCTION_TARGET,
            arguments: [
                tx.object(participationId),
            ],
        });
    }
    
    tx.setSender(sender);
    const bytes = await tx.build({
        client: getSuiClient(),
    });
    return toBase64(bytes);
}
export async function buildClaimHouseRewardsTransaction(sender: string, houseId: string, houseAdminCapId: string) {
    const tx = new Transaction();

    const [coin] = tx.moveCall({
        target: ADMIN_CLAIM_HOUSE_FEES_FUNCTION_TARGET,
        arguments: [
            tx.object(houseId),
            tx.object(houseAdminCapId),
        ],
    });
    tx.transferObjects([coin], sender);
    tx.setSender(sender);
    const bytes = await tx.build({
        client: getSuiClient(),
    });
    return toBase64(bytes);
}