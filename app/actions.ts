"use server"

import {Ed25519Keypair} from "@mysten/sui/keypairs/ed25519";
import {Transaction} from "@mysten/sui/transactions";
import {getGasStationClient, getSuiClient} from "@/api/sui-client";
import {toBase64} from "@mysten/bcs";
import {INTERACT_FUNCTION_TARGET} from "@/api/coinflip-constants";
import {
    DEPOSIT_BALANCE_MANAGER_FUNCTION_TARGET,
    MINT_PLAY_CAP_FUNCTION_TARGET,
    NEW_BALANCE_MANAGER_FUNCTION_TARGET,
    SHARE_BALANCE_MANAGER_FUNCTION_TARGET,
    WITHDRAW_BALANCE_MANAGER_FUNCTION_TARGET
} from "@/api/core-constants";
import {buildGaslessTransaction} from "@shinami/clients/sui";

export async function getSponsorAddress() {
    const network = process.env.NEXT_PUBLIC_NETWORK as 'mainnet' | 'testnet' | 'devnet' | 'localnet';
    if (network != "localnet") {
        return null;
    }
    if (!process.env.LOCAL_GAS_STATION_PRIVATE_KEY) {
        return null;
    }
    const keypair = Ed25519Keypair.fromSecretKey(process.env.LOCAL_GAS_STATION_PRIVATE_KEY);
    return keypair.toSuiAddress();
}

// export async function buildSponsoredCoinFlipTransaction(sender: string, balanceManagerId: string, houseId: string, playCapId: string, gameId: string, stake: number, prediction: string) {
//     if (!process.env.LOCAL_GAS_STATION_PRIVATE_KEY) {
//         throw ("No private key found");
//     }
//     const keypair = Ed25519Keypair.fromSecretKey(process.env.LOCAL_GAS_STATION_PRIVATE_KEY);
//     const registryId = process.env.NEXT_PUBLIC_REGISTRY_ID;
//
//     if (!registryId) {
//         throw ("Registry ID not found")
//     }
//
//
//
//     const tx = new Transaction();
//
//     tx.moveCall({
//         target: INTERACT_FUNCTION_TARGET,
//         arguments: [
//             tx.object(gameId),
//             tx.object(registryId),
//             tx.object(balanceManagerId),
//             tx.object(houseId),
//             tx.object(playCapId),
//             tx.pure.string("PlaceBet"),
//             tx.pure.u64(stake),
//             tx.pure.string(prediction),
//             tx.object('0x8'), // random
//         ],
//     });
//
//     tx.setGasOwner(keypair.toSuiAddress());
//     tx.setSender(sender);
//     return await tx.sign({
//         signer: keypair,
//         client: getSuiClient()
//     });
// }

export async function buildSponsoredCoinFlipTransaction(sender: string, balanceManagerId: string, houseId: string, playCapId: string, gameId: string, stake: number, prediction: string) {
    const registryId = process.env.NEXT_PUBLIC_REGISTRY_ID;

    if (!registryId) {
        throw ("Registry ID not found")
    }

    const tx = new Transaction();

    tx.moveCall({
        target: INTERACT_FUNCTION_TARGET,
        arguments: [
            tx.object(gameId),
            tx.object(registryId),
            tx.object(balanceManagerId),
            tx.object(houseId),
            tx.object(playCapId),
            tx.pure.string("PlaceBet"),
            tx.pure.u64(stake),
            tx.pure.string(prediction),
            tx.object('0x8'), // random
        ],
    });
    tx.setSender(sender);

    const network = process.env.NEXT_PUBLIC_NETWORK as 'mainnet' | 'testnet' | 'devnet' | 'localnet';
    // Custom implementation for localnet
    if (network == "localnet") {
        if (!process.env.LOCAL_GAS_STATION_PRIVATE_KEY) {
            throw ("No private key found");
        }

        const keypair = Ed25519Keypair.fromSecretKey(process.env.LOCAL_GAS_STATION_PRIVATE_KEY);
        tx.setGasOwner(keypair.toSuiAddress());
        const sponsoredSignature = await tx.sign({
            signer: keypair,
            client: getSuiClient()
        });
        return {
            bytes: sponsoredSignature.bytes,
            signature: sponsoredSignature.signature
        }
    }
    // Shinami
    else {
        const gasClient = getGasStationClient();
        const gaslessTx = await buildGaslessTransaction(
            tx,
            {
                sender: sender,
                sui: getSuiClient(),
            });
        try {
            const sponsoredResponse = await gasClient.sponsorTransaction(gaslessTx);
            return {
                bytes: sponsoredResponse.txBytes,
                signature: sponsoredResponse.signature
            }
        } catch (e) {
            // @ts-ignore
            throw new Error("Error sponsoring transaction: " + e.data.details);
        }
    }

}


