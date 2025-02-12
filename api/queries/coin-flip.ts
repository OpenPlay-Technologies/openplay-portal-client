"use server"
import {getSuiClient} from "@/api/sui-client";
import {fromHex, toBase64} from "@mysten/bcs";
import {CoinFlipContextModel, InteractedWithGameModel} from "@/api/models/openplay-coin-flip";
import {DynamicObjectValue} from "@/api/models/shared-models";
import {PlayCapModel} from "@/api/models/openplay-core";
import {INTERACT_EVENT_TYPE} from "@/api/coinflip-constants";

// export const fetchCoinflipContext = async (contextTableId: string, balanceManagerId: string): Promise<CoinFlipContextModel | undefined> => {
//     const gqlClient = getGraphQLClient();
//
//     const idBcs = toBase64(fromHex(balanceManagerId));
//     const result = await gqlClient.query({
//         query: GET_DYNAMIC_VALUE,
//         variables: {
//             owner: contextTableId,
//             type: "0x2::object::ID",
//             bcs: idBcs
//         }
//     });
//     // @ts-expect-error fff
//     const data = (result?.data?.owner?.dynamicField?.value?.json) as CoinFlipContext;
//     return data;
// };

export const fetchCoinflipContext = async (contextTableId: string, balanceManagerId: string): Promise<CoinFlipContextModel | undefined> => {
    const client = getSuiClient();
    // console.log(contextTableId);
    const idBcs = toBase64(fromHex(balanceManagerId));
    const response = await client.getDynamicFieldObject({
        parentId: contextTableId,
        name: {
            type: "0x2::object::ID",
            value: balanceManagerId
        }
    });
    
    if (response.data?.content?.dataType == "moveObject"){
        // @ts-ignore
        const value = response.data.content.fields as DynamicObjectValue<CoinFlipContextModel>;
        return value.value.fields;
    }
    
    return undefined;
};

export interface CoinFlipInteraction {
    digest: string | null;
    sender: string | null;
    timestamp: Date | null;
    interactModel: InteractedWithGameModel | null;
}

// export const getRecentCoinFlipInteractions = async (): Promise<CoinFlipInteraction[]> => {
//     const gqlClient = getGraphQLClient();
//     const result = await gqlClient.query({
//         query: GET_RECENT_COIN_FLIP_TRANSACTIONS,
//     });
//     // console.log(result);
//    
//     const coinFlipPackageId = process.env.NEXT_PUBLIC_INITIAL_COIN_FLIP_PACKAGE_ID;
//     const interactEventType = `${coinFlipPackageId}::game::InteractedWithGame`
//    
//     const data = result.data?.transactionBlocks?.nodes.map((node) => {
//         // @ts-ignore
//         const interactEvent = node.effects?.events?.nodes.find(x => x.contents?.type?.repr == interactEventType);
//        
//         if (!interactEvent) {
//             return undefined;
//         }
//        
//         // @ts-ignore
//         const contents = interactEvent?.contents?.json as InteractedWithGameModel;
//        
//         // @ts-ignore
//         // @ts-ignore
//         return {
//             digest: node.digest ?? null,
//             sender: node.sender?.address ?? null,
//             timestamp: interactEvent?.timestamp ? new Date(interactEvent.timestamp) : null,
//             interactModel: contents
//         }
//     }) || []
//     return data.filter((x) => x !== undefined) as CoinFlipInteraction[];
// }

export const getRecentCoinFlipInteractions = async (coinFlipId: string): Promise<CoinFlipInteraction[]> => {
    const client = getSuiClient();
    const response = await client.queryTransactionBlocks({
        limit: 25,
        order: "descending",
        filter: {
            InputObject: coinFlipId
        },
        options: {
            showEvents: true,
        }
    });
    
    const recentInteractions = response.data.map(x => {
        const event = x.events?.find(ev => ev.type == INTERACT_EVENT_TYPE) ?? undefined;
        if (event) {
            return {
                digest: x.digest as string | null,
                sender: x.transaction?.data?.sender ?? null,
                timestamp: x.timestampMs ? new Date(Number(x.timestampMs)) : null,
                interactModel: event.parsedJson as InteractedWithGameModel | null
            }
        }
        return undefined;
    })
        .filter((interact): interact is CoinFlipInteraction => interact !== undefined);
    
    
    return recentInteractions;
}