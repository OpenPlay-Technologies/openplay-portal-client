import {SuiGraphQLClient} from '@mysten/sui/graphql';
import {getFullnodeUrl, SuiClient} from "@mysten/sui/client";
import {createSuiClient, KeyClient, ShinamiWalletSigner, WalletClient} from "@shinami/clients/sui";

let gqlClient: SuiGraphQLClient | null = null;

export const getGraphQLClient = (): SuiGraphQLClient => {
    if (!gqlClient) {
        gqlClient = new SuiGraphQLClient({
            url: 'http://127.0.0.1:9125', // Replace with your actual endpoint
        });
    }
    return gqlClient;
};

export const getSuiClient = () => {
    const network = process.env.NEXT_PUBLIC_NETWORK as 'mainnet' | 'testnet' | 'devnet' | 'localnet';

    let client;

    if (network == "localnet") {
        client = new SuiClient({
            url: getFullnodeUrl(network)
        });
    }
    else {
        const shinamiKey = process.env.SHINAMI_NODE_KEY;
        if (!shinamiKey){
            throw new Error("SHINAMI_NODE_KEY is not set");
        }
        client = createSuiClient(shinamiKey);
    }
    return client;
}

export const getPriviligedSuiClient = () => {
    const network = process.env.NEXT_PUBLIC_NETWORK as 'mainnet' | 'testnet' | 'devnet' | 'localnet';

    let client;

    if (network == "localnet") {
        client = new SuiClient({
            url: getFullnodeUrl(network)
        });
    }
    else {
        const shinamiKey = process.env.SHINAMI_SUPER_KEY;
        if (!shinamiKey){
            throw new Error("SHINAMI_SUPER_KEY is not set");
        }
        client = createSuiClient(shinamiKey);
    }
    return client;
}

export const getWalletClient = () => {
    const walletKey = process.env.SHINAMI_SUPER_KEY;
    if (!walletKey){
        throw new Error("SHINAMI_SUPER_KEY is not set");
    }
    return new WalletClient(walletKey);
}

export const getKeyClient = () => {
    const walletKey = process.env.SHINAMI_SUPER_KEY;
    if (!walletKey){
        throw new Error("SHINAMI_SUPER_KEY is not set");
    }
    return new KeyClient(walletKey);
}

export const getShinamiWalletSigner = (walletId: string) => {
    const wal = getWalletClient();
    const key = getKeyClient();

    const walletSecret = process.env.SHINAMI_INVISIBLE_WALLET_SECRET;
    if (!walletSecret){
        throw new Error("SHINAMI_INVISIBLE_WALLET_SECRET is not set");
    }
    return new ShinamiWalletSigner(walletId, wal, walletSecret, key);
}