export async function executeSponsoredTransact(bytes: string, senderSignature: string, sponsorSignature: string) {
    const client = getSuiClient();
    return await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature: [senderSignature, sponsorSignature],
        options: {
            showEvents: true
        },
    })
}


export async function executeTransactionBlock(bytes: string, signature: string) {
    const client = getSuiClient();
    return await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
            showRawEffects: true,
            showObjectChanges: true,
        },
    });
}

export async function executeAndWaitForTransactionBlock(bytes: string, signature: string) {
    const client = getSuiClient();
    const response = await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
            showRawEffects: true,
            showObjectChanges: true,
        },
    });
    await client.waitForTransaction({
        digest: response.digest
    });
    return response;
}

export async function waitForTransaction(digest: string) {
    const client = getSuiClient();
    return await client.waitForTransaction({
        digest
    });
}

export async function buildDepositToExistingBalanceManagerTransaction(sender: string, balanceManagerId: string, balanceManagerCapId: string, amount: number, playCapDestination: string | null) {
    const tx = new Transaction();

    const [coin] = tx.splitCoins(tx.gas, [amount * 1e9]);
    tx.moveCall({
        target: DEPOSIT_BALANCE_MANAGER_FUNCTION_TARGET,
        arguments: [
            tx.object(balanceManagerId),
            tx.object(balanceManagerCapId),
            tx.object(coin)
        ],
    });

    // We also add a play_cap during a deposit to avoid double tx costs
    if (playCapDestination) {
        const [play_cap] = tx.moveCall({
            target: MINT_PLAY_CAP_FUNCTION_TARGET,
            arguments: [
                tx.object(balanceManagerId),
                tx.object(balanceManagerCapId),
            ],
        });
        tx.transferObjects([play_cap], playCapDestination);
    }

    tx.setSender(sender);
    const bytes = await tx.build({
        client: getSuiClient(),
    });
    return toBase64(bytes);
}

export async function buildDepositToNewBalanceManagerTransaction(sender: string, amount: number, playCapDestination: string | null) {
    const tx = new Transaction();

    const [balance_manager, balance_manager_cap] = tx.moveCall({
        target: NEW_BALANCE_MANAGER_FUNCTION_TARGET,
        arguments: [],
    });

    const [coin] = tx.splitCoins(tx.gas, [amount * 1e9]);
    tx.moveCall({
        target: DEPOSIT_BALANCE_MANAGER_FUNCTION_TARGET,
        arguments: [
            tx.object(balance_manager),
            tx.object(balance_manager_cap),
            tx.object(coin)
        ],
    });

    // We also add a play_cap during a deposit to avoid double tx costs
    if (playCapDestination) {
        const [play_cap] = tx.moveCall({
            target: MINT_PLAY_CAP_FUNCTION_TARGET,
            arguments: [
                tx.object(balance_manager),
                tx.object(balance_manager_cap),
            ],
        });
        tx.transferObjects([play_cap], playCapDestination);
    }

    tx.moveCall({
        target: SHARE_BALANCE_MANAGER_FUNCTION_TARGET,
        arguments: [
            tx.object(balance_manager)
        ],
    });
    tx.transferObjects([balance_manager_cap], sender);

    tx.setSender(sender);
    const bytes = await tx.build({
        client: getSuiClient(),
    });
    return toBase64(bytes);
}

export async function buildWithdrawFromBalanceManagerTransaction(sender: string, balanceManagerId: string, balanceManagerCapId: string, amount: number) {
    const tx = new Transaction();

    const [coin] = tx.moveCall({
        target: WITHDRAW_BALANCE_MANAGER_FUNCTION_TARGET,
        arguments: [
            tx.object(balanceManagerId),
            tx.object(balanceManagerCapId),
            tx.pure.u64(amount * 1e9)
        ],
    });
    tx.transferObjects([coin], sender);

    tx.setSender(sender);
    const bytes = await tx.build({
        client: getSuiClient(),
    });
    return toBase64(bytes);
}