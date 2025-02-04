import {GET_DYNAMIC_VALUE, GET_RECENT_COIN_FLIP_TRANSACTIONS, GET_REGISTRY} from '@/api/queries/sui-graphql-queries';
import {getGraphQLClient} from "@/api/graphql-client";
import {fromHex, toBase64} from "@mysten/bcs";
import {CoinFlipContextModel, InteractedWithGameModel} from "@/api/models/openplay-coin-flip";

export const fetchCoinflipContext = async (contextTableId: string, balanceManagerId: string): Promise<CoinFlipContextModel | undefined> => {
    const gqlClient = getGraphQLClient();

    const idBcs = toBase64(fromHex(balanceManagerId));
    const result = await gqlClient.query({
        query: GET_DYNAMIC_VALUE,
        variables: {
            owner: contextTableId,
            type: "0x2::object::ID",
            bcs: idBcs
        }
    });
    // @ts-expect-error fff
    const data = (result?.data?.owner?.dynamicField?.value?.json) as CoinFlipContext;
    return data;
};

export interface CoinFlipInteraction {
    digest: string | null;
    sender: string | null;
    timestamp: Date | null;
    interactModel: InteractedWithGameModel | null;
}

export const getRecentCoinFlipInteractions = async (): Promise<CoinFlipInteraction[]> => {
    const gqlClient = getGraphQLClient();
    const result = await gqlClient.query({
        query: GET_RECENT_COIN_FLIP_TRANSACTIONS,
    });
    console.log(result);
    
    const coinFlipPackageId = process.env.NEXT_PUBLIC_COIN_FLIP_PACKAGE_ID;
    const interactEventType = `${coinFlipPackageId}::game::InteractedWithGame`
    
    const data = result.data?.transactionBlocks?.nodes.map((node) => {
        // @ts-ignore
        const interactEvent = node.effects?.events?.nodes.find(x => x.contents?.type?.repr == interactEventType);
        
        if (!interactEvent) {
            return undefined;
        }
        
        // @ts-ignore
        const contents = interactEvent?.contents?.json as InteractedWithGameModel;
        
        // @ts-ignore
        // @ts-ignore
        return {
            digest: node.digest ?? null,
            sender: node.sender?.address ?? null,
            timestamp: interactEvent?.timestamp ? new Date(interactEvent.timestamp) : null,
            interactModel: contents
        }
    }) || []
    return data.filter((x) => x !== undefined) as CoinFlipInteraction[];
}