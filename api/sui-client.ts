import {SuiGraphQLClient} from '@mysten/sui/graphql';
import {getFullnodeUrl, SuiClient} from "@mysten/sui/client";
import {createSuiClient, GasStationClient} from "@shinami/clients/sui";

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

    var client;

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
    // else {
    //     client = new SuiClient({
    //         url: getFullnodeUrl(network)
    //     });
    // }

    return client;
}

export const getGasStationClient = () => {
    const shinamiKey = process.env.SHINAMI_GAS_KEY;
    if (!shinamiKey){
        throw new Error("SHINAMI_GAS_KEY is not set");
    }
    return new GasStationClient(shinamiKey);
}