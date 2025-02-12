"use server"

import {getSuiClient} from "@/api/sui-client";
import {toBase64} from "@mysten/bcs";
import {Transaction} from "@mysten/sui/transactions";
import {
    ADD_ALLOW_TX_FUNCTION_TARGET,
    ADMIN_NEW_PARTICIPATION_FUNCTION_TARGET, CLAIM_PARTICIPATION_FUNCTION_TARGET, DESTROY_PARTICIPATION_FUNCTION_TARGET,
    NEW_PARTICIPATION_FUNCTION_TARGET, REVOKE_ALLOW_TX_FUNCTION_TARGET,
    STAKE_FUNCTION_TARGET, UNSTAKE_FUNCTION_TARGET,
    UPDATE_PARTICIPATION_FUNCTION_TARGET
} from "@/api/core-constants";

export async function buildPublicStakeTransaction(sender: string, houseId: string, amount: number, participationId: (string|null)): Promise<string> {
    const tx = new Transaction();

    let participationObj;
    if (participationId) {
        participationObj = tx.object(participationId);
        tx.moveCall({
            target: UPDATE_PARTICIPATION_FUNCTION_TARGET,
            arguments: [
                tx.object(houseId),
                participationObj,
            ],
        });
    }
    else {
        const [participation] = tx.moveCall({
            target: NEW_PARTICIPATION_FUNCTION_TARGET,
            arguments: [
                tx.object(houseId)
            ],
        });
        participationObj = tx.object(participation);
    }

    const [coin] = tx.splitCoins(tx.gas, [amount * 1e9]);
    tx.moveCall({
        target: STAKE_FUNCTION_TARGET,
        arguments: [
            tx.object(houseId),
            participationObj,
            tx.object(coin)
        ],
    });

    if (!participationId) {
        tx.transferObjects([participationObj], sender);
    }
    
    tx.setSender(sender);

    const bytes = await tx.build({
        client: getSuiClient(),
    });
    return toBase64(bytes);
}

export async function buildPrivateStakeTransaction(sender: string, houseId: string, adminCapId: string, amount: number, participationId: (string|null)): Promise<string> {
    const tx = new Transaction();

    let participationObj;
    if (participationId) {
        participationObj = tx.object(participationId);
        tx.moveCall({
            target: UPDATE_PARTICIPATION_FUNCTION_TARGET,
            arguments: [
                tx.object(houseId),
                participationObj,
            ],
        });
    }
    else {
        const [participation] = tx.moveCall({
            target: ADMIN_NEW_PARTICIPATION_FUNCTION_TARGET,
            arguments: [
                tx.object(houseId),
                tx.object(adminCapId)
            ],
        });
        participationObj = tx.object(participation);
    }

    const [coin] = tx.splitCoins(tx.gas, [amount * 1e9]);
    tx.moveCall({
        target: STAKE_FUNCTION_TARGET,
        arguments: [
            tx.object(houseId),
            participationObj,
            tx.object(coin)
        ],
    });

    if (!participationId) {
        tx.transferObjects([participationObj], sender);
    }

    tx.setSender(sender);

    const bytes = await tx.build({
        client: getSuiClient(),
    });
    return toBase64(bytes);
}
export async function buildUnstakeTransaction(sender: string, houseId: string, participationId: string) {
    const tx = new Transaction();
    tx.moveCall({
        target: UPDATE_PARTICIPATION_FUNCTION_TARGET,
        arguments: [
            tx.object(houseId),
            tx.object(participationId),
        ],
    });
    tx.moveCall({
        target: UNSTAKE_FUNCTION_TARGET,
        arguments: [
            tx.object(houseId),
            tx.object(participationId),
        ],
    });
    
    tx.setSender(sender);
    const bytes = await tx.build({
        client: getSuiClient(),
    });
    return toBase64(bytes);
}

export async function buildUpdateParticipationTransaction(sender: string, houseId: string, participationId: string) {
    const tx = new Transaction();
    tx.moveCall({
        target: UPDATE_PARTICIPATION_FUNCTION_TARGET,
        arguments: [
            tx.object(houseId),
            tx.object(participationId),
        ],
    });
    
    tx.setSender(sender);
    const bytes = await tx.build({
        client: getSuiClient(),
    });
    return toBase64(bytes);
}

export async function buildClaimParticipationTransaction(sender: string, houseId: string, participationId: string, destroyAfter: boolean) {
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

export async function buildAllowTxTransaction(sender: string, houseId: string,  houseAdminCapId: string, gameId: string) {
    const tx = new Transaction();
    tx.moveCall({
        target: ADD_ALLOW_TX_FUNCTION_TARGET,
        arguments: [
            tx.object(houseId),
            tx.object(houseAdminCapId),
            tx.object(gameId)
        ],
    });

    tx.setSender(sender);
    const bytes = await tx.build({
        client: getSuiClient(),
    });
    return toBase64(bytes);
}

export async function buildRevokeTxTransaction(sender: string, houseId: string,  houseAdminCapId: string, gameId: string) {
    const tx = new Transaction();
    tx.moveCall({
        target: REVOKE_ALLOW_TX_FUNCTION_TARGET,
        arguments: [
            tx.object(houseId),
            tx.object(houseAdminCapId),
            tx.object(gameId)
        ],
    });

    tx.setSender(sender);
    const bytes = await tx.build({
        client: getSuiClient(),
    });
    return toBase64(bytes);
}