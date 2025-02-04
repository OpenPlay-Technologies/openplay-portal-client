"use server"

import {Ed25519Keypair} from "@mysten/sui/keypairs/ed25519";
import {Transaction} from "@mysten/sui/transactions";
import {getFullnodeUrl, SuiClient} from "@mysten/sui/client";
export async function getSponsorAddress() {
    if (!process.env.GAS_STATION_PRIVATE_KEY) {
        return null;
    }
    const keypair = Ed25519Keypair.fromSecretKey(process.env.GAS_STATION_PRIVATE_KEY);
    return keypair.toSuiAddress();
}

export async function sponsoredInteractCoinFlip(sender: string, registryId: string, balanceManagerId: string, houseId: string, playCapId: string, gameId: string, stake: number, prediction: string) {
    const coinFlipPackageId = process.env.NEXT_PUBLIC_COIN_FLIP_PACKAGE_ID;
    if (!process.env.GAS_STATION_PRIVATE_KEY) {
        throw ("No private key found");
    }
    const keypair = Ed25519Keypair.fromSecretKey(process.env.GAS_STATION_PRIVATE_KEY);    
    
    const tx = new Transaction();
    tx.moveCall({
        target: `${coinFlipPackageId}::game::interact`,
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
    tx.setGasOwner(keypair.toSuiAddress());
    tx.setSender(sender);
    return await tx.sign({
        signer: keypair,
        client: new SuiClient({
            url: getFullnodeUrl('localnet'),
        })
    });
    
}