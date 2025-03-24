"use server"
import {getSuiClient} from "@/api/sui-client";
import {CoinFlipContextModel, InteractedWithGameModel} from "@/api/models/openplay-coin-flip";
import {DynamicObjectValue} from "@/api/models/shared-models";
import {INTERACT_EVENT_TYPE} from "@/api/coinflip-constants";

export const fetchCoinflipContext = async (contextTableId: string, balanceManagerId: string): Promise<CoinFlipContextModel | undefined> => {
    const client = getSuiClient();
    
    const response = await client.getDynamicFieldObject({
        parentId: contextTableId,
        name: {
            type: "0x2::object::ID",
            value: balanceManagerId
        }
    });
    
    if (response.data?.content?.dataType == "moveObject"){
        const value = response.data.content.fields as unknown as DynamicObjectValue<CoinFlipContextModel>;
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